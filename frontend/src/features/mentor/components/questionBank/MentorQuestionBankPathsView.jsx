/**
 * Danh sách chương có ngân hàng câu hỏi (theo BankId).
 */
import { Box, Typography, alpha, useTheme } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import AppButton from '@/shared/ui/AppButton';
import EmptyState from '@/shared/ui/EmptyState';
import { formatMentorCourseDate } from '@/features/mentor/utils/mentorCourseUtils';
import { MUTED, PRIMARY, TEXT } from '@/features/mentor/components/course/mentorCourseCreateStyles';

function ChapterCard({ path, index, onOpen }) {
  const theme = useTheme();
  const label = path.displayLabel || path.PathName || `Chương #${path.PathId}`;
  const chapterNumber = path.chapterOrder ?? index + 1;
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
        {chapterNumber}
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
          {label}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <QuizOutlinedIcon sx={{ fontSize: 15, color: MUTED }} />
          <Typography sx={{ fontSize: 13, color: MUTED }}>
            {questionCount} câu hỏi
          </Typography>
        </Box>
      </Box>

      <ChevronRightRoundedIcon sx={{ fontSize: 22, color: MUTED, flexShrink: 0 }} />
    </Box>
  );
}

export default function MentorQuestionBankPathsView({
  bank,
  paths = [],
  courseName,
  courseCategory = '',
  updatedAt,
  onOpenPath,
  onBack,
  onCreatePath,
}) {
  const title = courseName || bank?.courseTitle || 'Ngân hàng câu hỏi';
  const totalQuestions = paths.reduce((sum, path) => sum + (Number(path.QuestionCount) || 0), 0);

  return (
    <Box sx={{ width: '100%', maxWidth: 1280, mx: 'auto' }}>
      {onBack ? (
        <Box sx={{ mb: 2 }}>
          <AppButton
            variant="text"
            startIcon={<ArrowBackRoundedIcon />}
            onClick={onBack}
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
      ) : null}

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
          {title}
        </Typography>
        <Typography sx={{ fontSize: 14, color: MUTED }}>
          {courseCategory ? `${courseCategory} · ` : ''}
          {paths.length} chương · {totalQuestions} câu hỏi
          {updatedAt ? ` · Cập nhật ${formatMentorCourseDate(updatedAt)}` : ''}
        </Typography>
        <Typography sx={{ fontSize: 13, color: MUTED, mt: 1 }}>
          Chọn chương để quản lý câu hỏi
        </Typography>
      </Box>

      {onCreatePath ? (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <AppButton
            onClick={onCreatePath}
            sx={{ height: 40, borderRadius: '999px', bgcolor: PRIMARY, boxShadow: 'none' }}
          >
            Thêm chương
          </AppButton>
        </Box>
      ) : null}

      {paths.length === 0 ? (
        <EmptyState
          icon={MenuBookOutlinedIcon}
          title="Chưa có chương nào trong ngân hàng"
          description="Tạo ngân hàng câu hỏi cho một chương để bắt đầu."
          actionLabel={onCreatePath ? 'Thêm chương' : undefined}
          onAction={onCreatePath}
        />
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 1.5,
          }}
        >
          {paths.map((path, index) => (
            <ChapterCard key={path.PathId} path={path} index={index} onOpen={onOpenPath} />
          ))}
        </Box>
      )}
    </Box>
  );
}
