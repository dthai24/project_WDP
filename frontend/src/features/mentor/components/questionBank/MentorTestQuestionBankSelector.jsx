/**
 * Chọn / hiển thị bank chương cho Quiz (mỗi chương 1 bank).
 */
import { useEffect, useMemo, useState } from 'react';
import { Box, CircularProgress, Typography, alpha } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import { Link as RouterLink } from 'react-router-dom';
import AppButton from '@/shared/ui/AppButton';
import { getQuestionBankByChapter } from '@/features/mentor/services/questionBankService';
import { getQuestionCount } from '@/features/mentor/utils/mentorTestContentUtils';
import { MUTED, PRIMARY, TEXT } from '@/features/mentor/components/course/mentorCourseCreateStyles';

function buildCreateUrl(courseId, chapterId) {
  const params = new URLSearchParams({
    courseId: String(courseId),
    chapterId: String(chapterId),
  });
  return `/mentor/question-banks/create?${params.toString()}`;
}

export default function MentorTestQuestionBankSelector({
  courseId,
  chapterId = null,
  value = null,
  onChange,
  disabled = false,
  error,
}) {
  const [bank, setBank] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!courseId || chapterId == null || chapterId === '') {
      setBank(null);
      return;
    }
    let mounted = true;
    setLoading(true);
    getQuestionBankByChapter(courseId, chapterId)
      .then((res) => {
        if (!mounted) return;
        setBank(res.ok ? res.bank : null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [courseId, chapterId]);

  const questionCount = useMemo(() => getQuestionCount(bank?.sections ?? []), [bank]);

  useEffect(() => {
    if (!bank || disabled) return;
    if (String(value) === String(bank.id)) return;
    onChange?.({
      QuestionBankId: bank.id,
      QuestionBankTitle: bank.title,
      TestSource: 'CHAPTER_QUIZ',
      Sections: bank.sections ?? [],
      TotalScore: 100,
    });
  }, [bank, value, disabled, onChange]);

  if (!courseId) {
    return (
      <Box
        sx={{
          p: 2,
          borderRadius: '14px',
          bgcolor: alpha(PRIMARY, 0.04),
          border: `1px dashed ${alpha(PRIMARY, 0.2)}`,
        }}
      >
        <Typography sx={{ fontSize: 13, color: MUTED, lineHeight: 1.55 }}>
          Lưu khóa học trước, sau đó gắn quiz chương với ngân hàng câu hỏi của chương đó.
        </Typography>
      </Box>
    );
  }

  if (chapterId == null || chapterId === '') {
    return (
      <Box
        sx={{
          p: 2,
          borderRadius: '14px',
          bgcolor: alpha('#7C3AED', 0.04),
          border: `1px dashed ${alpha('#7C3AED', 0.2)}`,
        }}
      >
        <Typography sx={{ fontSize: 13, color: MUTED, lineHeight: 1.55 }}>
          Lưu chương trước khi gắn quiz. Quiz chương lấy câu hỏi từ bank của chương tương ứng.
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 2 }}>
        <CircularProgress size={20} sx={{ color: PRIMARY }} />
        <Typography sx={{ fontSize: 13, color: MUTED }}>Đang tải bank chương...</Typography>
      </Box>
    );
  }

  if (!bank) {
    return (
      <Box
        sx={{
          p: 2.5,
          borderRadius: '14px',
          border: '1px dashed rgba(15,23,42,0.12)',
          bgcolor: '#fff',
          textAlign: 'center',
        }}
      >
        <QuizOutlinedIcon sx={{ fontSize: 36, color: '#CBD5E1', mb: 1 }} />
        <Typography sx={{ fontSize: 14, fontWeight: 600, color: TEXT, mb: 0.5 }}>
          Chương chưa có ngân hàng câu hỏi
        </Typography>
        <Typography sx={{ fontSize: 13, color: MUTED, mb: 2, lineHeight: 1.5 }}>
          Mỗi chương có một bank riêng. Tạo bank cho chương này trước khi thêm quiz.
        </Typography>
        <AppButton
          component={RouterLink}
          to={buildCreateUrl(courseId, chapterId)}
          startIcon={<AddRoundedIcon />}
          sx={{
            height: 36,
            px: 2,
            fontSize: 13,
            fontWeight: 600,
            borderRadius: '999px',
            bgcolor: PRIMARY,
            color: '#fff',
            boxShadow: 'none',
            '&:hover': { bgcolor: '#0E7490', boxShadow: 'none' },
          }}
        >
          Tạo bank cho chương
        </AppButton>
        {error && (
          <Typography sx={{ fontSize: 11, color: '#DC2626', mt: 1.25 }}>{error}</Typography>
        )}
      </Box>
    );
  }

  return (
    <Box>
      <Typography sx={{ fontSize: 12, fontWeight: 700, color: MUTED, mb: 0.75 }}>
        Ngân hàng câu hỏi chương
      </Typography>
      <Box
        sx={{
          p: 1.25,
          borderRadius: '12px',
          bgcolor: alpha(PRIMARY, 0.04),
          border: `1px solid ${error ? 'rgba(220,38,38,0.35)' : alpha(PRIMARY, 0.12)}`,
        }}
      >
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: TEXT }}>
          {bank.title}
        </Typography>
        <Typography sx={{ fontSize: 12, color: MUTED, mt: 0.25 }}>
          {bank.chapterTitle ? `Chương: ${bank.chapterTitle}` : 'Theo chương'} · {questionCount}{' '}
          câu hỏi
        </Typography>
        {bank.description && (
          <Typography sx={{ fontSize: 12, color: MUTED, mt: 0.5, lineHeight: 1.45 }}>
            {bank.description}
          </Typography>
        )}
      </Box>
      {error && (
        <Typography sx={{ fontSize: 11, color: '#DC2626', mt: 0.35 }}>{error}</Typography>
      )}
      {questionCount === 0 && (
        <Typography sx={{ fontSize: 12, color: '#EA580C', mt: 0.75 }}>
          Bank chương chưa có câu hỏi. Thêm câu hỏi trong Ngân hàng câu hỏi.
        </Typography>
      )}
    </Box>
  );
}
