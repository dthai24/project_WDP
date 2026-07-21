import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import MentorPageShell from '@/features/mentor/components/MentorPageShell';

const MOCK_STUDENTS_PROGRESS = [
  {
    id: 'st_1',
    name: 'Nguyễn Minh An',
    email: 'minhan.nguyen@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    courseName: 'TOEIC Starter: Target 450+',
    currentLesson: 'Lesson 4: Cấu trúc câu & Thì Hiện tại hoàn thành',
    progress: 85,
    status: 'learning',
    lastActive: '10 phút trước',
    scoreResult: '80% (Dự đoán 650 TOEIC)'
  },
  {
    id: 'st_2',
    name: 'Trần Thu Hà',
    email: 'thuha.tran@outlook.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    courseName: 'IELTS Master 4 Skills: Band 7.5+',
    currentLesson: 'Lesson 12: Kỹ thuật viết mở bài & kết bài Task 2',
    progress: 100,
    status: 'completed',
    lastActive: '2 giờ trước',
    scoreResult: '100% (Dự đoán Band 8.0 IELTS)'
  },
  {
    id: 'st_3',
    name: 'Lê Quang Huy',
    email: 'quanghuy.le@tech.vn',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    courseName: 'Tiếng Anh Giao Tiếp Công Sở Business English',
    currentLesson: 'Lesson 2: Từ vựng điều hành cuộc họp',
    progress: 40,
    status: 'learning',
    lastActive: '1 ngày trước',
    scoreResult: 'Chưa làm bài test'
  },
  {
    id: 'st_4',
    name: 'Phạm Bảo Ngọc',
    email: 'baongoc.pham@edu.vn',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    courseName: 'TOEIC Intermediate: Target 650-800',
    currentLesson: 'Lesson 8: Đọc hiểu văn bản Triple Passages Part 7',
    progress: 62,
    status: 'learning',
    lastActive: '3 giờ trước',
    scoreResult: '60% (Dự đoán 550 TOEIC)'
  },
  {
    id: 'st_5',
    name: 'Đặng Tuấn Anh',
    email: 'tuananh.dang@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    courseName: 'IELTS Foundation: Xây nền 4 Kỹ Năng',
    currentLesson: 'Lesson 1: Giới thiệu cấu trúc đề thi Listening',
    progress: 15,
    status: 'learning',
    lastActive: '5 ngày trước',
    scoreResult: 'Chưa làm bài test'
  },
  {
    id: 'st_6',
    name: 'Vũ Thị Hồng',
    email: 'hong.vu@company.com',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    courseName: 'TOEIC Starter: Target 450+',
    currentLesson: 'Lesson 10: Tổng ôn trắc nghiệm Part 5 & Part 6',
    progress: 100,
    status: 'completed',
    lastActive: 'Hôm qua',
    scoreResult: '100% (Dự đoán 880 TOEIC)'
  }
];

export default function MentorStudentProgressPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');

  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [reminderMessage, setReminderMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const filteredStudents = useMemo(() => {
    return MOCK_STUDENTS_PROGRESS.filter(st => {
      const matchesSearch = st.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            st.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || st.status === statusFilter;
      const matchesCourse = courseFilter === 'all' || st.courseName.includes(courseFilter);
      return matchesSearch && matchesStatus && matchesCourse;
    });
  }, [searchTerm, statusFilter, courseFilter]);

  const handleOpenReminder = (st) => {
    setSelectedStudent(st);
    setReminderMessage(`Chào ${st.name}, Mentor nhận thấy bạn đang ở bài "${st.currentLesson}". Hãy giữ vững tiến độ và tiếp tục hoàn thành các bài học tiếp theo nhé!`);
    setReminderModalOpen(true);
  };

  const handleSendReminder = () => {
    setReminderModalOpen(false);
    setSnackbarOpen(true);
  };

  return (
    <MentorPageShell
      title="Tiến độ học viên"
      description="Theo dõi chi tiết tiến độ học tập, bài thi đánh giá và hỗ trợ nhắc nhở học viên kịp thời."
    >
      <Box sx={{ width: '100%', spaceY: 3, fontFamily: 'sans-serif' }}>
        {/* Metric Summary Cards */}
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '20px',
                bgcolor: '#FFFFFF',
                border: '1px solid rgba(15,23,42,0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <Box sx={{ w: 48, h: 48, borderRadius: '16px', bgcolor: 'rgba(8,145,178,0.1)', color: '#0891B2', display: 'flex', alignItems: 'center', justifyCenter: 'center', p: 1.2 }}>
                <PeopleAltRoundedIcon />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Tổng học viên</Typography>
                <Typography sx={{ fontSize: 22, fontWeight: 800, color: '#0F172A' }}>142</Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '20px',
                bgcolor: '#FFFFFF',
                border: '1px solid rgba(15,23,42,0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <Box sx={{ w: 48, h: 48, borderRadius: '16px', bgcolor: 'rgba(99,102,241,0.1)', color: '#6366F1', display: 'flex', alignItems: 'center', justifyCenter: 'center', p: 1.2 }}>
                <MenuBookRoundedIcon />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Đang học tích cực</Typography>
                <Typography sx={{ fontSize: 22, fontWeight: 800, color: '#0F172A' }}>98</Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '20px',
                bgcolor: '#FFFFFF',
                border: '1px solid rgba(15,23,42,0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <Box sx={{ w: 48, h: 48, borderRadius: '16px', bgcolor: 'rgba(16,185,129,0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyCenter: 'center', p: 1.2 }}>
                <CheckCircleRoundedIcon />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Đã hoàn thành khóa</Typography>
                <Typography sx={{ fontSize: 22, fontWeight: 800, color: '#0F172A' }}>44</Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '20px',
                bgcolor: '#FFFFFF',
                border: '1px solid rgba(15,23,42,0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <Box sx={{ w: 48, h: 48, borderRadius: '16px', bgcolor: 'rgba(245,158,11,0.1)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyCenter: 'center', p: 1.2 }}>
                <ShowChartRoundedIcon />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Tiến độ trung bình</Typography>
                <Typography sx={{ fontSize: 22, fontWeight: 800, color: '#0F172A' }}>76.4%</Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Search & Filter Toolbar */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: '24px',
            bgcolor: '#FFFFFF',
            border: '1px solid rgba(15,23,42,0.08)',
            mb: 3
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                size="small"
                placeholder="Tìm kiếm theo tên hoặc email học viên..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                    </InputAdornment>
                  )
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3.5}>
              <FormControl fullWidth size="small">
                <InputLabel>Lọc theo Khóa học</InputLabel>
                <Select
                  value={courseFilter}
                  label="Lọc theo Khóa học"
                  onChange={e => setCourseFilter(e.target.value)}
                  sx={{ borderRadius: '14px' }}
                >
                  <MenuItem value="all">Tất cả khóa học</MenuItem>
                  <MenuItem value="TOEIC">Các khóa TOEIC</MenuItem>
                  <MenuItem value="IELTS">Các khóa IELTS</MenuItem>
                  <MenuItem value="Business">Business English</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3.5}>
              <FormControl fullWidth size="small">
                <InputLabel>Lọc Trạng thái học</InputLabel>
                <Select
                  value={statusFilter}
                  label="Lọc Trạng thái học"
                  onChange={e => setStatusFilter(e.target.value)}
                  sx={{ borderRadius: '14px' }}
                >
                  <MenuItem value="all">Tất cả trạng thái</MenuItem>
                  <MenuItem value="learning">Đang học tích cực</MenuItem>
                  <MenuItem value="completed">Đã hoàn thành (100%)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Student Progress Table */}
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '24px', border: '1px solid rgba(15,23,42,0.08)' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, fontSize: 12, color: '#475569' }}>HỌC VIÊN</TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: 12, color: '#475569' }}>KHÓA HỌC DANG THAM GIA</TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: 12, color: '#475569' }}>BÀI HỌC HIỆN TẠI</TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: 12, color: '#475569' }}>TIẾN ĐỘ</TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: 12, color: '#475569' }}>KẾT QUẢ ĐÁNH GIÁ</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, fontSize: 12, color: '#475569' }}>HÀNH ĐỘNG</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.map((st) => (
                <TableRow key={st.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar src={st.avatar} alt={st.name} sx={{ width: 38, height: 38, border: '2px solid #FFF', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
                      <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{st.name}</Typography>
                        <Typography sx={{ fontSize: 11, color: '#94A3B8' }}>{st.email}</Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: '#334155' }}>
                      {st.courseName}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography sx={{ fontSize: 12, color: '#475569' }}>
                      {st.currentLesson}
                    </Typography>
                    <Typography sx={{ fontSize: 10, color: '#94A3B8', mt: 0.2 }}>
                      Hoạt động: {st.lastActive}
                    </Typography>
                  </TableCell>

                  <TableCell sx={{ width: 160 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', mb: 0.5 }}>
                      <Typography sx={{ fontSize: 11, fontWeight: 800, color: st.progress === 100 ? '#059669' : '#0891B2' }}>
                        {st.progress}%
                      </Typography>
                      <Chip
                        label={st.progress === 100 ? 'Hoàn thành' : 'Đang học'}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: 10,
                          fontWeight: 700,
                          bgcolor: st.progress === 100 ? 'rgba(16,185,129,0.1)' : 'rgba(8,145,178,0.1)',
                          color: st.progress === 100 ? '#059669' : '#0891B2'
                        }}
                      />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={st.progress}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: '#F1F5F9',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                          bgcolor: st.progress === 100 ? '#10B981' : '#0891B2'
                        }
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: '#4F46E5' }}>
                      {st.scoreResult}
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    <Tooltip title="Gửi lời nhắn / Nhắc nhở học tập">
                      <IconButton size="small" onClick={() => handleOpenReminder(st)} sx={{ color: '#0891B2', bgcolor: 'rgba(8,145,178,0.08)', mr: 1, '&:hover': { bgcolor: 'rgba(8,145,178,0.18)' } }}>
                        <SendRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Send Reminder Dialog Modal */}
        <Dialog open={reminderModalOpen} onClose={() => setReminderModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}>
          <DialogTitle sx={{ fontWeight: 800, fontSize: 18, color: '#0F172A' }}>
            Gửi lời nhắn động viên học tập
          </DialogTitle>
          <DialogContent dividers sx={{ py: 2.5 }}>
            {selectedStudent && (
              <Box sx={{ mb: 2, p: 2, bgcolor: '#F8FAFC', borderRadius: '16px', border: '1px solid #F1F5F9' }}>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                  Học viên: {selectedStudent.name} ({selectedStudent.email})
                </Typography>
                <Typography sx={{ fontSize: 12, color: '#64748B', mt: 0.5 }}>
                  Khóa học: {selectedStudent.courseName} - Tiến độ hiện tại: <strong>{selectedStudent.progress}%</strong>
                </Typography>
              </Box>
            )}
            <TextField
              label="Nội dung tin nhắn nhắc nhở"
              multiline
              rows={4}
              fullWidth
              value={reminderMessage}
              onChange={e => setReminderMessage(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setReminderModalOpen(false)} sx={{ borderRadius: '12px', color: '#64748B', fontWeight: 600 }}>
              Hủy
            </Button>
            <Button onClick={handleSendReminder} variant="contained" endIcon={<SendRoundedIcon />} sx={{ borderRadius: '12px', bgcolor: '#0891B2', fontWeight: 700, '&:hover': { bgcolor: '#0E7490' } }}>
              Gửi tin nhắn
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert severity="success" sx={{ borderRadius: '16px', fontWeight: 700 }}>
            Đã gửi tin nhắn nhắc nhở học tập cho học viên thành công!
          </Alert>
        </Snackbar>
      </Box>
    </MentorPageShell>
  );
}
