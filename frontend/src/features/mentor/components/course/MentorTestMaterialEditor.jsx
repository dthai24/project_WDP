import { useState } from 'react';
import {
  Box, InputBase, Typography, Slider, IconButton, Collapse,
  Radio, RadioGroup, FormControlLabel, Tooltip,
} from '@mui/material';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded';
import { ContentFieldLabel } from './MentorContentSectionHeading';
import { MUTED, TEXT } from './mentorCourseCreateStyles';
import { MATERIAL_TYPE_THEME, contentMultilineInputSx } from './mentorCourseContentStyles';

const PRIMARY = '#0891b2';

// ─── helpers ──────────────────────────────────────────────────────────────────

function createOption(label = '') {
  return { id: `opt-${Date.now()}-${Math.random().toString(36).slice(2)}`, label };
}

function createQuestion() {
  return {
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    question: '',
    options: [createOption(''), createOption(''), createOption(''), createOption('')],
    correctIndex: 0,
    explanation: '',
  };
}

// ─── sub-components ───────────────────────────────────────────────────────────

function NumberStepper({ value, onChange, min = 0, max = 9999, step = 1, unit = '', disabled }) {
  const n = Number(value) || 0;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box
        sx={{
          display: 'flex', alignItems: 'center', gap: 0.25,
          bgcolor: '#fff', border: '1px solid rgba(15,23,42,0.12)',
          borderRadius: '10px', px: 0.75, height: 38, minWidth: 130,
        }}
      >
        <Box
          component="button" type="button" disabled={disabled || n <= min}
          onClick={() => onChange(Math.max(min, n - step))}
          sx={{
            background: 'none', border: 'none', cursor: disabled || n <= min ? 'default' : 'pointer',
            fontSize: 18, fontWeight: 700, color: n <= min ? 'rgba(15,23,42,0.25)' : TEXT,
            px: 0.75, lineHeight: 1, '&:hover:not(:disabled)': { color: PRIMARY },
          }}
        >−</Box>
        <InputBase
          value={n}
          onChange={(e) => { const v = Number(e.target.value); if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v))); }}
          disabled={disabled}
          inputProps={{ style: { textAlign: 'center', fontWeight: 700, fontSize: 13, width: 44 } }}
        />
        <Box
          component="button" type="button" disabled={disabled || n >= max}
          onClick={() => onChange(Math.min(max, n + step))}
          sx={{
            background: 'none', border: 'none', cursor: disabled || n >= max ? 'default' : 'pointer',
            fontSize: 18, fontWeight: 700, color: n >= max ? 'rgba(15,23,42,0.25)' : TEXT,
            px: 0.75, lineHeight: 1, '&:hover:not(:disabled)': { color: PRIMARY },
          }}
        >+</Box>
      </Box>
      {unit && <Typography sx={{ fontSize: 12, color: MUTED, fontWeight: 500 }}>{unit}</Typography>}
    </Box>
  );
}

function QuestionCard({ q, index, total, onChange, onDelete, disabled }) {
  const [expanded, setExpanded] = useState(true);

  const patchOption = (optIndex, label) => {
    const options = q.options.map((o, i) => i === optIndex ? { ...o, label } : o);
    onChange({ ...q, options });
  };

  const addOption = () => {
    if (q.options.length >= 6) return;
    onChange({ ...q, options: [...q.options, createOption('')] });
  };

  const removeOption = (optIndex) => {
    if (q.options.length <= 2) return;
    const options = q.options.filter((_, i) => i !== optIndex);
    const correctIndex = q.correctIndex >= options.length ? options.length - 1 : q.correctIndex;
    onChange({ ...q, options, correctIndex: optIndex === q.correctIndex ? 0 : correctIndex });
  };

  return (
    <Box
      sx={{
        border: '1px solid rgba(15,23,42,0.09)',
        borderRadius: '14px',
        bgcolor: '#fff',
        mb: 1.25,
        overflow: 'hidden',
      }}
    >
      {/* Card header */}
      <Box
        sx={{
          display: 'flex', alignItems: 'center', gap: 1,
          px: 1.5, py: 1, bgcolor: 'rgba(8,145,178,0.04)',
          borderBottom: expanded ? '1px solid rgba(15,23,42,0.07)' : 'none',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(v => !v)}
      >
        <DragIndicatorRoundedIcon sx={{ fontSize: 16, color: 'rgba(15,23,42,0.25)', flexShrink: 0 }} />
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: PRIMARY, minWidth: 24 }}>
          #{index + 1}
        </Typography>
        <Typography
          sx={{ flex: 1, fontSize: 13, fontWeight: 600, color: q.question.trim() ? TEXT : MUTED, noWrap: true, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {q.question.trim() || 'Câu hỏi chưa có nội dung...'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography sx={{ fontSize: 11, color: MUTED }}>{q.options.length} đáp án</Typography>
          {total > 1 && (
            <Tooltip title="Xóa câu hỏi">
              <IconButton
                size="small" disabled={disabled}
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                sx={{ color: '#ef4444', '&:hover': { bgcolor: 'rgba(239,68,68,0.08)' } }}
              >
                <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}
          {expanded ? <ExpandLessRoundedIcon sx={{ fontSize: 18, color: MUTED }} /> : <ExpandMoreRoundedIcon sx={{ fontSize: 18, color: MUTED }} />}
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ px: 1.75, pt: 1.25, pb: 1.5 }}>
          {/* Question text */}
          <Box sx={{ mb: 1.5 }}>
            <ContentFieldLabel sx={{ fontSize: 12, mb: 0.5 }}>Nội dung câu hỏi *</ContentFieldLabel>
            <InputBase
              value={q.question}
              onChange={(e) => onChange({ ...q, question: e.target.value })}
              disabled={disabled}
              placeholder="Nhập câu hỏi..."
              fullWidth multiline minRows={2}
              sx={{
                fontSize: 13, px: 1.25, py: 0.75,
                bgcolor: '#F8FAFC', borderRadius: '10px',
                border: '1px solid rgba(15,23,42,0.1)',
                '&:hover': { border: '1px solid rgba(8,145,178,0.4)' },
                '&.Mui-focused': { border: `1px solid ${PRIMARY}` },
                alignItems: 'flex-start',
              }}
            />
          </Box>

          {/* Options */}
          <Box sx={{ mb: 1.25 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
              <ContentFieldLabel sx={{ fontSize: 12, mb: 0 }}>Đáp án (chọn đáp án đúng)</ContentFieldLabel>
              {q.options.length < 6 && (
                <Box
                  component="button" type="button" disabled={disabled}
                  onClick={addOption}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 0.4,
                    background: 'none', border: `1px solid ${PRIMARY}`,
                    borderRadius: '8px', px: 0.75, py: 0.35, cursor: 'pointer',
                    color: PRIMARY, fontSize: 11, fontWeight: 600,
                    '&:hover': { bgcolor: 'rgba(8,145,178,0.06)' },
                  }}
                >
                  <AddRoundedIcon sx={{ fontSize: 13 }} /> Thêm đáp án
                </Box>
              )}
            </Box>

            <RadioGroup
              value={String(q.correctIndex)}
              onChange={(e) => onChange({ ...q, correctIndex: Number(e.target.value) })}
            >
              {q.options.map((opt, i) => (
                <Box key={opt.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.6 }}>
                  <FormControlLabel
                    value={String(i)}
                    control={<Radio size="small" sx={{ color: MUTED, '&.Mui-checked': { color: '#16a34a' }, p: 0.5 }} />}
                    label=""
                    sx={{ m: 0, flexShrink: 0 }}
                    disabled={disabled}
                  />
                  <InputBase
                    value={opt.label}
                    onChange={(e) => patchOption(i, e.target.value)}
                    disabled={disabled}
                    placeholder={`Đáp án ${String.fromCharCode(65 + i)}...`}
                    fullWidth
                    sx={{
                      fontSize: 13, px: 1.25, py: 0.5, flex: 1,
                      bgcolor: q.correctIndex === i ? 'rgba(22,163,74,0.07)' : '#F8FAFC',
                      border: q.correctIndex === i ? '1px solid rgba(22,163,74,0.35)' : '1px solid rgba(15,23,42,0.09)',
                      borderRadius: '9px',
                      '&:hover': { border: `1px solid rgba(8,145,178,0.4)` },
                    }}
                  />
                  {q.options.length > 2 && (
                    <IconButton
                      size="small" disabled={disabled}
                      onClick={() => removeOption(i)}
                      sx={{ color: 'rgba(15,23,42,0.3)', '&:hover': { color: '#ef4444' } }}
                    >
                      <DeleteOutlineRoundedIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  )}
                </Box>
              ))}
            </RadioGroup>
          </Box>

          {/* Explanation */}
          <Box>
            <ContentFieldLabel sx={{ fontSize: 12, mb: 0.5 }}>Giải thích đáp án <span style={{ color: MUTED, fontWeight: 400 }}>(tuỳ chọn)</span></ContentFieldLabel>
            <InputBase
              value={q.explanation ?? ''}
              onChange={(e) => onChange({ ...q, explanation: e.target.value })}
              disabled={disabled}
              placeholder="Giải thích tại sao đáp án này đúng..."
              fullWidth multiline minRows={1}
              sx={{
                fontSize: 12, px: 1.25, py: 0.6,
                bgcolor: '#F8FAFC', borderRadius: '9px',
                border: '1px solid rgba(15,23,42,0.08)',
                '&:hover': { border: '1px solid rgba(8,145,178,0.35)' },
                color: MUTED,
              }}
            />
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function MentorTestMaterialEditor({
  material,
  errors = {},
  onChange,
  disabled = false,
}) {
  const theme = MATERIAL_TYPE_THEME.TEST;
  const accentColor = theme?.color ?? PRIMARY;

  const timeLimitMinutes = Number(material.TimeLimitMinutes) || 30;
  const totalScore = Number(material.TotalScore) || 100;
  const passScore = Number(material.PassScore) || 70;
  const passPercent = totalScore > 0 ? Math.round((passScore / totalScore) * 100) : 70;
  const questions = material.Questions ?? [];

  const patch = (fields) => onChange(material.tempId, fields);

  const patchQuestion = (index, updated) => {
    const next = questions.map((q, i) => (i === index ? updated : q));
    patch({ Questions: next });
  };

  const addQuestion = () => {
    patch({ Questions: [...questions, createQuestion()] });
  };

  const deleteQuestion = (index) => {
    patch({ Questions: questions.filter((_, i) => i !== index) });
  };

  return (
    <Box
      sx={{
        mt: 1.25, ml: { xs: 0, sm: 0.25 },
        p: { xs: 1.5, sm: 2 }, borderRadius: '16px',
        border: '1px solid rgba(15,23,42,0.08)', bgcolor: '#F8FAFC',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2 }}>
        <Box sx={{ width: 38, height: 38, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: `${accentColor}18`, color: accentColor, flexShrink: 0 }}>
          <QuizRoundedIcon sx={{ fontSize: 22 }} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: TEXT, lineHeight: 1.3 }}>Cấu hình bài kiểm tra</Typography>
          <Typography sx={{ fontSize: 12, color: MUTED, mt: 0.2 }}>Thiết lập thời gian, điểm số và soạn câu hỏi trắc nghiệm</Typography>
        </Box>
        <Box sx={{ ml: 'auto', bgcolor: `${accentColor}15`, px: 1, py: 0.4, borderRadius: '8px' }}>
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: accentColor }}>{questions.length} câu hỏi</Typography>
        </Box>
      </Box>

      {/* Description */}
      <Box sx={{ mb: 2 }}>
        <ContentFieldLabel sx={{ mb: 0.5 }}>Mô tả bài kiểm tra</ContentFieldLabel>
        <InputBase
          value={material.Description ?? ''}
          onChange={(e) => patch({ Description: e.target.value })}
          disabled={disabled}
          placeholder="Mô tả ngắn về nội dung và mục tiêu bài kiểm tra (tuỳ chọn)..."
          fullWidth multiline minRows={2}
          sx={contentMultilineInputSx(false, { color: accentColor })}
        />
      </Box>

      {/* Config row */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 2, p: 1.5, bgcolor: '#fff', borderRadius: '12px', border: '1px solid rgba(15,23,42,0.07)' }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.75 }}>
            <TimerOutlinedIcon sx={{ fontSize: 15, color: MUTED }} />
            <ContentFieldLabel sx={{ fontSize: 12, mb: 0 }}>Thời gian làm bài</ContentFieldLabel>
          </Box>
          <NumberStepper value={timeLimitMinutes} onChange={(v) => patch({ TimeLimitMinutes: v })} min={5} max={240} step={5} unit="phút" disabled={disabled} />
        </Box>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.75 }}>
            <StarBorderRoundedIcon sx={{ fontSize: 15, color: MUTED }} />
            <ContentFieldLabel sx={{ fontSize: 12, mb: 0 }}>Tổng điểm</ContentFieldLabel>
          </Box>
          <NumberStepper value={totalScore} onChange={(v) => patch({ TotalScore: v, PassScore: Math.round(v * passPercent / 100) })} min={10} max={1000} step={10} unit="điểm" disabled={disabled} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.75 }}>
            <CheckCircleOutlineRoundedIcon sx={{ fontSize: 15, color: MUTED }} />
            <ContentFieldLabel sx={{ fontSize: 12, mb: 0 }}>
              Điểm đạt — <strong style={{ color: '#16a34a' }}>{passScore} điểm ({passPercent}%)</strong>
            </ContentFieldLabel>
          </Box>
          <Box sx={{ px: 1 }}>
            <Slider
              value={passPercent} min={10} max={100} step={5} disabled={disabled}
              onChange={(_, v) => patch({ PassScore: Math.round(totalScore * v / 100) })}
              marks={[{ value: 50, label: '50%' }, { value: 70, label: '70%' }, { value: 80, label: '80%' }]}
              sx={{ color: '#16a34a', '& .MuiSlider-thumb': { width: 14, height: 14 }, '& .MuiSlider-markLabel': { fontSize: 11, color: MUTED } }}
            />
          </Box>
        </Box>
      </Box>

      {/* Questions section */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: TEXT }}>
            Danh sách câu hỏi
          </Typography>
          <Box
            component="button" type="button" disabled={disabled}
            onClick={addQuestion}
            sx={{
              display: 'flex', alignItems: 'center', gap: 0.5,
              bgcolor: accentColor, color: '#fff', border: 'none',
              borderRadius: '10px', px: 1.25, py: 0.6,
              cursor: disabled ? 'default' : 'pointer', fontSize: 12, fontWeight: 700,
              '&:hover:not(:disabled)': { bgcolor: '#0e7490' },
              transition: 'background-color 0.15s',
            }}
          >
            <AddRoundedIcon sx={{ fontSize: 15 }} /> Thêm câu hỏi
          </Box>
        </Box>

        {questions.length === 0 ? (
          <Box
            sx={{
              p: 3, borderRadius: '12px', textAlign: 'center',
              border: '2px dashed rgba(8,145,178,0.2)',
              bgcolor: 'rgba(8,145,178,0.03)',
            }}
          >
            <QuizRoundedIcon sx={{ fontSize: 32, color: 'rgba(8,145,178,0.3)', mb: 0.75 }} />
            <Typography sx={{ fontSize: 13, color: MUTED }}>Chưa có câu hỏi nào.</Typography>
            <Typography sx={{ fontSize: 12, color: MUTED, mt: 0.3 }}>Bấm <strong>Thêm câu hỏi</strong> để bắt đầu soạn đề.</Typography>
          </Box>
        ) : (
          questions.map((q, i) => (
            <QuestionCard
              key={q.id}
              q={q}
              index={i}
              total={questions.length}
              onChange={(updated) => patchQuestion(i, updated)}
              onDelete={() => deleteQuestion(i)}
              disabled={disabled}
            />
          ))
        )}
      </Box>

      {errors._sections && (
        <Typography sx={{ fontSize: 11, color: '#DC2626', mt: 1 }}>{errors._sections}</Typography>
      )}
    </Box>
  );
}
