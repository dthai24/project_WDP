/**
 * Chuyển / thêm bài (Nghe, Đọc) hoặc nhóm câu hỏi (Từ vựng–Ngữ pháp).
 */
import { Box, Typography, alpha } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import { MUTED, PRIMARY, TEXT } from '@/features/mentor/components/course/mentorCourseCreateStyles';
import {
  getFilledTestQuestions,
  getQuestionBankSectionTabLabel,
  isQuestionBankWritingSkill,
} from '@/features/mentor/utils/mentorTestContentUtils';

function BaiTab({ label, selected, disabled, accentColor, hasContent = false, onClick }) {
  const StatusIcon = hasContent ? CheckCircleOutlineRoundedIcon : RadioButtonUncheckedRoundedIcon;
  const statusColor = hasContent ? '#047857' : alpha(MUTED, 0.85);

  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={hasContent ? 'Đã có câu hỏi' : 'Chưa có câu hỏi'}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1.25,
        py: 0.55,
        borderRadius: '999px',
        border: selected ? `1px solid ${alpha(accentColor, 0.4)}` : '1px solid rgba(15,23,42,0.1)',
        bgcolor: selected ? alpha(accentColor, 0.1) : '#fff',
        color: selected ? accentColor : TEXT,
        fontSize: 12,
        fontWeight: selected ? 700 : 600,
        fontFamily: 'inherit',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        maxWidth: { xs: '100%', sm: 220 },
        overflow: 'hidden',
        transition: 'background-color 0.15s, border-color 0.15s',
        '&:hover': disabled
          ? undefined
          : {
              bgcolor: selected ? alpha(accentColor, 0.14) : 'rgba(15,23,42,0.04)',
            },
      }}
    >
      <StatusIcon sx={{ fontSize: 15, color: statusColor, flexShrink: 0 }} />
      <Box
        component="span"
        sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          minWidth: 0,
        }}
      >
        {label}
      </Box>
    </Box>
  );
}

export default function MentorQuestionBankBaiNav({
  skillSections = [],
  allSections = [],
  activeSkill,
  activeSectionId = '',
  accentColor = PRIMARY,
  disabled = false,
  onSelect,
  onAdd,
}) {
  const isWritingSkill = isQuestionBankWritingSkill(activeSkill);
  const addLabel = isWritingSkill ? 'Thêm nhóm câu hỏi' : 'Thêm bài';
  const countLabel = isWritingSkill ? 'nhóm' : 'bài';

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.75, mb: 2 }}>
      {skillSections.map((section) => (
        <BaiTab
          key={section.tempId}
          label={getQuestionBankSectionTabLabel(section, allSections)}
          hasContent={getFilledTestQuestions(section?.Questions).length > 0}
          selected={section.tempId === activeSectionId}
          disabled={disabled}
          accentColor={accentColor}
          onClick={() => onSelect?.(section.tempId)}
        />
      ))}
      <Box
        component="button"
        type="button"
        onClick={onAdd}
        disabled={disabled}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.35,
          px: 1,
          py: 0.55,
          borderRadius: '999px',
          border: '1px dashed rgba(15,23,42,0.18)',
          bgcolor: 'transparent',
          color: MUTED,
          fontSize: 12,
          fontWeight: 600,
          fontFamily: 'inherit',
          cursor: disabled ? 'default' : 'pointer',
          opacity: disabled ? 0.55 : 1,
          '&:hover': disabled ? undefined : { bgcolor: 'rgba(15,23,42,0.04)', color: TEXT },
        }}
      >
        <AddRoundedIcon sx={{ fontSize: 15 }} />
        {addLabel}
      </Box>
      {skillSections.length > 0 && (
        <Typography sx={{ fontSize: 11, color: MUTED, ml: { xs: 0, sm: 0.25 } }}>
          {skillSections.length} {countLabel}
        </Typography>
      )}
    </Box>
  );
}
