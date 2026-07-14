import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Avatar,
  alpha,
  Card,
  Collapse,
  Button
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { toast } from '@/shared/ui/Toast';
import { formatAccountDate, getAccountInitials } from '@/features/admin/utils/adminAccountUtils';
import { PRIMARY, TEXT, MUTED } from '@/features/mentor/components/course/mentorCourseCreateStyles';

export default function AdminEditHistoryPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState('all');
  const [expandedLogId, setExpandedLogId] = useState(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const res = await fetch('http://localhost:5050/api/admin/history', {
        headers: {
          'Authorization': `Bearer ${user.token || ''}`,
          'x-user-id': String(user.userId || ''),
          'x-role-name': 'admin'
        }
      });
      const data = await res.json();
      if (data.success) {
        setLogs(data.data || []);
      } else {
        toast.error(data.message || 'Không thể tải lịch sử chỉnh sửa');
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getActionBadgeColor = (action) => {
    switch (action?.toUpperCase()) {
      case 'CREATE':
        return { bgcolor: 'rgba(34,197,94,0.1)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' };
      case 'UPDATE':
        return { bgcolor: 'rgba(59,130,246,0.1)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.2)' };
      case 'DELETE':
        return { bgcolor: 'rgba(239,68,68,0.1)', color: '#EF6868', border: '1px solid rgba(239,68,68,0.2)' };
      case 'APPROVE':
        return { bgcolor: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' };
      case 'REJECT':
        return { bgcolor: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' };
      default:
        return { bgcolor: 'rgba(100,116,139,0.1)', color: '#64748B', border: '1px solid rgba(100,116,139,0.2)' };
    }
  };

  const getEntityTypeLabel = (type) => {
    switch (type) {
      case 'Course': return 'Khóa học';
      case 'Category': return 'Danh mục';
      case 'Level': return 'Trình độ';
      case 'User': return 'Thành viên';
      default: return type;
    }
  };

  const getActionLabel = (action) => {
    switch (action) {
      case 'CREATE': return 'Tạo mới';
      case 'UPDATE': return 'Cập nhật';
      case 'DELETE': return 'Xóa/Ẩn';
      case 'APPROVE': return 'Phê duyệt';
      case 'REJECT': return 'Từ chối';
      case 'BLOCK': return 'Khóa tài khoản';
      case 'UNBLOCK': return 'Mở tài khoản';
      default: return action;
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (entityFilter === 'all') return true;
    return log.entityType === entityFilter;
  });

  const toggleExpandLog = (id) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[22px] sm:text-[24px] font-bold leading-[1.3] flex items-center gap-2" style={{ color: TEXT }}>
            <HistoryIcon sx={{ fontSize: 26, color: PRIMARY }} /> Nhật ký chỉnh sửa
          </h1>
          <p className="text-[14px] mt-1 leading-[1.55]" style={{ color: MUTED }}>
            Xem lại toàn bộ lịch sử thay đổi, cập nhật thông tin khóa học, danh mục từ các Quản trị viên và Mentor.
          </p>
        </div>

        {/* Entity Filters */}
        <Box sx={{ display: 'flex', gap: 1, bgcolor: 'rgba(15,23,42,0.03)', p: 0.5, borderRadius: '99px', border: '1px solid rgba(15,23,42,0.06)' }}>
          {['all', 'Course', 'Category', 'Level'].map((filter) => (
            <Chip
              key={filter}
              label={filter === 'all' ? 'Tất cả' : getEntityTypeLabel(filter)}
              onClick={() => setEntityFilter(filter)}
              sx={{
                height: 28,
                fontSize: 12,
                fontWeight: 650,
                cursor: 'pointer',
                bgcolor: entityFilter === filter ? '#fff' : 'transparent',
                color: entityFilter === filter ? PRIMARY : MUTED,
                boxShadow: entityFilter === filter ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                '&:hover': { bgcolor: entityFilter === filter ? '#fff' : 'rgba(0,0,0,0.04)' }
              }}
            />
          ))}
        </Box>
      </div>

      {loading ? (
        <Typography sx={{ color: MUTED, py: 4, textAlign: 'center' }}>Đang tải nhật ký chỉnh sửa...</Typography>
      ) : filteredLogs.length === 0 ? (
        <Typography sx={{ color: MUTED, py: 4, textAlign: 'center' }}>Không có lịch sử chỉnh sửa nào.</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {filteredLogs.map((log) => {
            const isExpanded = expandedLogId === log._id;
            const actionStyle = getActionBadgeColor(log.action);
            const hasChangesObject = log.changes && Object.keys(log.changes).length > 0;

            return (
              <Card
                key={log._id}
                sx={{
                  p: 2.25,
                  borderRadius: '16px',
                  border: '1px solid rgba(15,23,42,0.08)',
                  boxShadow: '0 1px 3px rgba(15,23,42,0.02)',
                  transition: 'all 0.2s ease',
                  '&:hover': { borderColor: 'rgba(8,145,178,0.2)' }
                }}
              >
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {/* Entity type and Action Badges */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Chip
                        label={getEntityTypeLabel(log.entityType)}
                        size="small"
                        sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: 'rgba(15,23,42,0.05)', color: TEXT }}
                      />
                      <Chip
                        label={getActionLabel(log.action)}
                        size="small"
                        sx={{ height: 20, fontSize: 10.5, fontWeight: 700, borderRadius: '4px', ...actionStyle }}
                      />
                    </Box>

                    {/* Change Description */}
                    <Box>
                      <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: TEXT }}>
                        {log.description}
                      </Typography>
                      <Typography sx={{ fontSize: 11.5, color: MUTED, mt: 0.25 }}>
                        Ngày thay đổi: {formatAccountDate(log.createdAt)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Performed by */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 28, height: 28, bgcolor: alpha(PRIMARY, 0.1), color: PRIMARY, fontSize: 11, fontWeight: 700 }}>
                      {getAccountInitials(log.userId?.fullName || 'Admin')}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontSize: 12.5, fontWeight: 650, color: TEXT }}>
                        {log.userId?.fullName || 'Hệ thống'}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: MUTED }}>
                        {log.userId?.email || 'admin@englishmaster.com'}
                      </Typography>
                    </Box>

                    {hasChangesObject && (
                      <Button
                        size="small"
                        onClick={() => toggleExpandLog(log._id)}
                        sx={{ minWidth: 'auto', p: 0.5, ml: 1, color: MUTED, '&:hover': { color: PRIMARY } }}
                      >
                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </Button>
                    )}
                  </Box>
                </Box>

                {/* Collapsible Changes Diff Block */}
                {hasChangesObject && (
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(15,23,42,0.02)', borderRadius: '12px', border: '1px solid rgba(15,23,42,0.05)' }}>
                      <Typography sx={{ fontSize: 11, fontWeight: 750, color: MUTED, mb: 1, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                        Chi tiết thay đổi
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {Object.entries(log.changes).map(([field, diff]) => (
                          <Box key={field} sx={{ display: 'grid', gridTemplateColumns: '1.5fr 4.25fr 4.25fr', gap: 1, alignItems: 'start', borderBottom: '1px dashed rgba(15,23,42,0.04)', pb: 0.75, '&:last-child': { borderBottom: 'none', pb: 0 } }}>
                            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: TEXT }}>
                              {field}
                            </Typography>
                            <Typography sx={{ fontSize: 12.5, color: '#DC2626', bgcolor: 'rgba(220,38,38,0.04)', px: 1, py: 0.25, borderRadius: '4px' }}>
                              Cũ: {String(diff.old ?? '—')}
                            </Typography>
                            <Typography sx={{ fontSize: 12.5, color: '#16A34A', bgcolor: 'rgba(22,163,74,0.04)', px: 1, py: 0.25, borderRadius: '4px' }}>
                              Mới: {String(diff.new ?? '—')}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Collapse>
                )}
              </Card>
            );
          })}
        </Box>
      )}
    </div>
  );
}
