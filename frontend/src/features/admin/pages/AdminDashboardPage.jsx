import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  Button,
  Chip,
  alpha
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import BookOutlinedIcon from '@mui/icons-material/BookOutlined';
import { toast } from '@/shared/ui/Toast';
import { PRIMARY, TEXT, MUTED } from '@/features/mentor/components/course/mentorCourseCreateStyles';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5050/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-role-name': 'admin'
        }
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      } else {
        toast.error('Không thể tải thống kê tổng quan');
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const MetricCard = ({ title, value, icon, color }) => (
    <Card
      sx={{
        p: 3,
        borderRadius: '16px',
        border: '1px solid rgba(15,23,42,0.08)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01)',
        position: 'relative',
        overflow: 'hidden',
        background: '#fff'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 650, color: MUTED, mb: 1 }}>
            {title}
          </Typography>
          <Typography sx={{ fontSize: 28, fontWeight: 800, color: TEXT, lineHeight: 1 }}>
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            bgcolor: alpha(color, 0.1),
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {icon}
        </Box>
      </Box>
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '4px',
          bgcolor: color
        }}
      />
    </Card>
  );

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-[24px] sm:text-[26px] font-bold leading-[1.3] flex items-center gap-2" style={{ color: TEXT }}>
          <DashboardIcon sx={{ fontSize: 28, color: PRIMARY }} /> Tổng quan hệ thống
        </h1>
        <p className="text-[14px] mt-1 leading-[1.55]" style={{ color: MUTED }}>
          Chào mừng trở lại! Dưới đây là tình hình hoạt động, thống kê khóa học và các phê duyệt đang chờ xử lý.
        </p>
      </div>

      {loading ? (
        <Typography sx={{ color: MUTED, py: 4, textAlign: 'center' }}>Đang tải số liệu tổng quan...</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Metrics Grid */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="TỔNG THÀNH VIÊN"
                value={stats?.totalUsers || 0}
                icon={<PeopleAltOutlinedIcon />}
                color="#0891B2"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="TỔNG KHÓA HỌC"
                value={stats?.totalCourses || 0}
                icon={<MenuBookOutlinedIcon />}
                color="#F59E0B"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="HỌC VIÊN ĐĂNG KÝ"
                value={stats?.totalEnrollments || 0}
                icon={<CheckCircleOutlineOutlinedIcon />}
                color="#10B981"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="KHÓA HỌC XUẤT BẢN"
                value={stats?.publishedCourses || 0}
                icon={<MenuBookOutlinedIcon />}
                color="#8B5CF6"
              />
            </Grid>
          </Grid>

          {/* Pending Action Alerts */}
          <Box>
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: TEXT, mb: 2 }}>
              Các đầu việc cần xử lý
            </Typography>

            <Grid container spacing={3}>
              {/* Pending Course Approvals */}
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    p: 3,
                    borderRadius: '16px',
                    border: `1px solid ${stats?.pendingCourses > 0 ? 'rgba(245,158,11,0.2)' : 'rgba(15,23,42,0.08)'}`,
                    bgcolor: stats?.pendingCourses > 0 ? 'rgba(245,158,11,0.02)' : '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%'
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'start', mb: 3 }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '10px',
                        bgcolor: stats?.pendingCourses > 0 ? 'rgba(245,158,11,0.1)' : 'rgba(15,23,42,0.04)',
                        color: stats?.pendingCourses > 0 ? '#F59E0B' : MUTED,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <BookOutlinedIcon />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 15, fontWeight: 750, color: TEXT }}>
                        Kiểm duyệt khóa học
                      </Typography>
                      <Typography sx={{ fontSize: 13, color: MUTED, mt: 0.5, lineHeight: 1.5 }}>
                        {stats?.pendingCourses > 0
                          ? `Có ${stats.pendingCourses} khóa học mới do Mentor thiết kế đang đợi bạn kiểm duyệt nội dung.`
                          : 'Hiện không có khóa học nào đang đợi kiểm duyệt.'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      label={stats?.pendingCourses > 0 ? `${stats.pendingCourses} Đang chờ` : 'Hoàn thành'}
                      size="small"
                      sx={{
                        fontSize: 11,
                        fontWeight: 700,
                        bgcolor: stats?.pendingCourses > 0 ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                        color: stats?.pendingCourses > 0 ? '#F59E0B' : '#10B981'
                      }}
                    />
                    <Button
                      variant="text"
                      size="small"
                      endIcon={<ArrowForwardRoundedIcon />}
                      onClick={() => navigate('/admin/courses')}
                      sx={{ color: PRIMARY, fontWeight: 700, textTransform: 'none' }}
                    >
                      Xem chi tiết
                    </Button>
                  </Box>
                </Card>
              </Grid>

              {/* Pending Mentor Applications */}
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    p: 3,
                    borderRadius: '16px',
                    border: `1px solid ${stats?.pendingApplications > 0 ? 'rgba(8,145,178,0.2)' : 'rgba(15,23,42,0.08)'}`,
                    bgcolor: stats?.pendingApplications > 0 ? 'rgba(8,145,178,0.02)' : '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%'
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'start', mb: 3 }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '10px',
                        bgcolor: stats?.pendingApplications > 0 ? 'rgba(8,145,178,0.1)' : 'rgba(15,23,42,0.04)',
                        color: stats?.pendingApplications > 0 ? PRIMARY : MUTED,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <AssignmentIndOutlinedIcon />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 15, fontWeight: 750, color: TEXT }}>
                        Đơn ứng tuyển Mentor
                      </Typography>
                      <Typography sx={{ fontSize: 13, color: MUTED, mt: 0.5, lineHeight: 1.5 }}>
                        {stats?.pendingApplications > 0
                          ? `Có ${stats.pendingApplications} hồ sơ ứng tuyển làm Mentor từ học viên chưa được phê duyệt.`
                          : 'Hiện không có đơn ứng tuyển nào chưa xử lý.'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      label={stats?.pendingApplications > 0 ? `${stats.pendingApplications} Đang chờ` : 'Hoàn thành'}
                      size="small"
                      sx={{
                        fontSize: 11,
                        fontWeight: 700,
                        bgcolor: stats?.pendingApplications > 0 ? 'rgba(8,145,178,0.1)' : 'rgba(16,185,129,0.1)',
                        color: stats?.pendingApplications > 0 ? PRIMARY : '#10B981'
                      }}
                    />
                    <Button
                      variant="text"
                      size="small"
                      endIcon={<ArrowForwardRoundedIcon />}
                      onClick={() => navigate('/admin/applications')}
                      sx={{ color: PRIMARY, fontWeight: 700, textTransform: 'none' }}
                    >
                      Xem chi tiết
                    </Button>
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* Quick Shortcuts */}
          <Box>
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: TEXT, mb: 2 }}>
              Lối tắt quản trị nhanh
            </Typography>

            <Grid container spacing={2}>
              {[
                { label: 'Quản lý tài khoản', path: '/admin/accounts', desc: 'Thêm, chặn và chỉnh sửa người dùng' },
                { label: 'Lịch mục danh mục', path: '/admin/categories', desc: 'Cấu hình danh mục học tập' },
                { label: 'Trình độ & Liên kết', path: '/admin/levels', desc: 'Thiết lập các mức level khóa học' },
                { label: 'Nhật ký hệ thống', path: '/admin/history', desc: 'Tra cứu lịch sử sửa đổi của các admin' }
              ].map((item) => (
                <Grid item xs={12} sm={6} md={3} key={item.path}>
                  <Card
                    onClick={() => navigate(item.path)}
                    sx={{
                      p: 2.5,
                      borderRadius: '12px',
                      border: '1px solid rgba(15,23,42,0.06)',
                      cursor: 'pointer',
                      height: '100%',
                      background: '#fff',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: PRIMARY,
                        bgcolor: alpha(PRIMARY, 0.01),
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Typography sx={{ fontSize: 14, fontWeight: 750, color: PRIMARY, mb: 0.5 }}>
                      {item.label}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: MUTED, lineHeight: 1.45 }}>
                      {item.desc}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      )}
    </div>
  );
}
