/**
 * Mục lục nội dung — UI shell.
 */
import { Box, Typography, alpha } from '@mui/material';
import HeadphonesRoundedIcon from '@mui/icons-material/HeadphonesRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import ListAltRoundedIcon from '@mui/icons-material/ListAltRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { Link } from 'react-router-dom';
import AppButton from '@/shared/ui/AppButton';
import { BUILDER_PANEL_SX } from '@/features/mentor/components/course/mentorCourseContentStyles';
import { MUTED, PRIMARY, TEXT } from '@/features/mentor/components/course/mentorCourseCreateStyles';
import { HEADER_HEIGHT } from '@/shared/layout/MainLayout';

const OUTLINE_ITEMS = [
  { label: 'Nghe', icon: HeadphonesRoundedIcon, color: '#2563EB', children: ['Bài số 1'] },
  { label: 'Đọc', icon: MenuBookRoundedIcon, color: '#7C3AED', children: ['Bài số 1'] },
  { label: 'Từ vựng / Ngữ pháp', icon: EditNoteRoundedIcon, color: '#059669', children: ['Nhóm 1'] },
];

export default function MentorQuestionBankOutlinePanel() {
  return (
    <Box
      sx={{
        alignSelf: 'flex-start',
        position: { lg: 'sticky' },
        top: { lg: HEADER_HEIGHT + 16 },
        zIndex: 1,
      }}
    >
      <Box sx={{ ...BUILDER_PANEL_SX, p: 1.5, mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.25 }}>
          <ListAltRoundedIcon sx={{ fontSize: 18, color: PRIMARY }} />
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: TEXT }}>Mục lục nội dung</Typography>
        </Box>

        {OUTLINE_ITEMS.map(({ label, icon: Icon, color, children }) => (
          <Box key={label} sx={{ mb: 1.25 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.65, mb: 0.5, px: 0.5 }}>
              <Icon sx={{ fontSize: 16, color }} />
              <Typography sx={{ fontSize: 13, fontWeight: 700, color }}>{label}</Typography>
            </Box>
            {children.map((child) => (
              <Box
                key={child}
                sx={{
                  pl: 2.5,
                  py: 0.45,
                  borderRadius: '8px',
                  bgcolor: alpha(PRIMARY, 0.06),
                  mb: 0.35,
                }}
              >
                <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: TEXT }}>{child}</Typography>
              </Box>
            ))}
          </Box>
        ))}
      </Box>

      <Box sx={{ ...BUILDER_PANEL_SX, p: 1.5 }}>
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: MUTED, textTransform: 'uppercase', mb: 1 }}>
          Khóa học
        </Typography>
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: TEXT, mb: 0.35 }}>Tên khóa học</Typography>
        <Typography sx={{ fontSize: 12, color: MUTED, mb: 1.25 }}>Chương hiện tại: Tên chương</Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1.5 }}>
          {['Chương 1', 'Chương 2', 'Chương 3'].map((chapter, index) => (
            <Box
              key={chapter}
              sx={{
                px: 1,
                py: 0.65,
                borderRadius: '10px',
                bgcolor: index === 0 ? alpha(PRIMARY, 0.08) : 'transparent',
                border: index === 0 ? `1px solid ${alpha(PRIMARY, 0.2)}` : '1px solid transparent',
              }}
            >
              <Typography sx={{ fontSize: 12.5, fontWeight: index === 0 ? 700 : 500, color: index === 0 ? PRIMARY : TEXT }}>
                {chapter}
              </Typography>
            </Box>
          ))}
        </Box>

        <AppButton
          component={Link}
          to="/mentor/courses/1/content"
          variant="outlined"
          endIcon={<OpenInNewRoundedIcon />}
          fullWidth
          sx={{ height: 36, borderRadius: '10px', fontSize: 12, fontWeight: 600 }}
        >
          Mở nội dung khóa học
        </AppButton>
      </Box>
    </Box>
  );
}
