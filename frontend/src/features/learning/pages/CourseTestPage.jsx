import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Breadcrumbs,
  CircularProgress,
  Link as MuiLink,
  Typography,
} from '@mui/material';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AppButton from '@/shared/ui/AppButton';
import ConfirmDialog from '@/shared/ui/ConfirmDialog';
import EmptyState from '@/shared/ui/EmptyState';
import TestIntroPanel from '@/features/learning/components/test/TestIntroPanel';
import TestHeader from '@/features/learning/components/test/TestHeader';
import TestSkillNav, { SKILL_SHORT_LABELS } from '@/features/learning/components/test/TestSkillNav';
import {
  TEST_SKILL_CHIP_COLORS,
  TEST_SKILL_LISTENING,
} from '@/features/mentor/utils/mentorTestContentUtils';
import TestSkillSection from '@/features/learning/components/test/TestSkillSection';
import TestSectionToolbar from '@/features/learning/components/test/TestSectionToolbar';
import {
  getTestMeta,
  startTestAttempt,
  submitTestAttempt,
} from '@/features/learning/services/courseTestService';
import TestResultPanel from '@/features/learning/components/test/TestResultPanel';
import { flattenPaperQuestions, getSectionQuestionGroups } from '@/features/learning/utils/courseTestPaperUtils';
import { TEST_LEAVE_DIALOG, useTestLeaveGuard } from '@/features/learning/hooks/useTestLeaveGuard';
import { TEST_MUTED, TEST_TEXT } from '@/features/learning/components/test/testTheme';

const PAGE_STATE = {
  LOADING: 'loading',
  INTRO: 'intro',
  IN_PROGRESS: 'in_progress',
  SUBMITTING: 'submitting',
  RESULT: 'result',
  ERROR: 'error',
};

/**
 * Component chính quản lý giao diện làm bài kiểm tra (bao gồm bài kiểm tra chương và cuối khóa).
 * Thực hiện quản lý toàn bộ luồng từ lúc hiển thị giới thiệu, đếm ngược làm bài, cho đến khi nộp bài và xem kết quả.
 */
export default function CourseTestPage() {
  const { courseId, scope, chapterId } = useParams();
  const navigate = useNavigate();
  const learnPath = `/my-courses/${courseId}/learn`;

  const [pageState, setPageState] = useState(PAGE_STATE.LOADING);
  const [meta, setMeta] = useState(null);
  const [paper, setPaper] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [result, setResult] = useState(null);
  const [answers, setAnswers] = useState({});
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [starting, setStarting] = useState(false);
  const [activeSkillType, setActiveSkillType] = useState(TEST_SKILL_LISTENING);
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);

  const autoSubmittedRef = useRef(false);
  const submitInFlightRef = useRef(false);

  const normalizedScope = scope === 'final' ? 'final' : 'chapter';
  const resolvedChapterId = normalizedScope === 'final' ? null : chapterId;

  const allQuestions = useMemo(
    () => flattenPaperQuestions(paper),
    [paper],
  );

  const answeredCount = useMemo(
    () => allQuestions.filter((question) => (answers[question.tempId] ?? []).length > 0).length,
    [allQuestions, answers],
  );

  const unansweredCount = allQuestions.length - answeredCount;

  const activeSection = useMemo(
    () => (paper?.sections ?? []).find((section) => section.skillType === activeSkillType) ?? null,
    [paper, activeSkillType],
  );

  const activeSectionColors = TEST_SKILL_CHIP_COLORS[activeSkillType]
    ?? TEST_SKILL_CHIP_COLORS[TEST_SKILL_LISTENING];

  const questionGroups = useMemo(
    () => getSectionQuestionGroups(activeSection),
    [activeSection],
  );

  const activeGroup = questionGroups[activeGroupIndex] ?? null;
  const canGoGroupBack = activeGroupIndex > 0;
  const canGoGroupNext = activeGroupIndex < questionGroups.length - 1;

  useEffect(() => {
    setActiveGroupIndex(0);
  }, [activeSkillType]);

  const isTestActive =
    pageState === PAGE_STATE.IN_PROGRESS || pageState === PAGE_STATE.SUBMITTING;

  const {
    dialogOpen: leaveDialogOpen,
    confirmLeave,
    cancelLeave,
    allowLeave,
  } = useTestLeaveGuard(isTestActive);

  /**
   * Tải thông tin chung (metadata) của bài kiểm tra (tiêu đề, thời gian làm bài, số câu...) từ server.
   */
  const loadMeta = useCallback(async () => {
    setPageState(PAGE_STATE.LOADING);
    setErrorMessage('');

    const res = await getTestMeta(courseId, normalizedScope, resolvedChapterId, {
      chapterTitle: resolvedChapterId ? `Chương #${resolvedChapterId}` : null,
    });

    if (!res.ok) {
      setErrorMessage(res.message ?? 'Không tải được thông tin bài kiểm tra.');
      setPageState(PAGE_STATE.ERROR);
      return;
    }

    setMeta(res.meta);
    setPageState(PAGE_STATE.INTRO);
  }, [courseId, normalizedScope, resolvedChapterId]);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  /**
   * Cập nhật danh sách câu trả lời của học viên khi họ chọn hoặc thay đổi phương án của một câu hỏi.
   */
  const handleAnswerChange = useCallback((questionTempId, selectedOptionTempIds) => {
    setAnswers((prev) => ({
      ...prev,
      [questionTempId]: selectedOptionTempIds,
    }));
  }, []);

  /**
   * Gửi bài làm lên server để chấm điểm, nhận kết quả chi tiết và chuyển đổi giao diện sang chế độ hiển thị kết quả.
   */
  const handleSubmit = useCallback(async (options = {}) => {
    if (!attempt?.attemptId || submitInFlightRef.current) return;

    submitInFlightRef.current = true;
    setPageState(PAGE_STATE.SUBMITTING);
    setConfirmSubmitOpen(false);

    const timeSpentSeconds = totalSeconds - remainingSeconds;
    const res = await submitTestAttempt(courseId, resolvedChapterId, attempt.attemptId, answers, timeSpentSeconds, allQuestions.length);

    submitInFlightRef.current = false;

    if (!res.ok) {
      setErrorMessage(res.message ?? 'Nộp bài thất bại.');
      setPageState(PAGE_STATE.IN_PROGRESS);
      return;
    }

    setMeta(res.meta);
    setAttempt(res.attempt);
    setResult(res.result);
    allowLeave();
    setPageState(PAGE_STATE.RESULT);
  }, [attempt, answers, allowLeave]);

  useEffect(() => {
    if (pageState !== PAGE_STATE.IN_PROGRESS || !attempt?.attemptId) return undefined;

    autoSubmittedRef.current = false;

    const tick = () => {
      const expiresAt = new Date(attempt.expiresAt).getTime();
      const nextRemaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setRemainingSeconds(nextRemaining);

      if (nextRemaining <= 0 && !autoSubmittedRef.current) {
        autoSubmittedRef.current = true;
        handleSubmit({ autoExpired: true });
      }
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [pageState, attempt, handleSubmit]);

  /**
   * Khởi tạo và bắt đầu lượt làm bài kiểm tra. Gọi API lấy đề thi, reset câu trả lời và bắt đầu đếm ngược thời gian.
   */
  const handleStart = async () => {
    setStarting(true);
    setErrorMessage('');

    const res = await startTestAttempt(courseId, normalizedScope, resolvedChapterId, {
      chapterTitle: meta?.chapterTitle ?? (resolvedChapterId ? `Chương #${resolvedChapterId}` : null),
    });

    setStarting(false);

    if (!res.ok) {
      setErrorMessage(res.message ?? 'Không thể bắt đầu bài kiểm tra.');
      return;
    }

    setMeta(res.meta);
    setPaper(res.paper);
    setAttempt(res.attempt);
    setAnswers({});
    setResult(null);
    setActiveSkillType(res.paper?.sections?.[0]?.skillType ?? TEST_SKILL_LISTENING);
    setActiveGroupIndex(0);
    setRemainingSeconds(res.attempt.remainingSeconds ?? res.meta.timeLimitMinutes * 60);
    setTotalSeconds((res.meta.timeLimitMinutes ?? res.attempt.timeLimitMinutes ?? 15) * 60);
    setPageState(PAGE_STATE.IN_PROGRESS);
  };

  /**
   * Xóa sạch trạng thái bài làm cũ và gọi hàm tải lại thông tin bài kiểm tra để người dùng chuẩn bị làm lại từ đầu.
   */
  const handleRetry = async () => {
    setPaper(null);
    setAttempt(null);
    setAnswers({});
    setResult(null);
    await loadMeta();
  };

  /**
   * Điều hướng người dùng quay trở lại trang giao diện học tập của khóa học hiện tại.
   */
  const handleBackToLearn = () => {
    navigate(learnPath);
  };

  const breadcrumbTitle =
    normalizedScope === 'final' ? 'Bài kiểm tra toàn khóa' : 'Bài kiểm tra chương';

  const hideBreadcrumb =
    pageState === PAGE_STATE.IN_PROGRESS || pageState === PAGE_STATE.SUBMITTING;

  // 1. Giao diện tải dữ liệu (Loading Spinner)
  if (pageState === PAGE_STATE.LOADING) {
    return (
      <Box sx={{ maxWidth: 960, mx: 'auto', py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={36} />
      </Box>
    );
  }

  // 2. Giao diện thông báo lỗi (khi không tải được bài kiểm tra)
  if (pageState === PAGE_STATE.ERROR) {
    return (
      <Box sx={{ maxWidth: 960, mx: 'auto' }}>
        <EmptyState
          title="Không tải được bài kiểm tra"
          description={errorMessage || 'Vui lòng thử lại sau.'}
          action={
            <AppButton variant="outlined" onClick={handleBackToLearn}>
              Quay lại học
            </AppButton>
          }
        />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: pageState === PAGE_STATE.IN_PROGRESS || pageState === PAGE_STATE.SUBMITTING ? 1180 : 960, mx: 'auto', pb: 6 }}>
      {/* Thanh điều hướng breadcrumbs (chỉ hiện khi chưa bắt đầu làm bài) */}
      {!hideBreadcrumb && (
        <Breadcrumbs
          separator="/"
          sx={{ mb: 2.5, '& .MuiBreadcrumbs-separator': { color: TEST_MUTED, mx: 0.5 } }}
        >
          <MuiLink
            component={Link}
            to="/my-courses"
            underline="hover"
            sx={{ fontSize: 13, color: TEST_MUTED, fontWeight: 500 }}
          >
            Khóa học của tôi
          </MuiLink>
          <MuiLink
            component={Link}
            to={learnPath}
            underline="hover"
            sx={{ fontSize: 13, color: TEST_MUTED, fontWeight: 500 }}
          >
            Học bài
          </MuiLink>
          <Typography sx={{ fontSize: 13, color: TEST_TEXT, fontWeight: 600 }}>
            {breadcrumbTitle}
          </Typography>
        </Breadcrumbs>
      )}

      {/* Thông báo lỗi khi khởi tạo lượt thi thất bại */}
      {errorMessage && pageState === PAGE_STATE.INTRO && (
        <Typography sx={{ fontSize: 14, color: '#DC2626', fontWeight: 600, mb: 2 }}>
          {errorMessage}
        </Typography>
      )}

      {/* Màn hình giới thiệu thông tin bài thi trước khi bắt đầu (tên bài, thời gian, số câu, điểm tối thiểu...) */}
      {pageState === PAGE_STATE.INTRO && (
        <TestIntroPanel
          meta={meta}
          loading={starting}
          onStart={handleStart}
          onBack={handleBackToLearn}
        />
      )}

      {/* Màn hình phòng thi (khi đang làm bài hoặc đang nộp bài) */}
      {(pageState === PAGE_STATE.IN_PROGRESS || pageState === PAGE_STATE.SUBMITTING) && paper && (
        <>
          {/* Thanh tiêu đề thi chứa tên bài, đồng hồ đếm ngược và nút nộp bài */}
          <TestHeader
            meta={meta}
            answeredCount={answeredCount}
            totalQuestions={allQuestions.length}
            remainingSeconds={remainingSeconds}
            totalSeconds={totalSeconds}
            onSubmit={() => setConfirmSubmitOpen(true)}
            submitting={pageState === PAGE_STATE.SUBMITTING}
          />

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { md: 'flex-start' },
              gap: 2.5,
            }}
          >
            {/* Thanh menu bên trái — Nghe / Đọc / Từ vựng–Ngữ pháp */}
            <TestSkillNav
              sections={paper.sections ?? []}
              activeSkillType={activeSkillType}
              answers={answers}
              onSelect={setActiveSkillType}
            />

            {/* Phần hiển thị câu hỏi của kỹ năng đang chọn */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {activeSection && activeGroup && (
                <>
                  {/* Thanh điều khiển nhóm câu hỏi đang hiển thị (nhóm 1/3...) kèm nút chuyển trang trước/sau */}
                  <TestSectionToolbar
                    title={SKILL_SHORT_LABELS[activeSection.skillType] ?? activeSection.displayName}
                    groupLabel={
                      questionGroups.length > 1
                        ? `Nhóm ${activeGroupIndex + 1}/${questionGroups.length}: ${activeGroup.displayName}`
                        : activeGroup.displayName
                    }
                    groupMeta={`${activeGroup.questions?.length ?? 0} câu`}
                    accentColor={activeSectionColors.color}
                    accentBg={activeSectionColors.bg}
                    canGoBack={canGoGroupBack}
                    canGoNext={canGoGroupNext}
                    onBack={() => setActiveGroupIndex((prev) => Math.max(0, prev - 1))}
                    onNext={() =>
                      setActiveGroupIndex((prev) =>
                        Math.min(questionGroups.length - 1, prev + 1),
                      )
                    }
                  />

                  {/* Danh sách các câu hỏi cụ thể và các phương án chọn lựa trắc nghiệm */}
                  <TestSkillSection
                    section={activeSection}
                    answers={answers}
                    onAnswerChange={handleAnswerChange}
                    hideHeader
                    activeGroup={activeGroup}
                  />
                </>
              )}
            </Box>
          </Box>
        </>
      )}

      {/* Màn hình kết quả sau khi nộp bài thành công (hiển thị điểm, tỉ lệ đúng/sai, đáp án chi tiết) */}
      {pageState === PAGE_STATE.RESULT && result && (
        <TestResultPanel
          meta={meta}
          result={result}
          paper={paper}
          onRetry={handleRetry}
          onBack={handleBackToLearn}
        />
      )}

      {/* Hộp thoại Popup xác nhận nộp bài (cảnh báo nếu học viên còn câu hỏi chưa điền đáp án) */}
      <ConfirmDialog
        open={confirmSubmitOpen}
        onClose={() => setConfirmSubmitOpen(false)}
        onConfirm={() => handleSubmit()}
        title="Nộp bài kiểm tra?"
        message={
          unansweredCount > 0
            ? `Bạn còn ${unansweredCount} câu chưa trả lời. Bạn có chắc muốn nộp bài không?`
            : 'Bạn đã trả lời đủ câu hỏi. Xác nhận nộp bài?'
        }
        confirmLabel="Nộp bài"
        cancelLabel="Tiếp tục làm"
        loading={pageState === PAGE_STATE.SUBMITTING}
      />

      {/* Hộp thoại Popup cảnh báo khi học viên cố gắng rời trang lúc đang làm bài thi */}
      <ConfirmDialog
        open={leaveDialogOpen}
        onClose={cancelLeave}
        onConfirm={confirmLeave}
        title={TEST_LEAVE_DIALOG.title}
        message={TEST_LEAVE_DIALOG.message}
        confirmLabel={TEST_LEAVE_DIALOG.confirmLabel}
        cancelLabel={TEST_LEAVE_DIALOG.cancelLabel}
        destructive
      />
    </Box>
  );
}
