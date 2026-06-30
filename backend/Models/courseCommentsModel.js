const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const CourseComment = require('./MongoDB/CourseComment');
const User = require('./MongoDB/User');
const Course = require('./MongoDB/Course');

const getCourseComments = async (courseId) => {
  const comments = await CourseComment.find({ courseId: new ObjectId(courseId) })
    .populate('userId', 'fullName avatarUrl')
    .populate({
      path: 'courseId',
      select: 'instructorId',
    })
    .sort({ createdAt: -1 })
    .lean();

  return comments.map(cc => {
    const course = cc.courseId;
    const isInstructor = course && cc.userId && String(cc.userId._id) === String(course.instructorId) ? 1 : 0;
    return {
      CommentId: cc._id.toString(),
      CourseId: cc.courseId?._id?.toString() || cc.courseId?.toString(),
      UserId: cc.userId?._id?.toString() || cc.userId?.toString(),
      Rating: cc.rating,
      Content: cc.content,
      CreatedAt: cc.createdAt,
      ReplyContent: cc.replyContent || null,
      ReplyAt: cc.replyAt || null,
      ReplyByUserId: cc.replyByUserId ? cc.replyByUserId.toString() : null,
      FullName: cc.userId?.fullName || 'Học viên',
      AvatarUrl: cc.userId?.avatarUrl || null,
      ReplyByName: null,
      IsInstructor: isInstructor,
    };
  });
};

const createCourseComment = async ({ courseId, userId, rating, content }) => {
  const comment = await CourseComment.create({
    courseId: new ObjectId(courseId),
    userId: new ObjectId(userId),
    rating: rating ?? null,
    content: String(content).trim(),
    createdAt: new Date(),
  });

  const user = await User.findById(userId).select('fullName avatarUrl').lean();
  const course = await Course.findById(courseId).select('instructorId').lean();
  const isInstructor = course && String(userId) === String(course.instructorId) ? 1 : 0;

  return {
    CommentId: comment._id.toString(),
    CourseId: courseId,
    UserId: userId,
    Rating: rating ?? null,
    Content: String(content).trim(),
    CreatedAt: comment.createdAt,
    FullName: user?.fullName || 'Học viên',
    AvatarUrl: user?.avatarUrl || null,
    IsInstructor: isInstructor,
  };
};

const replyToCourseComment = async ({ courseId, commentId, mentorUserId, replyContent }) => {
  const comment = await CourseComment.findOneAndUpdate(
    { _id: new ObjectId(commentId), courseId: new ObjectId(courseId) },
    {
      replyContent: String(replyContent).trim(),
      replyAt: new Date(),
      replyByUserId: new ObjectId(mentorUserId),
    },
    { new: true },
  ).lean();

  if (!comment) return null;

  const user = await User.findById(comment.userId).select('fullName avatarUrl').lean();
  const mentor = await User.findById(mentorUserId).select('fullName').lean();
  const course = await Course.findById(courseId).select('instructorId').lean();
  const isInstructor = course && String(comment.userId) === String(course.instructorId) ? 1 : 0;

  return {
    CommentId: comment._id.toString(),
    CourseId: courseId,
    UserId: comment.userId.toString(),
    Rating: comment.rating,
    Content: comment.content,
    CreatedAt: comment.createdAt,
    ReplyContent: comment.replyContent,
    ReplyAt: comment.replyAt,
    ReplyByUserId: comment.replyByUserId?.toString(),
    FullName: user?.fullName || 'Học viên',
    AvatarUrl: user?.avatarUrl || null,
    ReplyByName: mentor?.fullName || 'Mentor',
    IsInstructor: isInstructor,
  };
};

module.exports = {
  getCourseComments,
  createCourseComment,
  replyToCourseComment,
};
