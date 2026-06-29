const mongoose = require('mongoose');
const Course = require('../models/MongoDB/Course');
const Path = require('../models/MongoDB/Path');
const PathNode = require('../models/MongoDB/PathNode');
const NodeMaterial = require('../models/MongoDB/NodeMaterial');
const UserCourse = require('../models/MongoDB/UserCourse');
const CourseComment = require('../models/MongoDB/CourseComment');
const User = require('../models/MongoDB/User');
const { validateCourseThumbnailDataUrl, saveCourseThumbnailFromDataUrl } = require('../middlewares/courseThumbnailMiddleware');

function normalizeThumbnailInput(thumbnail) {
    if (!thumbnail || typeof thumbnail !== 'string') return null;
    const trimmed = thumbnail.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('/assets/')) return trimmed;
    try {
        const parsed = new URL(trimmed);
        if (parsed.pathname.startsWith('/assets/')) return parsed.pathname;
    } catch {
        // data URL hoặc path tương đối — validateCourseThumbnailDataUrl xử lý
    }
    return trimmed;
}

function isThumbnailDataUrl(thumbnail) {
    return typeof thumbnail === 'string' && thumbnail.trim().startsWith('data:image/');
}

async function assertMentorOwnsCourse(courseId, instructorId) {
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return { ok: false, status: 400, message: 'courseId không hợp lệ.' };
    }
    const course = await Course.findById(courseId).select('instructorId').lean();
    if (!course) {
        return { ok: false, status: 404, message: 'Không tìm thấy khóa học.' };
    }
    if (instructorId && String(course.instructorId) !== String(instructorId)) {
        return { ok: false, status: 403, message: 'Bạn không có quyền cập nhật khóa học này.' };
    }
    return { ok: true, course };
}

// get Students in course
const getStudentsInCourse = async (req, res) => {
    try {
        const courseId = req.params.courseId;

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({
                success: false,
                message: 'courseId không hợp lệ',
            });
        }

        const enrollments = await UserCourse.find({ courseId })
            .populate('userId', 'fullName email avatarUrl dateOfBirth')
            .sort({ enrollmentDate: -1 })
            .lean();

        const students = enrollments.map(e => ({
            userId: e.userId?._id,
            fullName: e.userId?.fullName || '',
            email: e.userId?.email || '',
            avatarUrl: e.userId?.avatarUrl || null,
            dateOfBirth: e.userId?.dateOfBirth || null,
            progressPercentage: e.progressPercentage,
            enrollmentDate: e.enrollmentDate,
        }));

        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách học viên trong khóa học thành công',
            data: students,
        });
    } catch (error) {
        console.error('getStudentsInCourse error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy danh sách học viên trong khóa học',
        });
    }
};

// set public course
const setPublishCourse = async (req, res) => {
    try {
        const courseId = req.params.courseId;

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({
                success: false,
                message: 'courseId không hợp lệ',
            });
        }

        await Course.findByIdAndUpdate(courseId, { isPublished: true, updatedAt: new Date() });

        return res.status(200).json({
            success: true,
            message: 'Set course -> Publish success',
            courseIdUpdate: courseId,
        });
    } catch (error) {
        console.error('setPublishCourse error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server setPublishCourse',
        });
    }
};

// set course -> draft
const setDraftCourse = async (req, res) => {
    try {
        const courseId = req.params.courseId;

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({
                success: false,
                message: 'courseId không hợp lệ',
            });
        }

        await Course.findByIdAndUpdate(courseId, { isPublished: false, updatedAt: new Date() });

        return res.status(200).json({
            success: true,
            message: 'Set course -> Draft success',
            courseIdUpdate: courseId,
        });
    } catch (error) {
        console.error('setDraftCourse error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server setDraftCourse',
        });
    }
};

const updateCourse = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const instructorId = req.user?.userId ?? req.body?.InstructorId ?? null;

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ success: false, message: 'courseId không hợp lệ' });
        }

        const ownership = await assertMentorOwnsCourse(courseId, instructorId);
        if (!ownership.ok) {
            return res.status(ownership.status).json({ success: false, message: ownership.message });
        }

        const {
            CourseName,
            Description,
            Thumbnail,
            CategoryId,
            LevelId,
            IsPublished,
        } = req.body ?? {};

        if (!CourseName || String(CourseName).trim() === '') {
            return res.status(400).json({ success: false, message: 'Thiếu tên khóa học.' });
        }
        if (!Description || String(Description).trim() === '') {
            return res.status(400).json({ success: false, message: 'Thiếu mô tả khóa học.' });
        }
        if (!CategoryId) {
            return res.status(400).json({ success: false, message: 'Thiếu hoặc sai CategoryId.' });
        }
        if (!LevelId) {
            return res.status(400).json({ success: false, message: 'Thiếu hoặc sai LevelId.' });
        }

        // Check if course has students
        const studentCount = await UserCourse.countDocuments({ courseId });

        if (studentCount > 0) {
            const existingCourse = await Course.findById(courseId).lean();
            if (
                String(existingCourse.categoryId) !== String(CategoryId)
                || String(existingCourse.levelId) !== String(LevelId)
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Không thể thay đổi danh mục và trình độ khi khóa học đã có học viên.',
                });
            }
        }

        const courseData = {
            courseName: String(CourseName).trim(),
            description: String(Description).trim(),
            categoryId: CategoryId,
            levelId: LevelId,
            isPublished: Boolean(IsPublished),
            updatedAt: new Date(),
        };

        await Course.findByIdAndUpdate(courseId, courseData);

        let savedThumbnailPath = null;

        if (studentCount === 0) {
            const thumbnailInput = normalizeThumbnailInput(Thumbnail);
            if (thumbnailInput && isThumbnailDataUrl(thumbnailInput)) {
                validateCourseThumbnailDataUrl(thumbnailInput);
                savedThumbnailPath = saveCourseThumbnailFromDataUrl(
                    thumbnailInput,
                    courseId,
                    { replaceExisting: true },
                );
                if (savedThumbnailPath) {
                    await Course.findByIdAndUpdate(courseId, { thumbnail: savedThumbnailPath });
                }
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Cập nhật thông tin khóa học thành công.',
            courseId: courseId,
            thumbnail: savedThumbnailPath,
        });
    } catch (error) {
        console.error('updateCourse error:', error);
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: statusCode === 400 ? error.message : 'Lỗi server khi cập nhật khóa học.',
        });
    }
};

const updateCourseContent = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const instructorId = req.user?.userId ?? req.body?.InstructorId ?? null;
        const paths = req.body?.paths;

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ success: false, message: 'courseId không hợp lệ' });
        }

        if (!Array.isArray(paths)) {
            return res.status(400).json({ success: false, message: 'Thiếu hoặc sai định dạng paths.' });
        }

        const ownership = await assertMentorOwnsCourse(courseId, instructorId);
        if (!ownership.ok) {
            return res.status(ownership.status).json({ success: false, message: ownership.message });
        }

        // Delete existing paths, nodes, and materials for this course
        const existingPaths = await Path.find({ courseId }).select('_id').lean();
        const pathIds = existingPaths.map(p => p._id);
        const existingNodes = await PathNode.find({ pathId: { $in: pathIds } }).select('_id').lean();
        const nodeIds = existingNodes.map(n => n._id);

        await NodeMaterial.deleteMany({ nodeId: { $in: nodeIds } });
        await PathNode.deleteMany({ pathId: { $in: pathIds } });
        await Path.deleteMany({ courseId });

        // Create new paths with nodes
        let totalLessons = 0;
        for (const pathData of paths) {
            const path = await Path.create({
                courseId,
                pathName: String(pathData.PathName || pathData.pathName || '').trim(),
                description: pathData.Description || pathData.description || null,
                order: pathData.PathOrder || pathData.order || 1,
            });

            const nodes = pathData.nodes || pathData.Nodes || [];
            for (const nodeData of nodes) {
                const node = await PathNode.create({
                    pathId: path._id,
                    nodeName: String(nodeData.NodeName || nodeData.nodeName || '').trim(),
                    nodeOrder: nodeData.NodeOrder || nodeData.nodeOrder || 1,
                    description: nodeData.Description || nodeData.description || null,
                });
                totalLessons++;

                // Create materials for this node
                const materials = nodeData.materials || nodeData.Materials || [];
                for (const matData of materials) {
                    const materialType = String(matData.MaterialType || matData.materialType || '').trim().toUpperCase();
                    if (!materialType) continue;

                    await NodeMaterial.create({
                        nodeId: node._id,
                        materialType: materialType,
                        title: String(matData.Title || matData.title || '').trim(),
                        materialUrl: matData.MaterialUrl || matData.materialUrl || null,
                        materialOrder: matData.MaterialOrder || matData.materialOrder || 1,
                        sourceType: matData.SourceType || matData.sourceType || null,
                        fileName: matData.FileName || matData.fileName || null,
                        fileSize: matData.FileSize || matData.fileSize || null,
                        embedUrl: matData.EmbedUrl || matData.embedUrl || null,
                        content: matData.Content || matData.content || null,
                    });
                }
            }
        }

        // Update total lessons
        await Course.findByIdAndUpdate(courseId, { totalLessons, updatedAt: new Date() });

        return res.status(200).json({
            success: true,
            message: 'Nội dung đã được cập nhật.',
            courseId,
        });
    } catch (error) {
        console.error('updateCourseContent error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật nội dung khóa học.',
        });
    }
};

const getCourseCommentsForMentor = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const instructorId = req.user?.userId;

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ success: false, message: 'courseId không hợp lệ', data: [] });
        }

        const ownership = await assertMentorOwnsCourse(courseId, instructorId);
        if (!ownership.ok) {
            return res.status(ownership.status).json({ success: false, message: ownership.message, data: [] });
        }

        const comments = await CourseComment.find({ courseId })
            .populate('userId', 'fullName avatarUrl')
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            message: 'Lấy bình luận thành công',
            data: comments,
        });
    } catch (error) {
        console.error('getCourseCommentsForMentor error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy bình luận',
            data: [],
        });
    }
};

const replyCourseComment = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const commentId = req.params.commentId;
        const instructorId = req.user?.userId;
        const { content } = req.body ?? {};

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ success: false, message: 'courseId không hợp lệ' });
        }
        if (!mongoose.Types.ObjectId.isValid(commentId)) {
            return res.status(400).json({ success: false, message: 'commentId không hợp lệ' });
        }
        if (!instructorId) {
            return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập' });
        }
        if (!content || String(content).trim() === '') {
            return res.status(400).json({ success: false, message: 'Nội dung phản hồi không được để trống' });
        }
        if (String(content).trim().length > 250) {
            return res.status(400).json({ success: false, message: 'Phản hồi không được vượt quá 250 ký tự' });
        }

        const ownership = await assertMentorOwnsCourse(courseId, instructorId);
        if (!ownership.ok) {
            return res.status(ownership.status).json({ success: false, message: ownership.message });
        }

        const comment = await CourseComment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy bình luận' });
        }

        // Add reply to the comment
        comment.replyContent = String(content).trim();
        comment.replyByUserId = instructorId;
        comment.replyAt = new Date();
        await comment.save();

        const updatedComment = await CourseComment.findById(commentId)
            .populate('userId', 'fullName avatarUrl')
            .lean();

        return res.status(200).json({
            success: true,
            message: 'Đã gửi phản hồi',
            data: updatedComment,
        });
    } catch (error) {
        console.error('replyCourseComment error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server khi gửi phản hồi' });
    }
};

const createCourseCommentForMentor = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const instructorId = req.user?.userId;
        const { content } = req.body ?? {};

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ success: false, message: 'courseId không hợp lệ' });
        }
        if (!instructorId) {
            return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập' });
        }
        if (!content || String(content).trim() === '') {
            return res.status(400).json({ success: false, message: 'Nội dung bình luận không được để trống' });
        }
        if (String(content).trim().length > 250) {
            return res.status(400).json({ success: false, message: 'Bình luận không được vượt quá 250 ký tự' });
        }

        const ownership = await assertMentorOwnsCourse(courseId, instructorId);
        if (!ownership.ok) {
            return res.status(ownership.status).json({ success: false, message: ownership.message });
        }

        const comment = await CourseComment.create({
            courseId,
            userId: instructorId,
            rating: null,
            content: String(content).trim(),
        });

        const populatedComment = await CourseComment.findById(comment._id)
            .populate('userId', 'fullName avatarUrl')
            .lean();

        return res.status(201).json({
            success: true,
            message: 'Gửi bình luận thành công',
            data: populatedComment,
        });
    } catch (error) {
        console.error('createCourseCommentForMentor error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server khi gửi bình luận' });
    }
};

module.exports = {
    getStudentsInCourse,
    setPublishCourse,
    setDraftCourse,
    updateCourse,
    updateCourseContent,
    getCourseCommentsForMentor,
    replyCourseComment,
    createCourseCommentForMentor,
};
