import { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Menu,
  MenuItem,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import AppButton from '@/shared/ui/AppButton';
import ConfirmDialog from '@/shared/ui/ConfirmDialog';
import { toast } from '@/shared/ui/Toast';
import {
  ADMIN_ACCOUNT_FORM_ROLE_OPTIONS,
  ADMIN_ACCOUNT_FORM_STATUS_OPTIONS,
} from '@/features/admin/data/adminAccountsMock';
import {
  ADMIN_ACCOUNT_ROLE_CHIP_SX,
  ADMIN_ACCOUNT_ROLE_LABELS,
  ADMIN_ACCOUNT_STATUS_CHIP_SX,
  ADMIN_ACCOUNT_STATUS_LABELS,
  getAccountInitials,
  hasAccountEditErrors,
  validateAccountEditForm,
} from '@/features/admin/utils/adminAccountUtils';
import { contentInputSx } from '@/features/mentor/components/course/mentorCourseContentStyles';
import { PRIMARY, TEXT, MUTED } from '@/features/mentor/components/course/mentorCourseCreateStyles';

function getMenuPaperSx(theme) {
  return {
    mt: 0.75,
    borderRadius: '12px',
    boxShadow: theme.ios18?.shadow?.md ?? '0 8px 24px rgba(15,23,42,0.10)',
    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
    overflow: 'hidden',
    minWidth: 180,
  };
}

function FormFieldSelect({
  label,
  icon: Icon,
  iconColor = '#94A3B8',
  value,
  options,
  onChange,
  error = '',
  colorMap = {},
}) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const selected = options.find((option) => option.value === value);
  const selectedColors = colorMap[value];
  const triggerIconColor = selectedColors?.color ?? iconColor;

  return (
    <Box>
      <Typography sx={{ fontSize: 12, fontWeight: 600, color: MUTED, mb: 0.5 }}>{label}</Typography>
      <Box
        component="button"
        type="button"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          ...contentInputSx(Boolean(error)),
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          cursor: 'pointer',
          font: 'inherit',
          textAlign: 'left',
          ...(selectedColors && {
            bgcolor: selectedColors.bgcolor,
            borderColor: selectedColors.border?.replace(/^1px solid /, '') ?? alpha(selectedColors.color, 0.22),
          }),
          ...(open && {
            borderColor: error ? '#DC2626' : (selectedColors?.color ?? PRIMARY),
          }),
        }}
      >
        {Icon ? <Icon sx={{ fontSize: 16, color: triggerIconColor, flexShrink: 0 }} /> : null}
        <Typography
          component="span"
          sx={{
            flex: 1,
            fontSize: 13,
            fontWeight: selectedColors ? 700 : 500,
            color: selectedColors?.color ?? TEXT,
            lineHeight: 1.4,
          }}
        >
          {selected?.label ?? 'Chọn...'}
        </Typography>
        <KeyboardArrowDownRoundedIcon
          sx={{
            fontSize: 20,
            color: '#94A3B8',
            flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s ease',
          }}
        />
      </Box>
      {error ? (
        <Typography sx={{ fontSize: 11, color: '#DC2626', mt: 0.5 }}>{error}</Typography>
      ) : null}

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: { sx: { ...getMenuPaperSx(theme), minWidth: anchorEl?.offsetWidth ?? 180 } },
          list: { dense: true, sx: { py: 0.5 } },
        }}
      >
        {options.map((option) => {
          const isSelected = option.value === value;
          const optionColors = colorMap[option.value];
          return (
            <MenuItem
              key={option.value}
              selected={isSelected}
              onClick={() => {
                onChange(option.value);
                setAnchorEl(null);
              }}
              sx={{
                borderRadius: '8px',
                mx: 0.5,
                my: 0.25,
                minHeight: 34,
                py: 0.5,
                px: 1.25,
                gap: 0.75,
                fontSize: 13,
                fontWeight: isSelected ? 700 : 500,
                color: optionColors?.color ?? (isSelected ? theme.palette.primary.main : theme.palette.text.primary),
                bgcolor: isSelected
                  ? (optionColors?.bgcolor ?? alpha(theme.palette.primary.main, 0.08))
                  : 'transparent',
                '&.Mui-selected': {
                  bgcolor: optionColors?.bgcolor ?? alpha(theme.palette.primary.main, 0.08),
                  '&:hover': {
                    bgcolor: optionColors?.bgcolor ?? alpha(theme.palette.primary.main, 0.1),
                  },
                },
                '&:hover': {
                  bgcolor: optionColors?.bgcolor ?? alpha(theme.palette.primary.main, 0.06),
                },
              }}
            >
              {optionColors ? (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: optionColors.color,
                    flexShrink: 0,
                  }}
                />
              ) : null}
              <Typography component="span" sx={{ flex: 1, fontSize: 13, fontWeight: 'inherit' }}>
                {option.label}
              </Typography>
              {isSelected ? (
                <CheckRoundedIcon
                  sx={{ fontSize: 16, color: optionColors?.color ?? 'primary.main', ml: 1 }}
                />
              ) : (
                <Box sx={{ width: 16, ml: 1, flexShrink: 0 }} />
              )}
            </MenuItem>
          );
        })}
      </Menu>
    </Box>
  );
}

function buildChangeSummary(account, role, status) {
  const lines = [];
  if (account.role !== role) {
    lines.push(
      `Vai trò: ${ADMIN_ACCOUNT_ROLE_LABELS[account.role] ?? account.role} → ${ADMIN_ACCOUNT_ROLE_LABELS[role] ?? role}`,
    );
  }
  if (account.status !== status) {
    lines.push(
      `Trạng thái: ${ADMIN_ACCOUNT_STATUS_LABELS[account.status] ?? account.status} → ${ADMIN_ACCOUNT_STATUS_LABELS[status] ?? status}`,
    );
  }
  return lines;
}

export default function AdminAccountFormDialog({
  open,
  onClose,
  account,
  onSubmit,
  saving = false,
}) {
  const [role, setRole] = useState('Student');
  const [status, setStatus] = useState('ACTIVE');
  const [errors, setErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (open && account) {
      setRole(account.role ?? 'Student');
      setStatus(account.status ?? 'ACTIVE');
      setErrors({});
      setConfirmOpen(false);
    }
  }, [open, account]);

  const hasChanges = useMemo(() => {
    if (!account) return false;
    return account.role !== role || account.status !== status;
  }, [account, role, status]);

  const changeSummary = useMemo(() => {
    if (!account) return [];
    return buildChangeSummary(account, role, status);
  }, [account, role, status]);

  const handleSaveClick = () => {
    const validationErrors = validateAccountEditForm({ role, status });
    if (hasAccountEditErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    if (!hasChanges) {
      toast.info('Không có thay đổi nào để lưu');
      return;
    }

    setConfirmOpen(true);
  };

  const handleConfirmSave = async () => {
    await onSubmit?.({ role, status });
    setConfirmOpen(false);
  };

  if (!account) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={() => !saving && onClose?.()}
        maxWidth="sm"
        fullWidth
        slotProps={{
          backdrop: {
            sx: {
              backdropFilter: 'blur(8px)',
              backgroundColor: alpha('#0F172A', 0.35),
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 0.5 }}>Chỉnh sửa tài khoản</DialogTitle>
        <DialogContent sx={{ pt: 1.5 }}>
          <Typography sx={{ fontSize: 13, color: MUTED, mb: 2, lineHeight: 1.5 }}>
            Chỉ có thể thay đổi vai trò và trạng thái của tài khoản.
          </Typography>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              p: 1.25,
              mb: 2,
              borderRadius: '12px',
              bgcolor: 'rgba(15,23,42,0.03)',
              border: '1px solid rgba(15,23,42,0.06)',
            }}
          >
            <Avatar
              sx={{
                width: 44,
                height: 44,
                bgcolor: alpha(PRIMARY, 0.12),
                color: PRIMARY,
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              {getAccountInitials(account.fullName)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: TEXT, lineHeight: 1.35 }}>
                {account.fullName}
              </Typography>
              {account.username ? (
                <Typography sx={{ fontSize: 12, color: MUTED }}>@{account.username}</Typography>
              ) : null}
              <Typography sx={{ fontSize: 12, color: MUTED, mt: 0.15 }}>{account.email}</Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
            <FormFieldSelect
              label="Vai trò"
              icon={BadgeOutlinedIcon}
              iconColor="#7C3AED"
              value={role}
              options={ADMIN_ACCOUNT_FORM_ROLE_OPTIONS}
              colorMap={ADMIN_ACCOUNT_ROLE_CHIP_SX}
              onChange={(value) => {
                setRole(value);
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.role;
                  return next;
                });
              }}
              error={errors.role}
            />

            <FormFieldSelect
              label="Trạng thái"
              icon={FactCheckOutlinedIcon}
              iconColor="#047857"
              value={status}
              options={ADMIN_ACCOUNT_FORM_STATUS_OPTIONS}
              colorMap={ADMIN_ACCOUNT_STATUS_CHIP_SX}
              onChange={(value) => {
                setStatus(value);
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.status;
                  return next;
                });
              }}
              error={errors.status}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <AppButton variant="outlined" onClick={onClose} disabled={saving}>
            Hủy
          </AppButton>
          <AppButton
            loading={saving}
            disabled={!hasChanges}
            onClick={handleSaveClick}
            sx={{ bgcolor: PRIMARY, '&:hover': { bgcolor: '#0E7490' } }}
          >
            Lưu thay đổi
          </AppButton>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => !saving && setConfirmOpen(false)}
        onConfirm={handleConfirmSave}
        loading={saving}
        title="Lưu thay đổi tài khoản?"
        message={[
          `Bạn sắp cập nhật tài khoản ${account.fullName}.`,
          ...changeSummary,
        ].join(' ')}
        confirmLabel="Lưu thay đổi"
        cancelLabel="Hủy"
      />
    </>
  );
}
