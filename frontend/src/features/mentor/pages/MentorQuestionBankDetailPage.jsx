/**
 * MentorQuestionBankDetailPage — UI shell (paths list + editor), không fetch API.
 */
import { useEffect, useMemo, useState } from 'react';
import { Box, Typography, alpha, useTheme } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import AppButton from '@/shared/ui/AppButton';
import EmptyState from '@/shared/ui/EmptyState';
import { toast } from '@/shared/ui/Toast';
import ScrollToTopButton from '@/shared/ui/ScrollToTopButton';
import MentorQuestionBankBuilderPanel from '@/features/mentor/components/questionBank/MentorQuestionBankBuilderPanel';
import MentorQuestionBankDetailHeader from '@/features/mentor/components/questionBank/MentorQuestionBankDetailHeader';
import MentorQuestionBankOutlinePanel from '@/features/mentor/components/questionBank/MentorQuestionBankOutlinePanel';
import MentorQuestionBankSkillNav from '@/features/mentor/components/questionBank/MentorQuestionBankSkillNav';
import useQuestionBankEditorUi from '@/features/mentor/hooks/useQuestionBankEditorUi';
import { PRIMARY, MUTED, TEXT } from '@/features/mentor/components/course/mentorCourseCreateStyles';
import {
  countActiveQuestionsBySkill,
  getFilledQuestionCount,
} from '@/features/mentor/utils/mentorTestContentUtils';
import { formatMentorCourseDate } from '@/features/mentor/utils/mentorCourseUtils';
import {
  getMockChaptersForCourse,
  getMockCourseFromQuestionBank,
} from '@/features/mentor/data/mentorQuestionBankMock';
import axios from 'axios';

//________ChapTer Card__________
function PathChapterCard({ path, index, onOpen }) {
  const theme = useTheme();
  const label = path.displayLabel || path.PathName || `Chương #${path.PathId}`;
  const chapterNumber = path.Order ?? index + 1;
  const questionCount = Number(path.QuestionCount) || 0;

  return (
    <Box
      component="button"
      type="button"
      onClick={() => onOpen(path)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        width: '100%',
        textAlign: 'left',
        p: 2,
        borderRadius: '20px',
        bgcolor: '#FFFFFF',
        border: `1px solid ${alpha('#0F172A', 0.08)}`,
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.15s',
        boxShadow: theme.ios18?.shadow?.sm ?? 'none',
        '&:hover': {
          borderColor: alpha(PRIMARY, 0.28),
          boxShadow: theme.ios18?.shadow?.md ?? `0 8px 24px ${alpha('#0F172A', 0.08)}`,
          transform: 'translateY(-1px)',
        },
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '14px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: alpha(PRIMARY, 0.1),
          color: PRIMARY,
          fontSize: 18,
          fontWeight: 800,
        }}
      >
        {path.Order}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: 16,
            fontWeight: 700,
            color: TEXT,
            mb: 0.35,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {path.PathName}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <QuizOutlinedIcon sx={{ fontSize: 15, color: MUTED }} />
          <Typography sx={{ fontSize: 13, color: MUTED }}>{questionCount} câu hỏi</Typography>
        </Box>
      </Box>

      <ChevronRightRoundedIcon sx={{ fontSize: 22, color: MUTED, flexShrink: 0 }} />
    </Box>
  );
}
//________________________________________________________
//________________________________________________________
export default function MentorQuestionBankDetailPage() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  // const courseId = searchParams.get('courseId') ?? '3';
  const chapterId = searchParams.get('chapterId') ?? '';
  // const isEditorMode = searchParams.get('mode') === 'editor';
  // const isPathListMode = !chapterId;

  // const course = getMockCourseFromQuestionBank(courseId);
  const [course, setCourse] = useState();
  // const [questionBankPaths, setQuestionBankPaths] = useState([])
  const [coursePaths, setCoursePaths] = useState([])
  useEffect(() => {
    const fetchData = async () => {
      try {

        const [resCourse, resCoursePaths] = await Promise.all(
          [
            axios.get(`http://localhost:5000/api/courses/my-courses/${courseId}?tab=course`),
            // axios.get(`http://localhost:5000/api/question-bank/getBankPaths/${questionBankId}`),
            axios.get(`http://localhost:5000/api/courses/my-courses/${courseId}/chapters`)
          ]
        )

        setCourse(resCourse.data.data[0])
        // setQuestionBankPaths(resQuestionBankPaths.data.data)
        setCoursePaths(resCoursePaths.data.data.Paths)
      } catch (error) {
        console.error(error.message)
      }
    }
    fetchData();

  }, [courseId])
  const courseChapters = getMockChaptersForCourse(courseId);
  const selectedChapter = courseChapters.find(
    (item) => String(item.PathId) === String(chapterId),
  );

  // const bank = useMemo(
  //   () => ({
  //     id: questionBankId,
  //     courseId: Number(courseId) || courseId,
  //     courseTitle: course?.CourseName ?? `Khóa học #${courseId}`,
  //     chapterId: chapterId ? Number(chapterId) : null,
  //     PathName: selectedChapter?.PathName ?? '',
  //     title: selectedChapter?.PathName ?? 'Ngân hàng câu hỏi',
  //     updatedAt: course?.CourseUpdateAt,
  //   }),
  //   [questionBankId, courseId, course, chapterId, selectedChapter],
  // );

  const bankPaths = useMemo(
    () =>
      courseChapters.map((path, index) => ({
        ...path,
        displayLabel: `Chương ${path.Order ?? index + 1}: ${path.PathName}`,
        QuestionCount: 0,
      })),
    [courseChapters],
  );

  const workspaceKey = `${courseId}-${chapterId || 'none'}`;

  const {
    sections,
    sectionErrors,
    activeSkill,
    activeSection,
    activeSectionIndex,
    skillSections,
    activeSectionId,
    canDeleteActiveSection,
    handleSectionChange,
    handleDeleteSection,
    handleSkillSelect,
    handleSectionSelect,
    handleAddBai,
    handleOutlineNavigate,
  } = useQuestionBankEditorUi({ resetKey: chapterId || null });

  const questionCount = useMemo(() => getFilledQuestionCount(sections), [sections]);

  const questionCountBySkill = useMemo(
    () => countActiveQuestionsBySkill(sections),
    [sections],
  );

  const courseCategory = useMemo(
    () => [course?.CategoryDisplayName, course?.LevelDisplayName].filter(Boolean).join(' · '),
    [course],
  );

  const openPath = (path) => {
    navigate(`/mentor/question-banks/${courseId}/${path.PathId}`, {
      state: {
        courseName: course?.CourseName,
        pathName: path.PathName,
        pathOrder: path.Order,
        coursePublished: course?.IsPublished,
        categoryName: course?.CategoryDisplayName ?? course?.categoryName,
        levelName: course?.LevelDisplayName ?? course?.levelName,
      },
    });
  };

  const selectChapter = (nextChapterId) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('courseId', courseId);
        next.set('chapterId', String(nextChapterId));
        next.set('mode', 'editor');
        return next;
      },
      { replace: true },
    );
  };

  const handleSubmit = () => {
    toast.info('Logic lưu question bank sẽ được implement lại.');
  };

  const footerActions = (
    <AppButton
      startIcon={<SaveOutlinedIcon />}
      onClick={handleSubmit}
      fullWidth
      sx={{
        height: 44,
        fontSize: 14,
        fontWeight: 700,
        borderRadius: '999px',
        bgcolor: PRIMARY,
        color: '#fff',
        boxShadow: 'none',
        '&:hover': { bgcolor: '#0E7490', boxShadow: 'none' },
      }}
    >
      Lưu ngân hàng
    </AppButton>
  );

  return (
    <Box sx={{ width: '100%', maxWidth: 1280, mx: 'auto', py: 2 }}>
      <Box sx={{ mb: 2 }}>
        <AppButton
          variant="text"
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate('/mentor/question-banks')}
          sx={{
            height: 36,
            px: 0.5,
            color: MUTED,
            fontWeight: 600,
            fontSize: 13,
            '&:hover': { bgcolor: 'transparent', color: PRIMARY },
          }}
        >
          Quay lại danh sách
        </AppButton>
      </Box>

      <Box
        sx={{
          mb: 2.5,
          p: { xs: 2, sm: 2.5 },
          borderRadius: '22px',
          background: `linear-gradient(135deg, ${alpha(PRIMARY, 0.09)} 0%, #fff 70%)`,
          border: `1px solid ${alpha(PRIMARY, 0.14)}`,
        }}
      >
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: PRIMARY, mb: 0.75 }}>
          NGÂN HÀNG CÂU HỎI
        </Typography>
        <Typography sx={{ fontSize: { xs: 22, sm: 26 }, fontWeight: 800, color: TEXT, mb: 0.5 }}>
          {course?.CourseName ?? 'Đang tải khóa học...'}
        </Typography>
        <Typography sx={{ fontSize: 14, color: MUTED }}>
          {/* {courseCategory ? `${courseCategory} · ` : ''}
          {bankPaths.length} chương · {totalQuestions} câu hỏi
          {bank.updatedAt ? ` · Cập nhật ${formatMentorCourseDate(bank.updatedAt)}` : ''} */}
        </Typography>
        <Typography sx={{ fontSize: 13, color: MUTED, mt: 1 }}>
          Chọn chương để quản lý câu hỏi
        </Typography>
      </Box>

      {/* <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <AppButton
          onClick={() => navigate(`/mentor/question-banks/manage?courseId=${courseId}`)}
          sx={{ height: 40, borderRadius: '999px', bgcolor: PRIMARY, boxShadow: 'none' }}
        >
          Thêm chương
        </AppButton>
      </Box> */}

      {/* {bankPaths.length === 0 ? (
        <EmptyState
          icon={MenuBookOutlinedIcon}
          title="Chưa có chương nào trong ngân hàng"
          description="Tạo ngân hàng câu hỏi cho một chương để bắt đầu."
          actionLabel="Thêm chương"
          onAction={() => navigate(`/mentor/question-banks/manage?courseId=${courseId}`)}
        />
      ) : ( */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          gap: 1.5,
        }}
      >
        {coursePaths.map((path, index) => (
          <PathChapterCard
            key={path.PathId}
            path={path}
            index={index}
            onOpen={openPath}
          />
        ))}
      </Box>
      {/* )} */}
    </Box>
  );

}