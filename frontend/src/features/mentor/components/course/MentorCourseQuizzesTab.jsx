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
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';

const DEFAULT_QUESTIONS = [
  {
    id: 'q1',
    section: 'Listening Part 1-2',
    question: 'Part 2 Listening: "Where is the annual financial report?"',
    options: [
      { label: "A. It's on Mr. David's desk in Room 302.", val: 'A', correct: true },
      { label: 'B. Yes, I finished reading it yesterday.', val: 'B' },
      { label: 'C. At 2:30 PM this afternoon.', val: 'C' },
      { label: 'D. By train from London.', val: 'D' }
    ],
    explanation: 'Đáp án A trả lời đúng trọng tâm câu hỏi vị trí (Where).'
  },
  {
    id: 'q2',
    section: 'Reading Part 5',
    question: 'Part 5 Grammar: "The board of directors approved to ___ the new safety regulations."',
    options: [
      { label: 'A. implement', val: 'A', correct: true },
      { label: 'B. implementation', val: 'B' },
      { label: 'C. implementing', val: 'C' },
      { label: 'D. implemented', val: 'D' }
    ],
    explanation: 'Sau động từ approved to + V nguyên thể chọn implement.'
  },
  {
    id: 'q3',
    section: 'Reading Part 5',
    question: 'Part 5 Vocabulary: "All hotel guests are entitled to a ___ continental breakfast."',
    options: [
      { label: 'A. complimentary', val: 'A', correct: true },
      { label: 'B. complement', val: 'B' },
      { label: 'C. complicated', val: 'C' },
      { label: 'D. complying', val: 'D' }
    ],
    explanation: 'Complimentary (tính từ) nghĩa là miễn phí đi kèm dịch vụ hotel.'
  }
];

export default function MentorCourseQuizzesTab({ course }) {
  const courseId = course?._id || course?.CourseId || 'default';
  const courseName = course?.CourseName || '';
  const isToeic = courseName.toLowerCase().includes('toeic');
  const isIelts = courseName.toLowerCase().includes('ielts');
  const storageKey = `mentor_course_quiz_${courseId}`;

  const availableSections = isIelts
    ? [
        '🎧 IELTS Listening (Nghe hiểu)',
        '📖 IELTS Reading (Đọc hiểu)',
        '✍️ IELTS Writing (Viết luận Task 1 & 2)',
        '🗣️ IELTS Speaking (Nói & Lexical Resource)'
      ]
    : isToeic
    ? [
        '🖼️ Part 1 & 2 Listening (Tranh vẽ & Câu ngắn)',
        '💬 Part 3 & 4 Listening (Hội thoại & Bài nói)',
        '📝 Part 5 Reading (Ngữ pháp & Từ loại)',
        '📄 Part 6 & 7 Reading (Đoạn đơn & Triple Passages)'
      ]
    : [
        '📘 Phần 1: Ngữ pháp & Cấu trúc',
        '📙 Phần 2: Từ vựng & Giao tiếp'
      ];

  const [questions, setQuestions] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : DEFAULT_QUESTIONS;
    } catch {
      return DEFAULT_QUESTIONS;
    }
  });

  const [openModal, setOpenModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
    section: availableSections[0],
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctVal: 'A',
    explanation: ''
  });

  const [saveSuccessAlert, setSaveSuccessAlert] = useState(false);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(questions));
  }, [questions, storageKey]);

  const handleOpenAdd = () => {
    setEditingIndex(null);
    setFormData({
      section: availableSections[0],
      question: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctVal: 'A',
      explanation: ''
    });
    setOpenModal(true);
  };

  const handleOpenEdit = (index) => {
    const q = questions[index];
    setEditingIndex(index);
    setFormData({
      section: q.section || availableSections[0],
      question: q.question,
      optionA: q.options[0]?.label.replace(/^[A-D]\.\s*/, '') || '',
      optionB: q.options[1]?.label.replace(/^[A-D]\.\s*/, '') || '',
      optionC: q.options[2]?.label.replace(/^[A-D]\.\s*/, '') || '',
      optionD: q.options[3]?.label.replace(/^[A-D]\.\s*/, '') || '',
      correctVal: q.options.find(o => o.correct)?.val || 'A',
      explanation: q.explanation || ''
    });
    setOpenModal(true);
  };

  const handleDelete = (index) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này khỏi bài kiểm tra?')) {
      setQuestions(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSaveQuestion = () => {
    if (!formData.question.trim() || !formData.optionA.trim() || !formData.optionB.trim()) {
      alert('Vui lòng nhập đầy đủ nội dung câu hỏi và ít nhất 2 phương án A, B!');
      return;
    }

    const newQ = {
      id: editingIndex !== null ? questions[editingIndex].id : `q_${Date.now()}`,
      section: formData.section,
      question: formData.question,
      options: [
        { label: `A. ${formData.optionA}`, val: 'A', correct: formData.correctVal === 'A' },
        { label: `B. ${formData.optionB}`, val: 'B', correct: formData.correctVal === 'B' },
        { label: `C. ${formData.optionC}`, val: 'C', correct: formData.correctVal === 'C' },
        { label: `D. ${formData.optionD}`, val: 'D', correct: formData.correctVal === 'D' }
      ].filter(o => o.label.length > 3),
      explanation: formData.explanation
    };

    if (editingIndex !== null) {
      setQuestions(prev => {
        const next = [...prev];
        next[editingIndex] = newQ;
        return next;
      });
    } else {
      setQuestions(prev => [...prev, newQ]);
    }

    setOpenModal(false);
    setSaveSuccessAlert(true);
    setTimeout(() => setSaveSuccessAlert(false), 3000);
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
                Quản lý Đề thi Giả lập {isIelts ? 'IELTS 4 Kỹ Năng' : isToeic ? 'TOEIC ETS (7 Parts)' : 'Đánh giá Năng lực'}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: 13, color: '#64748B', maxWidth: 680 }}>
              Soạn thảo bộ câu hỏi theo đúng format chuẩn {isIelts ? '4 Kỹ năng (Listening, Reading, Writing, Speaking)' : isToeic ? 'ETS Listening & Reading' : 'CEFR'} cho khóa <strong>{courseName}</strong>.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={handleOpenAdd}
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

        {/* ─── Score Prediction Rules & Conversion Matrix ─── */}
        <Box
          sx={{
            mt: 2.5,
            pt: 2.5,
            borderTop: '1px solid rgba(15,23,42,0.08)',
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 2
          }}
        >
          <Box sx={{ p: 2, borderRadius: '16px', bgcolor: 'rgba(240,253,244,0.6)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#065F46', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              🎯 Quy tắc Đánh giá Điểm số TOEIC (dựa trên % Số câu đúng):
            </Typography>
            <Box component="ul" sx={{ pl: 2.5, m: 0, fontSize: 12, color: '#047857', '& li': { mb: 0.5 } }}>
              <li><strong>Đúng 100%:</strong> Dự đoán <strong>850 - 990 TOEIC</strong> (Thành thạo cao cấp - Mastery Level).</li>
              <li><strong>Đúng 80%:</strong> Dự đoán <strong>650 - 800 TOEIC</strong> (Khá giỏi - Intermediate Level).</li>
              <li><strong>Đúng 60%:</strong> Dự đoán <strong>450 - 600 TOEIC</strong> (Đạt chuẩn đầu ra - Starter Level).</li>
              <li><strong>Dưới 60%:</strong> Dự đoán <strong>250 - 400 TOEIC</strong> (Cần học lại các bài học căn bản).</li>
            </Box>
          </Box>

          <Box sx={{ p: 2, borderRadius: '16px', bgcolor: 'rgba(245,243,255,0.6)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#5B21B6', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              🏅 Quy tắc Đánh giá Band điểm IELTS (4 Kỹ năng):
            </Typography>
            <Box component="ul" sx={{ pl: 2.5, m: 0, fontSize: 12, color: '#6D28D9', '& li': { mb: 0.5 } }}>
              <li><strong>Đúng 100%:</strong> Dự đoán <strong>Band 8.0 - 8.5 IELTS</strong> (Academic Master).</li>
              <li><strong>Đúng 80%:</strong> Dự đoán <strong>Band 6.5 - 7.5 IELTS</strong> (Good Competence).</li>
              <li><strong>Đúng 60%:</strong> Dự đoán <strong>Band 5.0 - 6.0 IELTS</strong> (Modest User).</li>
              <li><strong>Dưới 60%:</strong> Dự đoán <strong>Band 3.5 - 4.5 IELTS</strong> (Limited User).</li>
            </Box>
          </Box>
        </Box>
      </Paper>

      {saveSuccessAlert && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: '16px' }}>
          Đã lưu cập nhật câu hỏi bài kiểm tra thành công!
        </Alert>
      )}

      {/* List of Quiz Questions */}
      <Stack spacing={2}>
        {questions.map((q, idx) => (
          <Card
            key={q.id || idx}
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
                  {q.section && (
                    <Chip
                      label={q.section}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(99,102,241,0.1)',
                        color: '#4F46E5',
                        fontWeight: 700,
                        fontSize: 11,
                        borderRadius: '8px',
                        height: 24
                      }}
                    />
                  )}
                  <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#0F172A', width: '100%', mt: 1 }}>
                    {q.question}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                  <IconButton size="small" onClick={() => handleOpenEdit(idx)} sx={{ color: '#0891B2' }}>
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(idx)} sx={{ color: '#EF4444' }}>
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

      {/* Add / Edit Question Dialog Modal */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: 18, color: '#0F172A' }}>
          {editingIndex !== null ? 'Chỉnh sửa câu hỏi kiểm tra' : 'Thêm câu hỏi kiểm tra mới'}
        </DialogTitle>

        <DialogContent dividers sx={{ borderTop: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9', py: 2.5 }}>
          <Stack spacing={2.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Phân loại Phần thi / Kỹ năng</InputLabel>
              <Select
                value={formData.section}
                label="Phân loại Phần thi / Kỹ năng"
                onChange={e => setFormData(p => ({ ...p, section: e.target.value }))}
                sx={{ borderRadius: '14px' }}
              >
                {availableSections.map((sec, i) => (
                  <MenuItem key={i} value={sec}>{sec}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Nội dung câu hỏi"
              multiline
              rows={2}
              fullWidth
              value={formData.question}
              onChange={e => setFormData(p => ({ ...p, question: e.target.value }))}
              placeholder="Nhập nội dung câu hỏi trắc nghiệm..."
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }}
            />

            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#334155', mb: -1 }}>
              Các đáp án & Chọn đáp án đúng:
            </Typography>

            <RadioGroup
              value={formData.correctVal}
              onChange={e => setFormData(p => ({ ...p, correctVal: e.target.value }))}
            >
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FormControlLabel value="A" control={<Radio size="small" color="success" />} label="A" />
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="Phương án A"
                    value={formData.optionA}
                    onChange={e => setFormData(p => ({ ...p, optionA: e.target.value }))}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FormControlLabel value="B" control={<Radio size="small" color="success" />} label="B" />
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="Phương án B"
                    value={formData.optionB}
                    onChange={e => setFormData(p => ({ ...p, optionB: e.target.value }))}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FormControlLabel value="C" control={<Radio size="small" color="success" />} label="C" />
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="Phương án C"
                    value={formData.optionC}
                    onChange={e => setFormData(p => ({ ...p, optionC: e.target.value }))}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FormControlLabel value="D" control={<Radio size="small" color="success" />} label="D" />
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="Phương án D"
                    value={formData.optionD}
                    onChange={e => setFormData(p => ({ ...p, optionD: e.target.value }))}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Box>
              </Stack>
            </RadioGroup>

            <TextField
              label="Ghi chú & Giải thích đáp án (Optional)"
              multiline
              rows={2}
              fullWidth
              value={formData.explanation}
              onChange={e => setFormData(p => ({ ...p, explanation: e.target.value }))}
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
            sx={{ borderRadius: '12px', bgcolor: '#0891B2', fontWeight: 700, '&:hover': { bgcolor: '#0E7490' } }}
          >
            Lưu câu hỏi
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
