import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
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
  Alert,
  CircularProgress
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';

const API_BASE = 'http://localhost:5050/api';

const EMPTY_FORM = {
  question: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctIdx: 0,
  explanation: ''
};

export default function MentorCourseQuizzesTab({ course }) {
  const courseId = course?._id || course?.CourseId || course?.courseId;
  const courseName = course?.CourseName || course?.courseName || '';
  const isToeic = courseName.toLowerCase().includes('toeic');
  const isIelts = courseName.toLowerCase().includes('ielts');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = String(user.userId || '');

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveSuccessAlert, setSaveSuccessAlert] = useState(false);

  const fetchQuestions = async () => {
    if (!courseId) return;
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`${API_BASE}/courses/${courseId}/tests/final/questions`, {
        headers: { 'x-user-id': currentUserId }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setLoadError(data.message || 'Không thể tải danh sách câu hỏi.');
        return;
      }
      setQuestions(data.data || []);
    } catch {
      setLoadError('Không thể kết nối server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setOpenModal(true);
  };

  const handleOpenEdit = (q) => {
    setEditingId(q.id);
    setFormData({
      question: q.question,
      optionA: q.options[0]?.label || '',
      optionB: q.options[1]?.label || '',
      optionC: q.options[2]?.label || '',
      optionD: q.options[3]?.label || '',
      correctIdx: Math.max(0, q.options.findIndex((o) => o.correct)),
      explanation: q.explanation || ''
    });
    setOpenModal(true);
  };

  const handleDelete = async (q) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này khỏi bài kiểm tra?')) return;
    try {
      const res = await fetch(`${API_BASE}/courses/${courseId}/tests/final/questions/${q.id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': currentUserId }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || 'Không thể xóa câu hỏi.');
        return;
      }
      setQuestions((prev) => prev.filter((item) => item.id !== q.id));
    } catch {
      alert('Không thể kết nối server.');
    }
  };

  const handleSaveQuestion = async () => {
    const options = [
      { label: formData.optionA.trim() },
      { label: formData.optionB.trim() },
      { label: formData.optionC.trim() },
      { label: formData.optionD.trim() }
    ]
      .filter((o) => o.label.length > 0)
      .map((o, i) => ({ ...o, correct: i === formData.correctIdx }));

    if (!formData.question.trim() || options.length < 2 || !options.some((o) => o.correct)) {
      alert('Vui lòng nhập đầy đủ nội dung câu hỏi, ít nhất 2 phương án, và chọn đúng đáp án đúng!');
      return;
    }

    setSaving(true);
    try {
      const payload = { question: formData.question.trim(), explanation: formData.explanation.trim(), options };
      const url = editingId
        ? `${API_BASE}/courses/${courseId}/tests/final/questions/${editingId}`
        : `${API_BASE}/courses/${courseId}/tests/final/questions`;
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': currentUserId },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || 'Không thể lưu câu hỏi.');
        return;
      }
      setOpenModal(false);
      setSaveSuccessAlert(true);
      setTimeout(() => setSaveSuccessAlert(false), 3000);
      fetchQuestions();
    } catch {
      alert('Không thể kết nối server.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ width: '100%', pt: 1, pb: 4, fontFamily: 'sans-serif' }}>
      {/* Top Banner & Action Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: '24px',
          bgcolor: '#FFFFFF',
          border: '1px solid rgba(15,23,42,0.08)',
          mb: 3
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Box
                sx={{
                  w: 36,
                  h: 36,
                  borderRadius: '12px',
                  bgcolor: 'rgba(8,145,178,0.1)',
                  color: '#0891B2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 1
                }}
              >
                <QuizOutlinedIcon />
              </Box>
              <Typography sx={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
                Quản lý Bài kiểm tra cuối khóa {isIelts ? '(IELTS)' : isToeic ? '(TOEIC)' : ''}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: 13, color: '#64748B', maxWidth: 680 }}>
              Đây là bộ câu hỏi thật mà học viên sẽ làm ở tab "Bài kiểm tra" của khóa <strong>{courseName}</strong>. Mọi thay đổi ở đây sẽ đồng bộ ngay cho học viên.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={handleOpenAdd}
            disabled={loading}
            sx={{
              borderRadius: '999px',
              bgcolor: '#0891B2',
              color: '#FFF',
              fontWeight: 700,
              fontSize: 13,
              px: 2.5,
              py: 1,
              boxShadow: '0 4px 12px rgba(8,145,178,0.25)',
              '&:hover': { bgcolor: '#0E7490' }
            }}
          >
            Thêm câu hỏi mới
          </Button>
        </Box>
      </Paper>

      {saveSuccessAlert && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: '16px' }}>
          Đã lưu cập nhật câu hỏi thành công! Học viên sẽ thấy thay đổi này ngay.
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={28} sx={{ color: '#0891B2' }} />
        </Box>
      )}

      {!loading && loadError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '16px' }}>
          {loadError}
        </Alert>
      )}

      {!loading && !loadError && questions.length === 0 && (
        <Paper elevation={0} sx={{ p: 4, borderRadius: '20px', border: '1px dashed rgba(15,23,42,0.15)', textAlign: 'center' }}>
          <Typography sx={{ fontSize: 13, color: '#64748B' }}>
            Chưa có câu hỏi nào cho bài kiểm tra cuối khóa. Bấm "Thêm câu hỏi mới" để bắt đầu.
          </Typography>
        </Paper>
      )}

      {/* List of Quiz Questions */}
      {!loading && !loadError && (
        <Stack spacing={2}>
          {questions.map((q, idx) => (
            <Card
              key={q.id}
              elevation={0}
              sx={{
                borderRadius: '20px',
                bgcolor: '#FFFFFF',
                border: '1px solid rgba(15,23,42,0.08)',
                transition: 'all 0.2s',
                '&:hover': { borderColor: 'rgba(8,145,178,0.3)', boxShadow: '0 4px 20px rgba(15,23,42,0.04)' }
              }}
            >
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                    <Chip
                      label={`Câu ${idx + 1}`}
                      size="small"
                      sx={{
                        bgcolor: '#0891B2',
                        color: '#FFF',
                        fontWeight: 800,
                        fontSize: 11,
                        borderRadius: '8px',
                        height: 24
                      }}
                    />
                    <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#0F172A', width: '100%', mt: 1 }}>
                      {q.question}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                    <IconButton size="small" onClick={() => handleOpenEdit(q)} sx={{ color: '#0891B2' }}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(q)} sx={{ color: '#EF4444' }}>
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                {/* Options */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.25, mb: 2 }}>
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
                        fontWeight: opt.correct ? 700 : 500
                      }}
                    >
                      <span>{opt.label}</span>
                      {opt.correct && <CheckCircleRoundedIcon sx={{ fontSize: 16, color: '#10B981' }} />}
                    </Box>
                  ))}
                </Box>

                {/* Explanation */}
                {q.explanation && (
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: '12px',
                      bgcolor: '#F1F5F9',
                      fontSize: 12,
                      color: '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <HelpOutlineRoundedIcon sx={{ fontSize: 16, color: '#64748B' }} />
                    <span><strong>Giải thích:</strong> {q.explanation}</span>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Add / Edit Question Dialog Modal */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: 18, color: '#0F172A' }}>
          {editingId !== null ? 'Chỉnh sửa câu hỏi kiểm tra' : 'Thêm câu hỏi kiểm tra mới'}
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
              label="Ghi chú & Giải thích đáp án (Optional)"
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
          <Button onClick={() => setOpenModal(false)} sx={{ borderRadius: '12px', color: '#64748B', fontWeight: 600 }}>
            Hủy bỏ
          </Button>
          <Button
            onClick={handleSaveQuestion}
            variant="contained"
            disabled={saving}
            sx={{ borderRadius: '12px', bgcolor: '#0891B2', fontWeight: 700, '&:hover': { bgcolor: '#0E7490' } }}
          >
            {saving ? 'Đang lưu...' : 'Lưu câu hỏi'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
