import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import AppButton from '@/shared/ui/AppButton';
import { toast } from '@/shared/ui/Toast';
import MentorCourseCreateStepIndicator from '@/features/mentor/components/course/MentorCourseCreateStepIndicator';
import {
  loadCreateCourseDraft,
  loadCreateCourseWritingPromptFromStorage,
  saveCreateCourseWritingPromptToStorage,
} from '@/features/mentor/utils/mentorCourseCreateStorage';

const PRIMARY = '#0891B2';
const TEXT = '#0F172A';
const MUTED = '#64748B';

export default function MentorCreateCourseWritingPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [courseName, setCourseName] = useState('');
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    const draft = loadCreateCourseDraft();
    if (!draft?.course) {
      toast.error('Vui lòng hoàn thành thông tin cơ bản trước.');
      navigate('/mentor/courses/create', { replace: true });
      return;
    }
    setCourseName(draft.course.CourseName ?? '');
    setPrompt(loadCreateCourseWritingPromptFromStorage());
    setReady(true);
  }, [navigate]);

  const handleNext = () => {
    saveCreateCourseWritingPromptToStorage(prompt.trim());
    navigate('/mentor/courses/create/review');
  };

  if (!ready) return null;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-4">
        <h1 className="text-[22px] sm:text-[24px] font-bold leading-[1.3]" style={{ color: TEXT }}>
          ✍️ Bài viết (Writing) — Bài thi cuối khóa
        </h1>
        <p className="text-[14px] mt-1 leading-[1.55] max-w-[620px]" style={{ color: MUTED }}>
          Sau khi vượt qua bài kiểm tra, học viên của <strong>{courseName || 'khóa học'}</strong> sẽ làm một bài viết cuối khóa được AI chấm điểm. Bạn có thể tự soạn đề bài, hoặc để trống để hệ thống tự sinh đề phù hợp với chủ đề khóa học.
        </p>
      </div>

      <MentorCourseCreateStepIndicator currentStep={4} />

      <Box
        sx={{
          bgcolor: '#fff',
          border: '1px solid rgba(15,23,42,0.08)',
          borderRadius: '20px',
          p: 3,
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <EditNoteRoundedIcon sx={{ color: PRIMARY }} />
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: TEXT }}>
            Đề bài Viết (tùy chọn)
          </Typography>
        </Box>
        <TextField
          multiline
          rows={6}
          fullWidth
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder='Ví dụ: "Write a short essay (150-200 words) about the most important skill for success in a modern workplace..."'
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px', fontSize: 14 } }}
        />
        <Typography sx={{ fontSize: 12, color: MUTED, mt: 1.5 }}>
          Nếu để trống, hệ thống sẽ tự động sinh đề bài tiếng Anh phù hợp với chủ đề khóa học mỗi khi học viên mở bài viết.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.25 }}>
        <AppButton
          variant="outlined"
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate('/mentor/courses/create/test')}
          sx={{ minWidth: 120, height: 44, borderRadius: '999px', fontWeight: 700 }}
        >
          Quay lại
        </AppButton>
        <AppButton
          endIcon={<ArrowForwardRoundedIcon />}
          onClick={handleNext}
          sx={{ minWidth: 128, height: 44, borderRadius: '999px', fontWeight: 700, bgcolor: PRIMARY, '&:hover': { bgcolor: '#0E7490' } }}
        >
          Tiếp theo
        </AppButton>
      </Box>
    </div>
  );
}
