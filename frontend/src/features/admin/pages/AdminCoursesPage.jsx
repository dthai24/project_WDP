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
  Switch,
  Tabs,
  Tab,
  alpha
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import HeadphonesRoundedIcon from '@mui/icons-material/HeadphonesRounded';
import AppButton from '@/shared/ui/AppButton';
import ConfirmDialog from '@/shared/ui/ConfirmDialog';
import { toast } from '@/shared/ui/Toast';
import { formatAccountDate, getAccountInitials } from '@/features/admin/utils/adminAccountUtils';
import { PRIMARY, TEXT, MUTED } from '@/features/mentor/components/course/mentorCourseCreateStyles';

const COURSE_REJECTION_TAG_OPTIONS = [
  'nội dung chưa đầy đủ',
  'chất lượng âm thanh/hình ảnh kém',
  'sai thông tin chuyên môn',
  'học liệu không tải được',
  'thiếu bài tập thực hành'
];

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseDetails, setCourseDetails] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false);
  const [rejectFormOpen, setRejectFormOpen] = useState(false);
  
  // Toggle Status Confirm
  const [toggleConfirmOpen, setToggleConfirmOpen] = useState(false);
  const [courseToToggle, setCourseToToggle] = useState(null);

  // Rejection reasons
  const [selectedTags, setSelectedTags] = useState([]);
  const [rejectComment, setRejectComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Filter state
  const [statusFilter, setStatusFilter] = useState('all');

  // Course Updates Approval state
  const [detailsTab, setDetailsTab] = useState('current');
  const [isUpdateAction, setIsUpdateAction] = useState(false);

  const getHeaders = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return {
      'Authorization': `Bearer ${user.token || ''}`,
      'x-role-name': 'admin',
      'x-user-id': String(user.userId || ''),
      'Content-Type': 'application/json'
    };
  };

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5050/api/admin/courses', {
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setCourses(data.data || []);
      } else {
        toast.error(data.message || 'Không thể tải danh sách khóa học');
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi kết nối hệ thống');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleOpenDetails = async (course) => {
    setSelectedCourse(course);
    setDetailsOpen(true);
    setDetailsTab('current');
    setDetailsLoading(true);
    setCourseDetails(null);
    try {
      const res = await fetch(`http://localhost:5050/api/courses/${course._id}/learning`, {
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setCourseDetails(data);
      } else {
        toast.error('Không thể tải chi tiết lộ trình khóa học');
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi tải thông tin chi tiết');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleApproveClick = () => {
    setIsUpdateAction(false);
    setApproveConfirmOpen(true);
  };

  const handleApproveUpdatesClick = () => {
    setIsUpdateAction(true);
    setApproveConfirmOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!selectedCourse) return;
    setSubmitting(true);
    try {
      const url = isUpdateAction
        ? `http://localhost:5050/api/admin/courses/${selectedCourse._id}/approve-updates`
        : `http://localhost:5050/api/admin/courses/${selectedCourse._id}/approve`;

      const res = await fetch(url, {
        method: 'POST',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        toast.success(isUpdateAction
          ? `Đã phê duyệt các cập nhật cho khóa học "${selectedCourse.courseName}"`
          : `Đã phê duyệt khóa học "${selectedCourse.courseName}"`
        );
        setApproveConfirmOpen(false);
        setDetailsOpen(false);
        setSelectedCourse(null);
        fetchCourses();
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
    setIsUpdateAction(false);
    setSelectedTags([]);
    setRejectComment('');
    setRejectFormOpen(true);
  };

  const handleRejectUpdatesClick = () => {
    setIsUpdateAction(true);
    setSelectedTags([]);
    setRejectComment('');
    setRejectFormOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedCourse) return;
    setSubmitting(true);
    try {
      const url = isUpdateAction
        ? `http://localhost:5050/api/admin/courses/${selectedCourse._id}/reject-updates`
        : `http://localhost:5050/api/admin/courses/${selectedCourse._id}/reject`;

      const res = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          tags: selectedTags,
          comment: rejectComment
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(isUpdateAction
          ? `Đã từ chối các cập nhật cho khóa học "${selectedCourse.courseName}"`
          : `Đã từ chối khóa học "${selectedCourse.courseName}"`
        );
        setRejectFormOpen(false);
        setDetailsOpen(false);
        setSelectedCourse(null);
        fetchCourses();
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

  const handleToggleStateClick = (course) => {
    setCourseToToggle(course);
    setToggleConfirmOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!courseToToggle) return;
    const isCurrentlyActive = courseToToggle.status === 'active';
    const targetStatus = isCurrentlyActive ? 'inactive' : 'active';
    setSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5050/api/admin/courses/${courseToToggle._id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          CourseName: courseToToggle.courseName,
          Description: courseToToggle.description,
          CategoryId: courseToToggle.categoryId?._id,
          LevelId: courseToToggle.levelId?._id,
          InstructorId: courseToToggle.instructorId?._id,
          IsPublished: courseToToggle.isPublished
        })
      });
      
      // Also update its status in the DB
      const res2 = await fetch(`http://localhost:5050/api/admin/courses/${courseToToggle._id}/${targetStatus === 'active' ? 'approve' : 'reject'}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          tags: targetStatus === 'inactive' ? ['quản trị viên khóa trạng thái'] : [],
          comment: ''
        })
      });

      const data = await res2.json();
      if (data.success) {
        toast.success(`Đã chuyển trạng thái khóa học sang ${targetStatus === 'active' ? 'Đang hoạt động' : 'Đã ẩn/khóa'}`);
        setToggleConfirmOpen(false);
        setCourseToToggle(null);
        fetchCourses();
      } else {
        toast.error(data.message || 'Thay đổi trạng thái thất bại');
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi kết nối');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusChipStyles = (status) => {
    if (status === 'active') return { bgcolor: 'rgba(22,163,74,0.1)', color: '#16A34A', border: '1px solid rgba(22,163,74,0.2)' };
    if (status === 'inactive') return { bgcolor: 'rgba(220,38,38,0.1)', color: '#DC2626', border: '1px solid rgba(220,38,38,0.2)' };
    return { bgcolor: 'rgba(234,88,12,0.1)', color: '#EA580C', border: '1px solid rgba(234,88,12,0.2)' };
  };

  const getStatusLabel = (status) => {
    if (status === 'active') return 'Đang hoạt động';
    if (status === 'inactive') return 'Đã khóa/Từ chối';
    return 'Chờ phê duyệt';
  };

  const filteredCourses = courses.filter((c) => {
    if (statusFilter === 'all') return true;
    return c.status === statusFilter;
  });

  const getMaterialIcon = (type) => {
    if (type === 'VIDEO') return <PlayCircleOutlineOutlinedIcon sx={{ fontSize: 16, color: '#0891B2' }} />;
    if (type === 'AUDIO') return <HeadphonesRoundedIcon sx={{ fontSize: 16, color: '#8B5CF6' }} />;
    return <DescriptionOutlinedIcon sx={{ fontSize: 16, color: '#64748B' }} />;
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[22px] sm:text-[24px] font-bold leading-[1.3]" style={{ color: TEXT }}>
            Quản lý khóa học
          </h1>
          <p className="text-[14px] mt-1 leading-[1.55]" style={{ color: MUTED }}>
            Xem danh sách khóa học của các mentor, kiểm duyệt chương trình giảng dạy và cấu hình trạng thái hoạt động.
          </p>
        </div>

        {/* Status Filters */}
        <Box sx={{ display: 'flex', gap: 1, bgcolor: 'rgba(15,23,42,0.03)', p: 0.5, borderRadius: '99px', border: '1px solid rgba(15,23,42,0.06)' }}>
          <Chip
            label="Tất cả"
            onClick={() => setStatusFilter('all')}
            sx={{
              height: 28,
              fontSize: 12,
              fontWeight: 650,
              cursor: 'pointer',
              bgcolor: statusFilter === 'all' ? '#fff' : 'transparent',
              color: statusFilter === 'all' ? PRIMARY : MUTED,
              boxShadow: statusFilter === 'all' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              '&:hover': { bgcolor: statusFilter === 'all' ? '#fff' : 'rgba(0,0,0,0.04)' }
            }}
          />
          <Chip
            label="Chờ duyệt"
            onClick={() => setStatusFilter('pending')}
            sx={{
              height: 28,
              fontSize: 12,
              fontWeight: 650,
              cursor: 'pointer',
              bgcolor: statusFilter === 'pending' ? '#fff' : 'transparent',
              color: statusFilter === 'pending' ? '#EA580C' : MUTED,
              boxShadow: statusFilter === 'pending' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              '&:hover': { bgcolor: statusFilter === 'pending' ? '#fff' : 'rgba(0,0,0,0.04)' }
            }}
          />
          <Chip
            label="Đang hoạt động"
            onClick={() => setStatusFilter('active')}
            sx={{
              height: 28,
              fontSize: 12,
              fontWeight: 650,
              cursor: 'pointer',
              bgcolor: statusFilter === 'active' ? '#fff' : 'transparent',
              color: statusFilter === 'active' ? '#16A34A' : MUTED,
              boxShadow: statusFilter === 'active' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              '&:hover': { bgcolor: statusFilter === 'active' ? '#fff' : 'rgba(0,0,0,0.04)' }
            }}
          />
          <Chip
            label="Đã khóa"
            onClick={() => setStatusFilter('inactive')}
            sx={{
              height: 28,
              fontSize: 12,
              fontWeight: 650,
              cursor: 'pointer',
              bgcolor: statusFilter === 'inactive' ? '#fff' : 'transparent',
              color: statusFilter === 'inactive' ? '#DC2626' : MUTED,
              boxShadow: statusFilter === 'inactive' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              '&:hover': { bgcolor: statusFilter === 'inactive' ? '#fff' : 'rgba(0,0,0,0.04)' }
            }}
          />
        </Box>
      </div>

      {loading ? (
        <Typography sx={{ color: MUTED, py: 4, textAlign: 'center' }}>Đang tải danh sách khóa học...</Typography>
      ) : filteredCourses.length === 0 ? (
        <Typography sx={{ color: MUTED, py: 4, textAlign: 'center' }}>Không tìm thấy khóa học nào phù hợp.</Typography>
      ) : (
        <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(15,23,42,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
          {/* Table Headers */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '2.5fr 2fr 1.5fr 1.5fr 1.5fr 1fr', gap: 2, px: 3, py: 1.5, bgcolor: 'rgba(15,23,42,0.02)', borderBottom: '1px solid rgba(15,23,42,0.06)' }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: MUTED }}>Tên khóa học</Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: MUTED }}>Mentor phụ trách</Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: MUTED }}>Danh mục</Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: MUTED }}>Trình độ</Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: MUTED }}>Trạng thái</Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: MUTED, textAlign: 'right' }}>Thao tác</Typography>
          </Box>

          {/* Table Content */}
          {filteredCourses.map((c) => (
            <Box key={c._id} sx={{ display: 'grid', gridTemplateColumns: '2.5fr 2fr 1.5fr 1.5fr 1.5fr 1fr', gap: 2, px: 3, py: 2, borderBottom: '1px solid rgba(15,23,42,0.06)', alignItems: 'center', '&:last-child': { borderBottom: 'none' } }}>
              <Box>
                <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: TEXT }}>{c.courseName}</Typography>
                {c.hasPendingUpdates && (
                  <Chip
                    label="Yêu cầu cập nhật"
                    size="small"
                    color="warning"
                    variant="outlined"
                    sx={{
                      height: 18,
                      fontSize: 9.5,
                      fontWeight: 700,
                      mt: 0.5,
                      borderStyle: 'dashed'
                    }}
                  />
                )}
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 28, height: 28, bgcolor: alpha(PRIMARY, 0.1), color: PRIMARY, fontSize: 11, fontWeight: 700 }}>
                  {getAccountInitials(c.instructorId?.fullName || 'Mentor')}
                </Avatar>
                <Typography sx={{ fontSize: 13, color: TEXT }}>{c.instructorId?.fullName || 'Chưa phân công'}</Typography>
              </Box>

              <Typography sx={{ fontSize: 13, color: MUTED }}>{c.categoryId?.displayName || '—'}</Typography>
              <Typography sx={{ fontSize: 13, color: MUTED }}>{c.levelId?.displayName || '—'}</Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={getStatusLabel(c.status)}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: 11,
                    fontWeight: 700,
                    borderRadius: '999px',
                    ...getStatusChipStyles(c.status)
                  }}
                />
                {c.status !== 'pending' && (
                  <Switch
                    size="small"
                    checked={c.status === 'active'}
                    onChange={() => handleToggleStateClick(c)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: '#16A34A' },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#16A34A' }
                    }}
                  />
                )}
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Tooltip title="Xem chi tiết & Kiểm duyệt">
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDetails(c)}
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
        maxWidth="md"
        fullWidth
        slotProps={{
          backdrop: { sx: { backdropFilter: 'blur(8px)', backgroundColor: alpha('#0F172A', 0.35) } }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 0.5 }}>Chi tiết khóa học & Lộ trình</DialogTitle>
        <DialogContent dividers sx={{ pt: 2, bgcolor: 'rgba(15,23,42,0.01)' }}>
          {selectedCourse && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Basic Info */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, bgcolor: '#fff', p: 2, borderRadius: '12px', border: '1px solid rgba(15,23,42,0.06)' }}>
                <Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 650, color: MUTED, mb: 0.5 }}>TÊN KHÓA HỌC</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{selectedCourse.courseName}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 650, color: MUTED, mb: 0.5 }}>MENTOR TẠO</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{selectedCourse.instructorId?.fullName || 'Mentor'}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 650, color: MUTED, mb: 0.5 }}>TRẠNG THÁI</Typography>
                  <Chip label={getStatusLabel(selectedCourse.status)} size="small" sx={{ ...getStatusChipStyles(selectedCourse.status), height: 22, fontSize: 11, fontWeight: 700 }} />
                </Box>
              </Box>

              {/* Course Description */}
              <Box sx={{ bgcolor: '#fff', p: 2, borderRadius: '12px', border: '1px solid rgba(15,23,42,0.06)' }}>
                <Typography sx={{ fontSize: 11, fontWeight: 650, color: MUTED, mb: 0.5 }}>MÔ TẢ KHÓA HỌC</Typography>
                <Typography sx={{ fontSize: 13, color: TEXT, lineHeight: 1.6 }}>{selectedCourse.description || 'Chưa cung cấp mô tả.'}</Typography>
              </Box>

              {/* Course Outline (Chapters & Lessons) */}
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: TEXT, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MenuBookOutlinedIcon sx={{ fontSize: 18, color: PRIMARY }} /> Lộ trình & Nội dung giảng dạy
                </Typography>

                {detailsLoading ? (
                  <Typography sx={{ fontSize: 13, color: MUTED, fontStyle: 'italic', py: 2 }}>Đang tải lộ trình chi tiết...</Typography>
                ) : (
                  <Box>
                    {courseDetails?.hasPendingUpdates && (
                      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                        <Tabs value={detailsTab} onChange={(e, val) => setDetailsTab(val)}>
                          <Tab label="Nội dung hiện tại" value="current" sx={{ fontWeight: 700, textTransform: 'none' }} />
                          <Tab 
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                Bản cập nhật đề xuất
                                <Chip label="Mới" size="small" color="warning" sx={{ height: 16, fontSize: 9, fontWeight: 700 }} />
                              </Box>
                            } 
                            value="updates" 
                            sx={{ fontWeight: 700, textTransform: 'none' }} 
                          />
                        </Tabs>
                      </Box>
                    )}

                    {(!courseDetails?.data || courseDetails.data.length === 0) && detailsTab === 'current' ? (
                      <Typography sx={{ fontSize: 13, color: MUTED, fontStyle: 'italic', py: 2 }}>Khóa học này chưa được xây dựng lộ trình bài học.</Typography>
                    ) : (detailsTab === 'updates' && (!courseDetails?.tempContent || courseDetails.tempContent.length === 0)) ? (
                      <Typography sx={{ fontSize: 13, color: MUTED, fontStyle: 'italic', py: 2 }}>Không tìm thấy bản cập nhật đề xuất nào.</Typography>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {(detailsTab === 'updates' ? (courseDetails.tempContent || []) : (courseDetails.data || [])).map((chapter, chapIdx) => {
                          const nodes = chapter.Nodes || chapter.nodes || [];
                          return (
                            <Box key={chapter._id || chapIdx} sx={{ bgcolor: '#fff', border: '1px solid rgba(15,23,42,0.06)', borderRadius: '12px', overflow: 'hidden' }}>
                              {/* Chapter Header */}
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.5, bgcolor: 'rgba(8,145,178,0.03)', borderBottom: '1px solid rgba(15,23,42,0.05)' }}>
                                <FolderOpenOutlinedIcon sx={{ fontSize: 16, color: PRIMARY }} />
                                <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: TEXT }}>
                                  Chương {chapIdx + 1}: {chapter.pathName}
                                </Typography>
                              </Box>

                              {/* Lessons List */}
                              <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                {nodes.map((lesson, lesIdx) => {
                                  const materials = lesson.Materials || lesson.materials || [];
                                  return (
                                    <Box key={lesson._id || lesIdx} sx={{ p: 1.5, borderRadius: '8px', border: '1px dashed rgba(15,23,42,0.08)', bgcolor: 'rgba(15,23,42,0.005)' }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', justifyBetween: 'center', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: TEXT }}>
                                          Bài {lesIdx + 1}: {lesson.nodeName}
                                        </Typography>
                                        <Chip
                                          label={lesson.isFree ? 'Miễn phí (Học thử)' : 'Trả phí'}
                                          size="small"
                                          sx={{
                                            height: 18,
                                            fontSize: 10,
                                            fontWeight: 700,
                                            bgcolor: lesson.isFree ? 'rgba(22,163,74,0.08)' : 'rgba(15,23,42,0.04)',
                                            color: lesson.isFree ? '#16A34A' : MUTED,
                                            borderRadius: '4px'
                                          }}
                                        />
                                      </Box>
                                      
                                      {lesson.description && (
                                        <Typography sx={{ fontSize: 12, color: MUTED, mb: 1, pl: 1, borderLeft: '2px solid rgba(15,23,42,0.1)' }}>
                                          {lesson.description}
                                        </Typography>
                                      )}

                                      {/* Materials in Lesson */}
                                      {materials.length > 0 && (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, pl: 1, mt: 1 }}>
                                          {materials.map((m, matIdx) => (
                                            <Chip
                                              key={m._id || matIdx}
                                              icon={getMaterialIcon(m.materialType)}
                                              label={m.title}
                                              size="small"
                                              sx={{
                                                height: 22,
                                                fontSize: 11,
                                                fontWeight: 500,
                                                bgcolor: '#fff',
                                                border: '1px solid rgba(15,23,42,0.05)',
                                                color: TEXT
                                              }}
                                            />
                                          ))}
                                        </Box>
                                      )}
                                    </Box>
                                  );
                                })}
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    )}
                  </Box>
                )}
              </Box>

              {/* Previous Rejection Reasons if inactive */}
              {selectedCourse.status === 'inactive' && (
                <Box sx={{ bgcolor: 'rgba(220,38,38,0.03)', border: '1px solid rgba(220,38,38,0.1)', p: 2, borderRadius: '12px' }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#DC2626', mb: 0.5 }}>Ý KIẾN / LÝ DO TỪ CHỐI TRƯỚC ĐÓ</Typography>
                  {selectedCourse.rejectionTags?.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                      {selectedCourse.rejectionTags.map((tag) => (
                        <Chip key={tag} label={tag} size="small" sx={{ height: 20, fontSize: 10.5, bgcolor: 'rgba(220,38,38,0.08)', color: '#DC2626', fontWeight: 600 }} />
                      ))}
                    </Box>
                  )}
                  {selectedCourse.rejectionComment && (
                    <Typography sx={{ fontSize: 12.5, color: '#DC2626', fontStyle: 'italic' }}>
                      "{selectedCourse.rejectionComment}"
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
          {selectedCourse && selectedCourse.status === 'pending' && (
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
          {selectedCourse && (selectedCourse.hasPendingUpdates || courseDetails?.hasPendingUpdates) && (
            <>
              <AppButton
                variant="contained"
                onClick={handleRejectUpdatesClick}
                disabled={submitting}
                sx={{ bgcolor: '#DC2626', '&:hover': { bgcolor: '#B91C1C' } }}
              >
                Từ chối cập nhật
              </AppButton>
              <AppButton
                variant="contained"
                onClick={handleApproveUpdatesClick}
                disabled={submitting}
                sx={{ bgcolor: '#16A34A', '&:hover': { bgcolor: '#15803D' } }}
              >
                Phê duyệt cập nhật
              </AppButton>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Approve Course Confirmation */}
      <ConfirmDialog
        open={approveConfirmOpen}
        onClose={() => !submitting && setApproveConfirmOpen(false)}
        onConfirm={handleConfirmApprove}
        loading={submitting}
        title="Duyệt khóa học này?"
        message={selectedCourse ? `Bạn có chắc muốn phê duyệt khóa học "${selectedCourse.courseName}" không? Học viên sẽ lập tức học thử và mua được khóa học này.` : ''}
        confirmLabel="Phê duyệt"
        cancelLabel="Hủy"
      />

      {/* Course Toggle Status Confirmation */}
      <ConfirmDialog
        open={toggleConfirmOpen}
        onClose={() => !submitting && setToggleConfirmOpen(false)}
        onConfirm={handleConfirmToggle}
        loading={submitting}
        title="Thay đổi trạng thái khóa học?"
        message={courseToToggle ? `Bạn có chắc muốn ${courseToToggle.status === 'active' ? 'ẨN/KHÓA' : 'MỞ HOẠT ĐỘNG'} khóa học "${courseToToggle.courseName}" không?` : ''}
        confirmLabel="Đồng ý"
        cancelLabel="Hủy"
      />

      {/* Reject Course Dialog */}
      <Dialog
        open={rejectFormOpen}
        onClose={() => !submitting && setRejectFormOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          backdrop: { sx: { backdropFilter: 'blur(8px)', backgroundColor: alpha('#0F172A', 0.35) } }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Lý do từ chối khóa học</DialogTitle>
        <DialogContent dividers>
          <Typography sx={{ fontSize: 13, color: MUTED, mb: 2 }}>
            Vui lòng chọn các lí do kiểm duyệt chưa đạt yêu cầu của khóa học.
          </Typography>

          <Typography sx={{ fontSize: 13, fontWeight: 700, color: TEXT, mb: 1 }}>
            Lí do chính (nhấp chọn)
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 3.5 }}>
            {COURSE_REJECTION_TAG_OPTIONS.map((tag) => {
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
            Góp ý phản hồi chi tiết (tùy chọn)
          </Typography>
          <TextField
            fullWidth
            size="small"
            multiline
            rows={3}
            placeholder="Mô tả cụ thể những bài học hoặc tài liệu cần chỉnh sửa..."
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
            Từ chối duyệt khóa học
          </AppButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}
