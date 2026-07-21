import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Stack
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import MentorPageShell from '@/features/mentor/components/MentorPageShell';

const INITIAL_NEWS_ARTICLES = [
  {
    id: 'news_1',
    title: 'Chiến lược làm chủ 200 câu hỏi TOEIC ETS Part 5 & Part 7 chỉ trong 30 ngày',
    category: 'Mẹo học tập',
    excerpt: 'Tổng hợp phân tích ma trận bẫy ngữ pháp Part 5 và kỹ thuật quét từ khóa Skimming & Scanning giúp xử lý triệt để đoạn văn dài Part 7.',
    content: 'Để đạt 750+ TOEIC nhanh chóng, học viên cần nắm vững 12 chủ điểm từ loại hay xuất hiện ở Part 5 và rèn luyện thói quen đọc câu hỏi trước khi tra cứu đáp án ở Part 7...',
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80',
    publishedDate: '2026-07-20',
    views: 1420,
    comments: 28,
    isFeatured: true,
    author: 'Mentor Trần Thu Hà'
  },
  {
    id: 'news_2',
    title: 'Thông báo lịch thi thử IELTS Mock Test 4 kỹ năng miễn phí tháng 8/2026',
    category: 'Thông báo hệ thống',
    excerpt: 'Hệ thống tổ chức kỳ thi thử trực tuyến IELTS Mock Test tiêu chuẩn quốc tế dành cho toàn bộ học viên đăng ký lộ trình tại LearnPath.',
    content: 'Kỳ thi thử sẽ diễn ra vào ngày 15/08/2026. Học viên làm bài trực tiếp trên giao diện IELTS Exam Tab mới và nhận kết quả điểm số chi tiết sau 24h...',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
    publishedDate: '2026-07-18',
    views: 2890,
    comments: 45,
    isFeatured: false,
    author: 'Ban Quản trị LearnPath'
  },
  {
    id: 'news_3',
    title: 'Bí quyết xây dựng dàn ý Task 2 theo cấu trúc PEEL chuẩn Band 7.5+',
    category: 'Bài viết chuyên sâu',
    excerpt: 'Hướng dẫn chi tiết phương pháp PEEL (Point - Explanation - Example - Link) giúp liên kết ý tưởng mạch lạc và nâng điểm tiêu chí Coherence & Coherence.',
    content: 'Mạch suy luận logic là yếu tố quan trọng nhất để vượt mốc Band 7.0 IELTS Writing. Khi áp dụng PEEL structure, bạn sẽ không bao giờ bị bí ý hay lặp từ...',
    thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&auto=format&fit=crop&q=80',
    publishedDate: '2026-07-15',
    views: 980,
    comments: 12,
    isFeatured: false,
    author: 'Mentor Nguyễn Minh An'
  },
  {
    id: 'news_4',
    title: 'Lịch Livestream giải đề ETS 2026 cùng Mentor tuần này trên Zoom',
    category: 'Sự kiện & Livestream',
    excerpt: 'Buổi chia sẻ trực tiếp phương pháp nghe bắt từ khóa Part 3-4 và chữa chi tiết 50 câu trắc nghiệm khó nhất trong bộ đề ETS mới nhất.',
    content: 'Thời gian: 19h30 Tối Thứ 7 tuần này. Link tham gia Zoom sẽ được cập nhật tại trang tổng quan dành riêng cho học viên đã đăng ký khóa TOEIC Intermediate...',
    thumbnail: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&auto=format&fit=crop&q=80',
    publishedDate: '2026-07-12',
    views: 3150,
    comments: 64,
    isFeatured: false,
    author: 'Mentor Phạm Bảo Ngọc'
  }
];

const CATEGORIES = ['Tất cả', 'Mẹo học tập', 'Thông báo hệ thống', 'Bài viết chuyên sâu', 'Sự kiện & Livestream'];

export default function MentorNewsPage() {
  const [articles, setArticles] = useState(() => {
    try {
      const saved = localStorage.getItem('mentor_news_articles');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_NEWS_ARTICLES;
  });

  useEffect(() => {
    localStorage.setItem('mentor_news_articles', JSON.stringify(articles));
  }, [articles]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Mẹo học tập',
    excerpt: '',
    content: '',
    thumbnail: ''
  });

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  const filteredArticles = articles.filter(art => {
    const matchesSearch = art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          art.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'Tất cả' || art.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const featuredArticle = filteredArticles.find(a => a.isFeatured) || filteredArticles[0];
  const regularArticles = filteredArticles.filter(a => a.id !== featuredArticle?.id);

  const handleOpenCreateModal = () => {
    setEditingArticle(null);
    setFormData({
      title: '',
      category: 'Mẹo học tập',
      excerpt: '',
      content: '',
      thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80'
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (art) => {
    setEditingArticle(art);
    setFormData({
      title: art.title,
      category: art.category,
      excerpt: art.excerpt,
      content: art.content,
      thumbnail: art.thumbnail
    });
    setModalOpen(true);
  };

  const handleDeleteArticle = (id) => {
    setArticles(prev => prev.filter(a => a.id !== id));
    setSnackbarMsg('Đã xóa bài viết thành công!');
    setSnackbarOpen(true);
  };

  const handleSaveArticle = () => {
    if (!formData.title.trim() || !formData.excerpt.trim()) return;

    if (editingArticle) {
      setArticles(prev => prev.map(a => a.id === editingArticle.id ? {
        ...a,
        ...formData
      } : a));
      setSnackbarMsg('Đã cập nhật bài viết thành công!');
    } else {
      const newArt = {
        id: `news_${Date.now()}`,
        ...formData,
        publishedDate: new Date().toISOString().split('T')[0],
        views: 0,
        comments: 0,
        isFeatured: false,
        author: 'Mentor Chuyên Môn'
      };
      setArticles(prev => [newArt, ...prev]);
      setSnackbarMsg('Đã xuất bản bài viết tin tức mới!');
    }
    setModalOpen(false);
    setSnackbarOpen(true);
  };

  return (
    <MentorPageShell
      title="Tin tức & Bài viết"
      description="Quản lý tin tức, mẹo học tập và thông báo sự kiện được trình bày cân đối, hiện đại dành cho học viên."
    >
      <Box sx={{ width: '100%', mx: 'auto', fontFamily: 'sans-serif', pb: 4 }}>
        {/* Top Control Bar & Category Filter Pills */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: '28px',
            bgcolor: '#FFFFFF',
            border: '1px solid rgba(15,23,42,0.08)',
            boxShadow: '0 4px 20px -2px rgba(15,23,42,0.04)',
            mb: 4
          }}
        >
          <Grid container spacing={2.5} alignItems="center" justifyContent="space-between">
            <Grid item xs={12} md={7}>
              <TextField
                fullWidth
                size="small"
                placeholder="Tìm kiếm tiêu đề hoặc nội dung bài viết tin tức..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon sx={{ color: '#0891B2', fontSize: 22 }} />
                    </InputAdornment>
                  )
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px', bgcolor: '#F8FAFC' } }}
              />
            </Grid>

            <Grid item xs={12} md={5} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={handleOpenCreateModal}
                sx={{
                  borderRadius: '16px',
                  bgcolor: '#0891B2',
                  fontWeight: 800,
                  py: 1.2,
                  px: 3,
                  boxShadow: '0 8px 16px -4px rgba(8,145,178,0.3)',
                  '&:hover': { bgcolor: '#0E7490' }
                }}
              >
                Tạo bài viết mới
              </Button>
            </Grid>
          </Grid>

          {/* Category Filter Pills */}
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} sx={{ mt: 2.5, pt: 2, borderTop: '1px solid #F1F5F9' }}>
            {CATEGORIES.map(cat => (
              <Chip
                key={cat}
                label={cat}
                onClick={() => setSelectedCategory(cat)}
                clickable
                sx={{
                  fontSize: 12,
                  fontWeight: selectedCategory === cat ? 800 : 600,
                  bgcolor: selectedCategory === cat ? '#0891B2' : '#F1F5F9',
                  color: selectedCategory === cat ? '#FFFFFF' : '#475569',
                  borderRadius: '12px',
                  px: 1,
                  py: 2,
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: selectedCategory === cat ? '#0E7490' : '#E2E8F0'
                  }
                }}
              />
            ))}
          </Stack>
        </Paper>

        {/* Featured Main Article Card (Full-width banner with image spanning 100% width) */}
        {featuredArticle && (
          <Paper
            elevation={0}
            sx={{
              borderRadius: '28px',
              border: '1px solid rgba(8,145,178,0.2)',
              bgcolor: '#FFFFFF',
              overflow: 'hidden',
              mb: 4,
              boxShadow: '0 12px 32px -8px rgba(8,145,178,0.12)'
            }}
          >
            <Box
              component="img"
              src={featuredArticle.thumbnail}
              alt={featuredArticle.title}
              sx={{
                width: '100%',
                height: { xs: 240, sm: 320, md: 380 },
                objectFit: 'cover'
              }}
            />

            <Box sx={{ p: { xs: 3, md: 4 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                <Chip
                  icon={<StarRoundedIcon sx={{ color: '#F59E0B !important', fontSize: 16 }} />}
                  label="BÀI VIẾT NỔI BẬT"
                  size="small"
                  sx={{ bgcolor: 'rgba(245,158,11,0.1)', color: '#D97706', fontWeight: 800, fontSize: 11, borderRadius: '8px' }}
                />
                <Chip
                  label={featuredArticle.category}
                  size="small"
                  sx={{ bgcolor: 'rgba(8,145,178,0.1)', color: '#0891B2', fontWeight: 700, fontSize: 11, borderRadius: '8px' }}
                />
              </Box>

              <Typography sx={{ fontSize: { xs: 20, md: 24 }, fontWeight: 800, color: '#0F172A', mb: 1.5, lineHeight: 1.3 }}>
                {featuredArticle.title}
              </Typography>

              <Typography sx={{ fontSize: 14, color: '#64748B', lineHeight: 1.6, mb: 3 }}>
                {featuredArticle.excerpt}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 2, borderTop: '1px solid #F1F5F9' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, color: '#94A3B8', fontSize: 12 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarTodayRoundedIcon sx={{ fontSize: 14 }} />
                    <span>{featuredArticle.publishedDate}</span>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <VisibilityRoundedIcon sx={{ fontSize: 14 }} />
                    <span>{featuredArticle.views} lượt xem</span>
                  </Box>
                </Box>

                <Box>
                  <IconButton size="small" onClick={() => handleOpenEditModal(featuredArticle)} sx={{ color: '#0891B2', mr: 0.5 }}>
                    <EditRoundedIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDeleteArticle(featuredArticle.id)} sx={{ color: '#EF4444' }}>
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </Paper>
        )}

        {/* Regular Articles Section (Full Width 100% Layout) */}
        <Typography sx={{ fontSize: 18, fontWeight: 800, color: '#0F172A', mb: 2.5 }}>
          Danh sách bài viết tin tức ({regularArticles.length})
        </Typography>

        <Box sx={{ width: '100%', spaceY: 3 }}>
          <Grid container spacing={3} sx={{ width: '100%', m: 0 }}>
            {regularArticles.map((art) => (
              <Grid item xs={12} key={art.id} sx={{ pl: '0 !important', pr: '0 !important', mb: 3 }}>
                <Paper
                  elevation={0}
                  sx={{
                    width: '100%',
                    borderRadius: '28px',
                    border: '1px solid rgba(15,23,42,0.08)',
                    bgcolor: '#FFFFFF',
                    overflow: 'hidden',
                    transition: 'all 0.25s ease',
                    boxShadow: '0 4px 16px -2px rgba(15,23,42,0.04)',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 16px 32px -6px rgba(15,23,42,0.08)',
                      borderColor: 'rgba(8,145,178,0.3)'
                    }
                  }}
                >
                  <Grid container spacing={0} alignItems="center">
                    <Grid item xs={12} md={4}>
                      <Box
                        component="img"
                        src={art.thumbnail}
                        alt={art.title}
                        sx={{
                          width: '100%',
                          height: { xs: 200, md: 220 },
                          objectFit: 'cover'
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={8} sx={{ p: { xs: 3, md: 3.5 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                        <Chip
                          label={art.category}
                          size="small"
                          sx={{
                            fontSize: 11,
                            fontWeight: 800,
                            bgcolor: 'rgba(8,145,178,0.1)',
                            color: '#0891B2',
                            borderRadius: '8px'
                          }}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#94A3B8', fontSize: 12 }}>
                          <CalendarTodayRoundedIcon sx={{ fontSize: 13 }} />
                          <span>{art.publishedDate}</span>
                        </Box>
                      </Box>

                      <Typography sx={{ fontSize: 17, fontWeight: 800, color: '#0F172A', mb: 1, leadingHeight: 1.35 }}>
                        {art.title}
                      </Typography>

                      <Typography sx={{ fontSize: 13, color: '#64748B', leadingHeight: 1.6, mb: 2 }}>
                        {art.excerpt}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1.5, borderTop: '1px solid #F1F5F9' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, color: '#94A3B8', fontSize: 12 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <VisibilityRoundedIcon sx={{ fontSize: 14 }} />
                            <span>{art.views} lượt xem</span>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 14 }} />
                            <span>{art.comments} bình luận</span>
                          </Box>
                        </Box>

                        <Box>
                          <IconButton size="small" onClick={() => handleOpenEditModal(art)} sx={{ color: '#0891B2', mr: 0.5 }}>
                            <EditRoundedIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteArticle(art.id)} sx={{ color: '#EF4444' }}>
                            <DeleteOutlineRoundedIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Create / Edit Article Dialog Modal */}
        <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '28px', p: 1 } }}>
          <DialogTitle sx={{ fontWeight: 800, fontSize: 18, color: '#0F172A' }}>
            {editingArticle ? 'Chỉnh sửa bài viết tin tức' : 'Tạo bài viết tin tức mới'}
          </DialogTitle>
          <DialogContent dividers sx={{ py: 2.5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Tiêu đề bài viết"
                fullWidth
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }}
              />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Danh mục</InputLabel>
                    <Select
                      value={formData.category}
                      label="Danh mục"
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      sx={{ borderRadius: '14px' }}
                    >
                      <MenuItem value="Mẹo học tập">Mẹo học tập</MenuItem>
                      <MenuItem value="Thông báo hệ thống">Thông báo hệ thống</MenuItem>
                      <MenuItem value="Bài viết chuyên sâu">Bài viết chuyên sâu</MenuItem>
                      <MenuItem value="Sự kiện & Livestream">Sự kiện & Livestream</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="URL Ảnh xem trước (Thumbnail)"
                    fullWidth
                    value={formData.thumbnail}
                    onChange={e => setFormData({ ...formData, thumbnail: e.target.value })}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }}
                  />
                </Grid>
              </Grid>

              <TextField
                label="Tóm tắt ngắn (Excerpt)"
                multiline
                rows={2}
                fullWidth
                value={formData.excerpt}
                onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }}
              />

              <TextField
                label="Nội dung bài viết chi tiết"
                multiline
                rows={6}
                fullWidth
                value={formData.content}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setModalOpen(false)} sx={{ borderRadius: '12px', color: '#64748B', fontWeight: 600 }}>
              Hủy
            </Button>
            <Button onClick={handleSaveArticle} variant="contained" sx={{ borderRadius: '12px', bgcolor: '#0891B2', fontWeight: 700, '&:hover': { bgcolor: '#0E7490' } }}>
              {editingArticle ? 'Lưu thay đổi' : 'Xuất bản bài viết'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert severity="success" sx={{ borderRadius: '16px', fontWeight: 700 }}>
            {snackbarMsg}
          </Alert>
        </Snackbar>
      </Box>
    </MentorPageShell>
  );
}
