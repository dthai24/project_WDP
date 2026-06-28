import { useState } from 'react';
import {
  alpha,
  Box,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import SortRoundedIcon from '@mui/icons-material/SortRounded';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import {
  COURSE_STUDENT_SORT_OPTIONS,
  COURSE_STUDENT_STATUS_OPTIONS,
} from '@/features/mentor/data/mentorCourseStudentsMock';
import { DETAIL_TOOLBAR_WRAP_SX, MUTED, SURFACE_SUBTLE } from './mentorCourseCreateStyles';

function getMenuPaperSx(theme) {
  return {
    mt: 0.75,
    borderRadius: '12px',
    boxShadow: theme.ios18?.shadow?.md,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
    overflow: 'hidden',
    minWidth: 180,
  };
}

function FilterTrigger({ icon: Icon, label, hasValue, onClick, open }) {
  const theme = useTheme();
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        height: 38,
        px: 1.25,
        pr: 0.75,
        border: `1px solid ${
          hasValue
            ? alpha(theme.palette.primary.main, 0.22)
            : alpha(theme.palette.primary.main, 0.1)
        }`,
        borderRadius: '999px',
        bgcolor: alpha(theme.palette.primary.main, 0.04),
        color: hasValue ? theme.palette.text.primary : MUTED,
        fontSize: 13,
        fontWeight: hasValue ? 600 : 500,
        cursor: 'pointer',
        fontFamily: 'inherit',
        flexShrink: 0,
        '&:hover': {
          bgcolor: alpha(theme.palette.primary.main, 0.06),
          borderColor: alpha(theme.palette.primary.main, 0.22),
        },
      }}
    >
      <Icon sx={{ fontSize: 16, color: '#94A3B8' }} />
      <Typography component="span" noWrap sx={{ fontSize: 13, maxWidth: 140 }}>
        {label}
      </Typography>
      <KeyboardArrowDownRoundedIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
    </Box>
  );
}

function FilterMenuItem({ selected, label, onClick }) {
  return (
    <MenuItem
      onClick={onClick}
      sx={{
        fontSize: 13,
        py: 1,
        px: 1.5,
        gap: 1,
        fontWeight: selected ? 600 : 500,
      }}
    >
      {selected ? (
        <CheckRoundedIcon sx={{ fontSize: 16, color: '#0891B2' }} />
      ) : (
        <Box sx={{ width: 16 }} />
      )}
      {label}
    </MenuItem>
  );
}

export default function MentorCourseStudentsToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  sortBy,
  onSortChange,
  showReset,
  onReset,
  resultCount,
}) {
  const theme = useTheme();
  const [statusAnchor, setStatusAnchor] = useState(null);
  const [sortAnchor, setSortAnchor] = useState(null);

  const statusLabel =
    COURSE_STUDENT_STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label ?? 'Tất cả';
  const sortLabel =
    COURSE_STUDENT_SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? 'Tiến độ cao nhất';

  return (
    <Box sx={DETAIL_TOOLBAR_WRAP_SX}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <TextField
          size="small"
          placeholder="Tìm học viên..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            flex: { xs: '1 1 100%', sm: '1 1 220px' },
            minWidth: { sm: 220 },
            maxWidth: { sm: 320 },
            '& .MuiOutlinedInput-root': {
              height: 38,
              borderRadius: '999px',
              fontSize: 13,
              bgcolor: SURFACE_SUBTLE,
            },
          }}
        />

        <FilterTrigger
          icon={FilterListRoundedIcon}
          label={statusLabel}
          hasValue={statusFilter !== 'all'}
          open={Boolean(statusAnchor)}
          onClick={(e) => setStatusAnchor(e.currentTarget)}
        />
        <Menu
          anchorEl={statusAnchor}
          open={Boolean(statusAnchor)}
          onClose={() => setStatusAnchor(null)}
          PaperProps={{ sx: getMenuPaperSx(theme) }}
        >
          {COURSE_STUDENT_STATUS_OPTIONS.map((option) => (
            <FilterMenuItem
              key={option.value}
              selected={statusFilter === option.value}
              label={option.label}
              onClick={() => {
                onStatusChange(option.value);
                setStatusAnchor(null);
              }}
            />
          ))}
        </Menu>

        <FilterTrigger
          icon={SortRoundedIcon}
          label={sortLabel}
          hasValue={sortBy !== 'progress_desc'}
          open={Boolean(sortAnchor)}
          onClick={(e) => setSortAnchor(e.currentTarget)}
        />
        <Menu
          anchorEl={sortAnchor}
          open={Boolean(sortAnchor)}
          onClose={() => setSortAnchor(null)}
          PaperProps={{ sx: getMenuPaperSx(theme) }}
        >
          {COURSE_STUDENT_SORT_OPTIONS.map((option) => (
            <FilterMenuItem
              key={option.value}
              selected={sortBy === option.value}
              label={option.label}
              onClick={() => {
                onSortChange(option.value);
                setSortAnchor(null);
              }}
            />
          ))}
        </Menu>

        {showReset && (
          <Tooltip title="Xóa bộ lọc">
            <IconButton
              size="small"
              onClick={onReset}
              sx={{
                width: 38,
                height: 38,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                bgcolor: alpha(theme.palette.primary.main, 0.04),
              }}
            >
              <RestartAltIcon sx={{ fontSize: 18, color: MUTED }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {showReset && (
        <Typography sx={{ fontSize: 12, color: MUTED, mt: 1 }}>
          {typeof resultCount === 'number' ? `${resultCount} kết quả lọc` : 'Đang tải...'}
        </Typography>
      )}
    </Box>
  );
}
