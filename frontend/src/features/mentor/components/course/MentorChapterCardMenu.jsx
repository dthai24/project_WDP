import { useState } from 'react';
import { IconButton, Menu, MenuItem, Tooltip, Typography, alpha, useTheme } from '@mui/material';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import { ICON_BTN_SX } from './mentorCourseContentStyles';
import { PRIMARY } from './mentorCourseCreateStyles';

function getMenuPaperSx(theme) {
  return {
    mt: 0.5,
    minWidth: 196,
    borderRadius: '12px',
    border: '1px solid rgba(15,23,42,0.08)',
    boxShadow: '0 8px 24px rgba(15,23,42,0.10)',
    bgcolor: '#fff',
    '& .MuiList-root': { py: 0.5 },
  };
}

export default function MentorChapterCardMenu({
  disabled = false,
  quizSetupDisabled = false,
  quizSetupDisabledReason = '',
  variant = 'chapter',
  onQuizSetup,
}) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const isCourseVariant = variant === 'course';
  const menuLabel = isCourseVariant ? 'Thiết lập kiểm tra toàn khóa' : 'Thiết lập kiểm tra';
  const ariaLabel = isCourseVariant ? 'Tùy chọn khóa học' : 'Tùy chọn chương';

  const handleOpen = (event) => {
    event.stopPropagation();
    if (disabled) return;
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleQuizSetup = () => {
    handleClose();
    onQuizSetup?.();
  };

  const menuButton = (
    <IconButton
      size="small"
      onClick={handleOpen}
      disabled={disabled}
      aria-label={ariaLabel}
      sx={ICON_BTN_SX}
    >
      <MoreVertRoundedIcon sx={{ fontSize: 18 }} />
    </IconButton>
  );

  return (
    <>
      {quizSetupDisabled && quizSetupDisabledReason ? (
        <Tooltip title={quizSetupDisabledReason}>
          <span>{menuButton}</span>
        </Tooltip>
      ) : (
        menuButton
      )}

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: { sx: getMenuPaperSx(theme) },
          list: { dense: true, sx: { py: 0.5 } },
        }}
      >
        <MenuItem
          onClick={handleQuizSetup}
          disabled={quizSetupDisabled}
          sx={{
            borderRadius: '8px',
            mx: 0.5,
            my: 0.25,
            minHeight: 36,
            py: 0.75,
            px: 1.25,
            gap: 1,
            fontSize: 13,
            fontWeight: 500,
            '&:hover': { bgcolor: alpha(PRIMARY, 0.06) },
          }}
        >
          <QuizRoundedIcon sx={{ fontSize: 18, color: '#7C3AED' }} />
          <Typography component="span" sx={{ fontSize: 13, fontWeight: 500 }}>
            {menuLabel}
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
}
