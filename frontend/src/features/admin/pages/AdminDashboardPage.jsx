import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  Button,
  Chip,
  alpha,
  Skeleton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import BookOutlinedIcon from '@mui/icons-material/BookOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
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
        toast.error('Lỗi khi tải số liệu thống kê hệ thống');
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi kết nối mạng');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(value);
  };

  const MetricCard = ({ title, value, icon, color, isLoading, path }) => (
    <Card
      onClick={() => path && navigate(path)}
      className={`rounded-xl shadow-sm border border-slate-100/80 transition-all duration-200 ${path ? 'cursor-pointer hover:shadow-md hover:scale-[1.02]' : ''}`}
      sx={{
        p: 3,
        position: 'relative',
        overflow: 'hidden',
        background: '#fff'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ flex: 1 }}>
          <Typography className="font-semibold text-slate-400 tracking-wider text-[11px] mb-1">
            {title}
          </Typography>
          {isLoading ? (
            <Skeleton variant="text" width="60%" height={40} sx={{ mt: 0.5 }} />
          ) : (
            <Typography sx={{ fontSize: 26, fontWeight: 800, color: TEXT, lineHeight: 1.1 }}>
              {value}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: '12px',
            bgcolor: alpha(color, 0.1),
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
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
    <div className="w-full max-w-7xl mx-auto px-1 sm:px-2">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-[24px] sm:text-[28px] font-extrabold tracking-tight flex items-center gap-2" style={{ color: TEXT }}>
          <DashboardIcon sx={{ fontSize: 30, color: PRIMARY }} /> Bảng điều khiển hệ thống
        </h1>
        <p className="text-[14px] mt-1 text-slate-500 max-w-2xl leading-relaxed">
          Chào mừng trở lại! Dưới đây là hoạt động hệ thống mới nhất, chỉ số khóa học, số lượng dữ liệu thực tế và các phê duyệt đang chờ xử lý.
        </p>
      </div>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {/* Metrics Grid */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <MetricCard
              title="TỔNG NGƯỜI DÙNG"
              value={stats?.totalUsers || 0}
              icon={<PeopleAltOutlinedIcon />}
              color="#0284c7"
              isLoading={loading}
              path="/admin/accounts"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <MetricCard
              title="TỔNG KHÓA HỌC"
              value={stats?.totalCourses || 0}
              icon={<MenuBookOutlinedIcon />}
              color="#ea580c"
              isLoading={loading}
              path="/admin/courses"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <MetricCard
              title="TỔNG LƯỢT ĐĂNG KÝ"
              value={stats?.totalEnrollments || 0}
              icon={<CheckCircleOutlineOutlinedIcon />}
              color="#16a34a"
              isLoading={loading}
              path="/admin/accounts?role=Student"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <MetricCard
              title="KHÓA HỌC PHÁT HÀNH"
              value={stats?.publishedCourses || 0}
              icon={<BookOutlinedIcon />}
              color="#7c3aed"
              isLoading={loading}
              path="/admin/courses"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <MetricCard
              title="DOANH THU HỆ THỐNG"
              value={formatCurrency(stats?.totalRevenue || 0)}
              icon={<MonetizationOnOutlinedIcon />}
              color="#0d9488"
              isLoading={loading}
            />
          </Grid>
        </Grid>

        {/* Pending Action Alerts */}
        <Box>
          <Typography className="text-slate-800 font-bold text-[15px] mb-3 uppercase tracking-wider">
            Nhiệm vụ chờ xử lý
          </Typography>

          <Grid container spacing={3}>
            {/* Pending Course Approvals */}
            <Grid item xs={12} md={6}>
              <Card
                className="rounded-xl shadow-sm border transition-all duration-200"
                sx={{
                  p: 3,
                  borderColor: stats?.pendingCourses > 0 ? 'rgba(234,88,12,0.18)' : 'rgba(15,23,42,0.06)',
                  bgcolor: stats?.pendingCourses > 0 ? 'rgba(234,88,12,0.01)' : '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                  minHeight: 180
                }}
              >
                <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'start', mb: 3 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '10px',
                      bgcolor: stats?.pendingCourses > 0 ? 'rgba(234,88,12,0.1)' : 'rgba(15,23,42,0.04)',
                      color: stats?.pendingCourses > 0 ? '#ea580c' : MUTED,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <BookOutlinedIcon />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 16, fontWeight: 750, color: TEXT }}>
                      Kiểm duyệt khóa học
                    </Typography>
                    {loading ? (
                      <Box sx={{ width: '100%', mt: 1 }}>
                        <Skeleton variant="text" width="85%" />
                        <Skeleton variant="text" width="60%" />
                      </Box>
                    ) : (
                      <Typography sx={{ fontSize: 13.5, color: MUTED, mt: 0.5, lineHeight: 1.5 }}>
                        {stats?.pendingCourses > 0
                          ? `Có ${stats.pendingCourses} khóa học mới do các Mentor thiết kế đang chờ quản trị viên phê duyệt chương trình.`
                          : 'Hiện không có khóa học nào đang chờ phê duyệt.'}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {loading ? (
                    <Skeleton variant="rectangular" width={70} height={24} sx={{ borderRadius: 1 }} />
                  ) : (
                    <Chip
                      label={stats?.pendingCourses > 0 ? `${stats.pendingCourses} Đang chờ` : 'Hoàn thành'}
                      size="small"
                      sx={{
                        fontSize: 11,
                        fontWeight: 700,
                        bgcolor: stats?.pendingCourses > 0 ? 'rgba(234,88,12,0.1)' : 'rgba(22,163,74,0.1)',
                        color: stats?.pendingCourses > 0 ? '#ea580c' : '#16a34a'
                      }}
                    />
                  )}
                  <Button
                    variant="text"
                    size="small"
                    endIcon={<ArrowForwardRoundedIcon />}
                    onClick={() => navigate('/admin/courses')}
                    sx={{ color: PRIMARY, fontWeight: 700, textTransform: 'none' }}
                  >
                    Quản lý
                  </Button>
                </Box>
              </Card>
            </Grid>

            {/* Pending Mentor Applications */}
            <Grid item xs={12} md={6}>
              <Card
                className="rounded-xl shadow-sm border transition-all duration-200"
                sx={{
                  p: 3,
                  borderColor: stats?.pendingApplications > 0 ? 'rgba(2,132,199,0.18)' : 'rgba(15,23,42,0.06)',
                  bgcolor: stats?.pendingApplications > 0 ? 'rgba(2,132,199,0.01)' : '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                  minHeight: 180
                }}
              >
                <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'start', mb: 3 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '10px',
                      bgcolor: stats?.pendingApplications > 0 ? 'rgba(2,132,199,0.1)' : 'rgba(15,23,42,0.04)',
                      color: stats?.pendingApplications > 0 ? '#0284c7' : MUTED,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <AssignmentIndOutlinedIcon />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 16, fontWeight: 750, color: TEXT }}>
                      Đơn ứng tuyển Mentor
                    </Typography>
                    {loading ? (
                      <Box sx={{ width: '100%', mt: 1 }}>
                        <Skeleton variant="text" width="85%" />
                        <Skeleton variant="text" width="60%" />
                      </Box>
                    ) : (
                      <Typography sx={{ fontSize: 13.5, color: MUTED, mt: 0.5, lineHeight: 1.5 }}>
                        {stats?.pendingApplications > 0
                          ? `Có ${stats.pendingApplications} đơn đăng ký ứng tuyển làm Mentor đang chờ quản trị viên xác minh thông tin chứng chỉ.`
                          : 'Hiện không có đơn ứng tuyển nào đang chờ phê duyệt.'}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {loading ? (
                    <Skeleton variant="rectangular" width={70} height={24} sx={{ borderRadius: 1 }} />
                  ) : (
                    <Chip
                      label={stats?.pendingApplications > 0 ? `${stats.pendingApplications} Đang chờ` : 'Hoàn thành'}
                      size="small"
                      sx={{
                        fontSize: 11,
                        fontWeight: 700,
                        bgcolor: stats?.pendingApplications > 0 ? 'rgba(2,132,199,0.1)' : 'rgba(22,163,74,0.1)',
                        color: stats?.pendingApplications > 0 ? '#0284c7' : '#16a34a'
                      }}
                    />
                  )}
                  <Button
                    variant="text"
                    size="small"
                    endIcon={<ArrowForwardRoundedIcon />}
                    onClick={() => navigate('/admin/applications')}
                    sx={{ color: PRIMARY, fontWeight: 700, textTransform: 'none' }}
                  >
                    Quản lý
                  </Button>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Quick Shortcuts */}
        <Box>
          <Typography className="text-slate-800 font-bold text-[15px] mb-3 uppercase tracking-wider">
            Điều hướng nhanh
          </Typography>

          <Grid container spacing={2}>
            {[
              { label: 'Tài khoản', path: '/admin/accounts', desc: 'Tạo, khóa và chỉnh sửa thiết lập hồ sơ người dùng', icon: <PeopleAltOutlinedIcon sx={{ fontSize: 18 }} /> },
              { label: 'Danh mục', path: '/admin/categories', desc: 'Cấu hình danh mục chương trình học tiếng Anh', icon: <CategoryOutlinedIcon sx={{ fontSize: 18 }} /> },
              { label: 'Trình độ', path: '/admin/levels', desc: 'Cấu hình các tham số phân bậc trình độ khó', icon: <LayersOutlinedIcon sx={{ fontSize: 18 }} /> },
              { label: 'Nhật ký hệ thống', path: '/admin/history', desc: 'Xem lại các hoạt động và thay đổi từ quản trị viên', icon: <HistoryOutlinedIcon sx={{ fontSize: 18 }} /> }
            ].map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item.path}>
                <Card
                  onClick={() => navigate(item.path)}
                  className="rounded-xl shadow-sm border border-slate-100 cursor-pointer transition-all duration-200"
                  sx={{
                    p: 2.5,
                    height: '100%',
                    background: '#fff',
                    '&:hover': {
                      borderColor: PRIMARY,
                      bgcolor: alpha(PRIMARY, 0.01),
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <Typography className="flex items-center gap-1.5" sx={{ fontSize: 14.5, fontWeight: 750, color: PRIMARY, mb: 0.5 }}>
                    {item.icon} {item.label}
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
    </div>
  );
}
