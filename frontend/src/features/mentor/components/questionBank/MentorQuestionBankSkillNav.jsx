/**
 * Tabbar kỹ năng — UI shell.
 */
import { Box, Typography, alpha } from '@mui/material';
import HeadphonesRoundedIcon from '@mui/icons-material/HeadphonesRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import { BUILDER_PANEL_SX } from '@/features/mentor/components/course/mentorCourseContentStyles';
import { MUTED, TEXT } from '@/features/mentor/components/course/mentorCourseCreateStyles';
import { HEADER_HEIGHT } from '@/shared/layout/MainLayout';

const SKILLS = [
  { label: 'Nghe', icon: HeadphonesRoundedIcon, color: '#2563EB', selected: true, meta: '1 bài · 0 câu hỏi' },
  { label: 'Đọc', icon: MenuBookRoundedIcon, color: '#7C3AED', selected: false, meta: '1 bài · 0 câu hỏi' },
  { label: 'Từ vựng / Ngữ pháp', icon: EditNoteRoundedIcon, color: '#059669', selected: false, meta: '1 nhóm · 0 câu hỏi' },
];

export default function MentorQuestionBankSkillNav() {
  return (
    <Box
      sx={{
        width: { xs: '100%', lg: 200 },
        flexShrink: 0,
        alignSelf: 'flex-start',
        position: { lg: 'sticky' },
        top: { lg: HEADER_HEIGHT + 16 },
        zIndex: 2,
      }}
    >
      <Box sx={{ ...BUILDER_PANEL_SX, p: 1.25 }}>
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 700,
            color: MUTED,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            mb: 1,
            px: 0.5,
          }}
        >
          Kỹ năng
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.35 }}>
          {SKILLS.map(({ label, icon: Icon, color, selected, meta }) => (
            <Box
              key={label}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.85,
                width: '100%',
                border: selected ? `1px solid ${alpha(color, 0.35)}` : '1px solid transparent',
                borderRadius: '12px',
                bgcolor: selected ? alpha(color, 0.1) : 'transparent',
                px: 1,
                py: 0.85,
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '10px',
                  bgcolor: selected ? '#fff' : alpha(color, 0.1),
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon sx={{ fontSize: 17, color }} />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ fontSize: 13, fontWeight: selected ? 700 : 600, color: selected ? color : TEXT, lineHeight: 1.3 }}>
                  {label}
                </Typography>
                <Typography sx={{ fontSize: 11, color: MUTED, mt: 0.15 }}>{meta}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
