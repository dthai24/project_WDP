import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import AppButton from '@/shared/ui/AppButton';
import { toast } from '@/shared/ui/Toast';
import MentorCourseCreateStepIndicator from '@/features/mentor/components/course/MentorCourseCreateStepIndicator';
import {
  loadCreateCourseDraft,
  loadCreateCourseTestFromStorage,
  saveCreateCourseTestToStorage,
} from '@/features/mentor/utils/mentorCourseCreateStorage';

const PRIMARY = '#0891B2';
const TEXT = '#0F172A';
const MUTED = '#64748B';

const EMPTY_FORM = {
  question: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctIdx: 0,
  explanation: '',
};

export default function MentorCreateCourseTestPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [courseName, setCourseName] = useState('');
  const [questions, setQuestions] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingIdx, setEditingIdx] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    const draft = loadCreateCourseDraft();
    if (!draft?.course) {
      toast.error('Vui lòng hoàn thành thông tin cơ bản trước.');
      navigate('/mentor/courses/create', { replace: true });
      return;
    }
    setCourseName(draft.course.CourseName ?? '');
    setQuestions(loadCreateCourseTestFromStorage());
    setReady(true);
  }, [navigate]);

  const persist = (next) => {
    setQuestions(next);
    saveCreateCourseTestToStorage(next);
  };

  const handleOpenAdd = () => {
    setEditingIdx(null);
    setFormData(EMPTY_FORM);
    setOpenModal(true);
  };

  const handleOpenEdit = (idx) => {
    const q = questions[idx];
    setEditingIdx(idx);
    setFormData({
      question: q.question,
      optionA: q.options[0]?.label || '',
      optionB: q.options[1]?.label || '',
      optionC: q.options[2]?.label || '',
      optionD: q.options[3]?.label || '',
      correctIdx: Math.max(0, q.options.findIndex((o) => o.correct)),
      explanation: q.explanation || '',
    });
    setOpenModal(true);
  };

  const handleDelete = (idx) => {
    persist(questions.filter((_, i) => i !== idx));
  };

  const handleSaveQuestion = () => {
    const options = [
      { label: formData.optionA.trim() },
      { label: formData.optionB.trim() },
      { label: formData.optionC.trim() },
      { label: formData.optionD.trim() },
    ]
      .filter((o) => o.label.length > 0)
      .map((o, i) => ({ ...o, correct: i === formData.correctIdx }));

    if (!formData.question.trim() || options.length < 2 || !options.some((o) => o.correct)) {
      toast.error('Vui lòng nhập đầy đủ nội dung câu hỏi, ít nhất 2 phương án, và chọn đáp án đúng!');
      return;
    }

    const newQuestion = {
      question: formData.question.trim(),
      explanation: formData.explanation.trim(),
      options,
    };

    if (editingIdx !== null) {
      persist(questions.map((q, i) => (i === editingIdx ? newQuestion : q)));
    } else {
      persist([...questions, newQuestion]);
    }
    setOpenModal(false);
  };

  const handleNext = () => {
    navigate('/mentor/courses/create/writing');
  };

  if (!ready) return null;

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="mb-4">
        <h1 className="text-[22px] sm:text-[24px] font-bold leading-[1.3]" style={{ color: TEXT }}>
          Thêm bài kiểm tra
        </h1>
        <p className="text-[14px] mt-1 leading-[1.55] max-w-[620px]" style={{ color: MUTED }}>
          Soạn câu hỏi trắc nghiệm cho bài kiểm tra cuối khóa của <strong>{courseName || 'khóa học'}</strong>. Bạn có thể bỏ qua bước này và bổ sung câu hỏi sau trong trang quản lý khóa học.
        </p>
      </div>

      <MentorCourseCreateStepIndicator currentStep={3} />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={handleOpenAdd}
          sx={{
            borderRadius: '999px',
            bgcolor: PRIMARY,
            fontWeight: 700,
            fontSize: 13,
            px: 2.5,
            '&:hover': { bgcolor: '#0E7490' },
          }}
        >
          Thêm câu hỏi mới
        </Button>
      </Box>

      {questions.length === 0 ? (
        <Box
          sx={{
            p: 4,
            borderRadius: '20px',
            border: '1px dashed rgba(15,23,42,0.15)',
            textAlign: 'center',
            mb: 3,
          }}
        >
          <Typography sx={{ fontSize: 13, color: MUTED }}>
            Chưa có câu hỏi nào cho bài kiểm tra cuối khóa. Bấm "Thêm câu hỏi mới" để bắt đầu.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2} sx={{ mb: 3 }}>
          {questions.map((q, idx) => (
            <Card
              key={idx}
              elevation={0}
              sx={{ borderRadius: '20px', border: '1px solid rgba(15,23,42,0.08)' }}
            >
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip
                      label={`Câu ${idx + 1}`}
                      size="small"
                      sx={{ bgcolor: PRIMARY, color: '#fff', fontWeight: 800, fontSize: 11, borderRadius: '8px', height: 24 }}
                    />
                    <Typography sx={{ fontSize: 15, fontWeight: 700, color: TEXT, width: '100%', mt: 1 }}>
                      {q.question}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                    <IconButton size="small" onClick={() => handleOpenEdit(idx)} sx={{ color: PRIMARY }}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(idx)} sx={{ color: '#EF4444' }}>
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.25 }}>
                  {q.options.map((opt, oIdx) => (
                    <Box
                      key={oIdx}
                      sx={{
                        p: 1.5,
                        borderRadius: '12px',
                        fontSize: 13,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: opt.correct ? '1px solid #10B981' : '1px solid rgba(15,23,42,0.08)',
                        bgcolor: opt.correct ? 'rgba(16,185,129,0.06)' : '#F8FAFC',
                        color: opt.correct ? '#065F46' : '#334155',
                        fontWeight: opt.correct ? 700 : 500,
                      }}
                    >
                      <span>{opt.label}</span>
                      {opt.correct && <CheckCircleRoundedIcon sx={{ fontSize: 16, color: '#10B981' }} />}
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.25, mt: 3 }}>
        <AppButton
          variant="outlined"
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate('/mentor/courses/create/content')}
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

      {/* Add / Edit Question Dialog */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: 18, color: TEXT }}>
          {editingIdx !== null ? 'Chỉnh sửa câu hỏi kiểm tra' : 'Thêm câu hỏi kiểm tra mới'}
        </DialogTitle>
        <DialogContent dividers sx={{ borderTop: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9', py: 2.5 }}>
          <Stack spacing={2.5}>
            <TextField
              label="Nội dung câu hỏi"
              multiline
              rows={2}
              fullWidth
              value={formData.question}
              onChange={(e) => setFormData((p) => ({ ...p, question: e.target.value }))}
              placeholder="Nhập nội dung câu hỏi trắc nghiệm..."
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }}
            />
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#334155', mb: -1 }}>
              Các đáp án & Chọn đáp án đúng:
            </Typography>
            <RadioGroup
              value={String(formData.correctIdx)}
              onChange={(e) => setFormData((p) => ({ ...p, correctIdx: Number(e.target.value) }))}
            >
              <Stack spacing={1.5}>
                {['optionA', 'optionB', 'optionC', 'optionD'].map((key, idx) => (
                  <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FormControlLabel value={String(idx)} control={<Radio size="small" color="success" />} label={String.fromCharCode(65 + idx)} />
                    <TextField
                      size="small"
                      fullWidth
                      placeholder={`Phương án ${String.fromCharCode(65 + idx)}`}
                      value={formData[key]}
                      onChange={(e) => setFormData((p) => ({ ...p, [key]: e.target.value }))}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                  </Box>
                ))}
              </Stack>
            </RadioGroup>
            <TextField
              label="Ghi chú & Giải thích đáp án (Tùy chọn)"
              multiline
              rows={2}
              fullWidth
              value={formData.explanation}
              onChange={(e) => setFormData((p) => ({ ...p, explanation: e.target.value }))}
              placeholder="Nhập phần giải thích lý do tại sao chọn đáp án này..."
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)} sx={{ borderRadius: '12px', color: MUTED, fontWeight: 600 }}>
            Hủy bỏ
          </Button>
          <Button
            onClick={handleSaveQuestion}
            variant="contained"
            sx={{ borderRadius: '12px', bgcolor: PRIMARY, fontWeight: 700, '&:hover': { bgcolor: '#0E7490' } }}
          >
            Lưu câu hỏi
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
