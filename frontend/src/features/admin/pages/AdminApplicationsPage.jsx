import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Link,
  alpha
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import AppButton from '@/shared/ui/AppButton';
import ConfirmDialog from '@/shared/ui/ConfirmDialog';
import { toast } from '@/shared/ui/Toast';
import { formatAccountDate, getAccountInitials } from '@/features/admin/utils/adminAccountUtils';
import { PRIMARY, TEXT, MUTED } from '@/features/mentor/components/course/mentorCourseCreateStyles';

const REJECTION_TAG_OPTIONS = [
  'sai chứng chỉ',
  'thiếu chứng chỉ',
  'chứng chỉ lỗi',
  'không đạt yêu cầu trình độ',
  'thông tin không trùng khớp'
];

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false);
  const [rejectFormOpen, setRejectFormOpen] = useState(false);
  
  // Rejection state
  const [selectedTags, setSelectedTags] = useState([]);
  const [rejectComment, setRejectComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5050/api/admin/applications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-role-name': 'admin'
        }
      });
      const data = await res.json();
      if (data.success) {
        setApplications(data.data || []);
      } else {
        toast.error(data.message || 'Không thể tải danh sách ứng tuyển');
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi kết nối hệ thống');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleOpenDetails = (app) => {
    setSelectedApp(app);
    setDetailsOpen(true);
  };

  const handleApproveClick = () => {
    setApproveConfirmOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!selectedApp) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5050/api/admin/applications/${selectedApp._id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-role-name': 'admin',
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Đã phê duyệt ${selectedApp.name} làm Mentor`);
        setApproveConfirmOpen(false);
        setDetailsOpen(false);
        setSelectedApp(null);
        fetchApplications();
      } else {
        toast.error(data.message || 'Phê duyệt thất bại');
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi phê duyệt');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectClick = () => {
    setSelectedTags([]);
    setRejectComment('');
    setRejectFormOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedApp) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5050/api/admin/applications/${selectedApp._id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-role-name': 'admin',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tags: selectedTags,
          comment: rejectComment
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Đã từ chối đơn ứng tuyển của ${selectedApp.name}`);
        setRejectFormOpen(false);
        setDetailsOpen(false);
        setSelectedApp(null);
        fetchApplications();
      } else {
        toast.error(data.message || 'Từ chối thất bại');
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi từ chối');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusChipStyles = (status) => {
    if (status === 'approved') return { bgcolor: 'rgba(22,163,74,0.1)', color: '#16A34A', border: '1px solid rgba(22,163,74,0.2)' };
    if (status === 'rejected') return { bgcolor: 'rgba(220,38,38,0.1)', color: '#DC2626', border: '1px solid rgba(220,38,38,0.2)' };
    return { bgcolor: 'rgba(234,88,12,0.1)', color: '#EA580C', border: '1px solid rgba(234,88,12,0.2)' };
  };

  const getStatusLabel = (status) => {
    if (status === 'approved') return 'Đã phê duyệt';
    if (status === 'rejected') return 'Đã từ chối';
    return 'Chờ phê duyệt';
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-[22px] sm:text-[24px] font-bold leading-[1.3]" style={{ color: TEXT }}>
          Phê duyệt Mentor ứng tuyển
        </h1>
        <p className="text-[14px] mt-1 leading-[1.55]" style={{ color: MUTED }}>
          Xem xét thông tin cá nhân và tài liệu minh chứng của học viên xin nâng cấp làm giảng viên/mentor.
        </p>
      </div>

      {loading ? (
        <Typography sx={{ color: MUTED, py: 4, textAlign: 'center' }}>Đang tải danh sách đơn ứng tuyển...</Typography>
      ) : applications.length === 0 ? (
        <Typography sx={{ color: MUTED, py: 4, textAlign: 'center' }}>Không có đơn ứng tuyển nào.</Typography>
      ) : (
        <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(15,23,42,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
          {/* Table Headers */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 2fr 1.5fr 1fr', gap: 2, px: 3, py: 1.5, bgcolor: 'rgba(15,23,42,0.02)', borderBottom: '1px solid rgba(15,23,42,0.06)' }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: MUTED }}>Tên học viên</Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: MUTED }}>Email</Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: MUTED }}>Tuổi</Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: MUTED }}>Cấp độ giảng dạy</Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: MUTED }}>Trạng thái</Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: MUTED, textAlign: 'right' }}>Xem</Typography>
          </Box>

          {/* Table Content */}
          {applications.map((app) => (
            <Box key={app._id} sx={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 2fr 1.5fr 1fr', gap: 2, px: 3, py: 2, borderBottom: '1px solid rgba(15,23,42,0.06)', alignItems: 'center', '&:last-child': { borderBottom: 'none' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 34, height: 34, bgcolor: alpha(PRIMARY, 0.12), color: PRIMARY, fontSize: 13, fontWeight: 700 }}>
                  {getAccountInitials(app.name)}
                </Avatar>
                <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: TEXT }}>{app.name}</Typography>
              </Box>

              <Typography sx={{ fontSize: 13, color: TEXT }}>{app.email}</Typography>
              <Typography sx={{ fontSize: 13, color: TEXT }}>{app.age} tuổi</Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {app.levels?.map((lv) => (
                  <Chip key={lv._id} label={lv.displayName} size="small" sx={{ height: 20, fontSize: 10.5, fontWeight: 600, bgcolor: 'rgba(124,58,237,0.08)', color: '#7C3AED' }} />
                )) || '—'}
              </Box>

              <Box>
                <Chip
                  label={getStatusLabel(app.status)}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: 11,
                    fontWeight: 700,
                    borderRadius: '999px',
                    ...getStatusChipStyles(app.status)
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Tooltip title="Xem chi tiết đơn ứng tuyển">
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDetails(app)}
                    sx={{
                      width: 32,
                      height: 32,
                      border: '1px solid rgba(15,23,42,0.08)',
                      borderRadius: '8px',
                      color: MUTED,
                      '&:hover': { color: PRIMARY, bgcolor: alpha(PRIMARY, 0.05) }
                    }}
                  >
                    <VisibilityOutlinedIcon sx={{ fontSize: 17 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {/* Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          backdrop: { sx: { backdropFilter: 'blur(8px)', backgroundColor: alpha('#0F172A', 0.35) } }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 0.5 }}>Chi tiết đơn ứng tuyển Mentor</DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          {selectedApp && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'rgba(15,23,42,0.02)', p: 2, borderRadius: '12px', border: '1px solid rgba(15,23,42,0.06)' }}>
                <Avatar sx={{ width: 48, height: 48, bgcolor: alpha(PRIMARY, 0.12), color: PRIMARY, fontSize: 16, fontWeight: 700 }}>
                  {getAccountInitials(selectedApp.name)}
                </Avatar>
                <Box>
                  <Typography sx={{ fontSize: 15, fontWeight: 700, color: TEXT }}>{selectedApp.name}</Typography>
                  <Typography sx={{ fontSize: 12.5, color: MUTED }}>{selectedApp.email}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: MUTED, mb: 0.5 }}>Tuổi</Typography>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: TEXT }}>{selectedApp.age} tuổi</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: MUTED, mb: 0.5 }}>Ngày đăng ký</Typography>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: TEXT }}>{formatAccountDate(selectedApp.createdAt)}</Typography>
                </Box>
              </Box>

              <Box>
                <Typography sx={{ fontSize: 11, fontWeight: 600, color: MUTED, mb: 0.5 }}>Cấp độ giảng dạy đăng ký</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selectedApp.levels?.map((lv) => (
                    <Chip key={lv._id} label={lv.displayName} size="small" sx={{ height: 22, fontSize: 11, fontWeight: 600, bgcolor: 'rgba(124,58,237,0.08)', color: '#7C3AED' }} />
                  ))}
                </Box>
              </Box>

              <Box>
                <Typography sx={{ fontSize: 11, fontWeight: 600, color: MUTED, mb: 0.5 }}>Tài liệu minh chứng</Typography>
                {selectedApp.evidence?.startsWith('http') ? (
                  <Link href={selectedApp.evidence} target="_blank" rel="noopener" sx={{ fontSize: 13.5, fontWeight: 600, color: PRIMARY, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 0.5, '&:hover': { textDecoration: 'underline' } }}>
                    Xem liên kết minh chứng (Google Drive / Dropbox) &rarr;
                  </Link>
                ) : (
                  <Typography sx={{ fontSize: 13, color: TEXT, bgcolor: 'rgba(15,23,42,0.02)', p: 1.5, borderRadius: '8px', border: '1px solid rgba(15,23,42,0.06)', whiteSpace: 'pre-wrap' }}>
                    {selectedApp.evidence}
                  </Typography>
                )}
              </Box>

              {selectedApp.status === 'rejected' && (
                <Box sx={{ bgcolor: 'rgba(220,38,38,0.03)', border: '1px solid rgba(220,38,38,0.1)', p: 1.75, borderRadius: '8px' }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#DC2626', mb: 0.5 }}>Lý do từ chối trước đó</Typography>
                  {selectedApp.rejectionTags?.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                      {selectedApp.rejectionTags.map((tag) => (
                        <Chip key={tag} label={tag} size="small" sx={{ height: 20, fontSize: 10.5, bgcolor: 'rgba(220,38,38,0.08)', color: '#DC2626', fontWeight: 600 }} />
                      ))}
                    </Box>
                  )}
                  {selectedApp.rejectionComment && (
                    <Typography sx={{ fontSize: 12.5, color: '#DC2626', fontStyle: 'italic' }}>
                      "{selectedApp.rejectionComment}"
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1 }}>
          <AppButton variant="outlined" onClick={() => setDetailsOpen(false)} disabled={submitting}>
            Đóng
          </AppButton>
          {selectedApp && selectedApp.status === 'pending' && (
            <>
              <AppButton
                variant="contained"
                onClick={handleRejectClick}
                disabled={submitting}
                sx={{ bgcolor: '#DC2626', '&:hover': { bgcolor: '#B91C1C' } }}
              >
                Từ chối
              </AppButton>
              <AppButton
                variant="contained"
                onClick={handleApproveClick}
                disabled={submitting}
                sx={{ bgcolor: '#16A34A', '&:hover': { bgcolor: '#15803D' } }}
              >
                Phê duyệt
              </AppButton>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Approve Confirmation */}
      <ConfirmDialog
        open={approveConfirmOpen}
        onClose={() => !submitting && setApproveConfirmOpen(false)}
        onConfirm={handleConfirmApprove}
        loading={submitting}
        title="Duyệt ứng viên làm Mentor?"
        message={selectedApp ? `Bạn có chắc muốn để ${selectedApp.name} là mentor không?` : ''}
        confirmLabel="Đồng ý"
        cancelLabel="Hủy"
      />

      {/* Reject Details Dialog */}
      <Dialog
        open={rejectFormOpen}
        onClose={() => !submitting && setRejectFormOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          backdrop: { sx: { backdropFilter: 'blur(8px)', backgroundColor: alpha('#0F172A', 0.35) } }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Lý do từ chối ứng tuyển</DialogTitle>
        <DialogContent dividers>
          <Typography sx={{ fontSize: 13, color: MUTED, mb: 2 }}>
            Vui lòng chọn các lí do từ chối hoặc thêm góp ý phản hồi cho ứng viên.
          </Typography>

          <Typography sx={{ fontSize: 13, fontWeight: 700, color: TEXT, mb: 1 }}>
            Lí do từ chối chính (nhấp chọn)
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 3.5 }}>
            {REJECTION_TAG_OPTIONS.map((tag) => {
              const selected = selectedTags.includes(tag);
              return (
                <Chip
                  key={tag}
                  label={tag}
                  onClick={() => {
                    if (selected) {
                      setSelectedTags(selectedTags.filter((t) => t !== tag));
                    } else {
                      setSelectedTags([...selectedTags, tag]);
                    }
                  }}
                  sx={{
                    height: 28,
                    fontSize: 12,
                    fontWeight: 600,
                    borderRadius: '8px',
                    bgcolor: selected ? 'rgba(220,38,38,0.1)' : 'rgba(15,23,42,0.03)',
                    color: selected ? '#DC2626' : MUTED,
                    border: `1px solid ${selected ? 'rgba(220,38,38,0.2)' : 'rgba(15,23,42,0.06)'}`,
                    '&:hover': { bgcolor: selected ? 'rgba(220,38,38,0.15)' : 'rgba(15,23,42,0.06)' }
                  }}
                />
              );
            })}
          </Box>

          <Typography sx={{ fontSize: 13, fontWeight: 700, color: TEXT, mb: 1 }}>
            Góp ý phản hồi (tùy chọn)
          </Typography>
          <TextField
            fullWidth
            size="small"
            multiline
            rows={3}
            placeholder="Nhập chi tiết hướng dẫn học viên cần làm gì..."
            value={rejectComment}
            onChange={(e) => setRejectComment(e.target.value)}
          />
        </DialogContent>

        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <AppButton variant="outlined" onClick={() => setRejectFormOpen(false)} disabled={submitting}>
            Hủy
          </AppButton>
          <AppButton
            variant="contained"
            onClick={handleConfirmReject}
            loading={submitting}
            sx={{ bgcolor: '#DC2626', '&:hover': { bgcolor: '#B91C1C' } }}
          >
            Từ chối đơn ứng tuyển
          </AppButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}
