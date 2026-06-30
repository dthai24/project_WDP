import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import {
  Avatar,
  Box,
  Chip,
  Rating,
  TextField,
  Typography,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import AppButton from '@/shared/ui/AppButton';
import { toast } from '@/shared/ui/Toast';
import {
  formatCommentDate,
  getCommentInitials,
  mapApiComment,
  resolveAvatarSrc,
} from '@/features/courses/data/courseCommentsMock';

const PRIMARY = '#0891B2';
const TEXT = '#0F172A';
const MUTED = '#64748B';
const DIVIDER = 'rgba(8,145,178,0.10)';
const COMMENT_MAX_LENGTH = 250;
const COMMENT_LIST_MAX_HEIGHT = 480;

function SectionTitle({ children, sx }) {
  return (
    <Typography sx={{ fontWeight: 700, color: TEXT, fontSize: { xs: 18, sm: 20 }, lineHeight: 1.3, ...sx }}>
      {children}
    </Typography>
  );
}

// ĐÚC CÂY ĐỆ QUY (Cha - Con)

function buildCommentTree(flatComments) {
  const commentMap = {};
  const rootComments = [];

  // Vòng lặp 1: Gắn thêm 1 cái túi rỗng tên là 'replies' cho tất cả mọi người
  flatComments.forEach(comment => {
    commentMap[comment.id] = { ...comment, replies: [] };
  });

  // Vòng lặp 2: Nhét các đứa con vào trong cái túi 'replies' của người Cha
  flatComments.forEach(comment => {
    if (comment.parentCommentId && commentMap[comment.parentCommentId]) {
      commentMap[comment.parentCommentId].replies.push(commentMap[comment.id]);
    } else {
      // Nếu không có Cha (parentCommentId bị null), thì nó chính là Cha
      rootComments.push(commentMap[comment.id]);
    }
  });

  return rootComments;
}

// -------------------------------------------------------------------------------------------------
// COMPONENT: GIAO DIỆN 1 DÒNG BÌNH LUẬN 
// //depth (độ sâu thụt lề), onReply (hàm bấm gửi), replyingToId (ID đang bị bấm), setReplyingToId (đổi trạng thái)
// -------------------------------------------------------------------------------------------------
function CommentItem({ comment, depth = 0, onReply, replyingToId, setReplyingToId }) {
  const avatarSrc = resolveAvatarSrc(comment.avatarUrl);
  const [replyContent, setReplyContent] = useState('');

  // Kiểm tra xem người dùng có đang bấm nút Trả lời cho bình luận này không
  const isReplying = replyingToId === comment.id;

  // Xử lý khi bấm nút "Gửi trả lời"
  const handleSendReply = async () => {
    if (!replyContent.trim()) return;
    await onReply(replyContent, comment.id); // Bắn API
    setReplyContent(''); // Gửi xong thì xóa form 
    setReplyingToId(null); // Gửi xong thì thu gọn form lại
  };

  return (
    // thụt lề: nếu là con thì ml 5 mt 1.5

    <Box sx={{ ml: depth > 0 ? 5 : 0, mt: depth > 0 ? 1.5 : 0 }}>

      {/* UI con */}
      <Box sx={{
        display: 'flex', gap: 1.75, py: 2.25,
        borderBottom: depth === 0 ? `1px solid ${DIVIDER}` : 'none',
        bgcolor: depth > 0 ? alpha(PRIMARY, 0.02) : 'transparent',
        p: depth > 0 ? 2 : 0, borderRadius: depth > 0 ? 2 : 0,
      }}>

        {/* HIỂN THỊ AVATAR */}
        <Avatar src={avatarSrc || undefined} sx={{ width: 42, height: 42, bgcolor: alpha(PRIMARY, 0.12), color: PRIMARY, fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
          {getCommentInitials(comment.authorName)}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* HIỂN THỊ TÊN VÀ NHÃN GIẢNG VIÊN (NẾU CÓ) */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: TEXT, lineHeight: 1.35 }}>
              {comment.authorName}
            </Typography>
            {comment.isInstructor && (
              <Chip size="small" label="Giảng viên" sx={{ height: 22, fontSize: 11, fontWeight: 600, bgcolor: alpha(PRIMARY, 0.1), color: PRIMARY, border: `1px solid ${alpha(PRIMARY, 0.22)}`, '& .MuiChip-label': { px: 0.85 } }} />
            )}
            <Typography sx={{ fontSize: 12.5, color: MUTED }}>
              {formatCommentDate(comment.createdAt)}
            </Typography>
          </Box>

          {/* HIỂN THỊ SỐ SAO NẾU LÀ BÌNH LUẬN GỐC (ĐÁNH GIÁ KHÓA HỌC) */}
          {comment.rating ? (
            <Rating value={comment.rating} readOnly size="small" icon={<StarRoundedIcon sx={{ fontSize: 16 }} />} emptyIcon={<StarRoundedIcon sx={{ fontSize: 16, opacity: 0.28 }} />} sx={{ color: '#F59E0B', mb: 0.75, '& .MuiRating-iconEmpty': { color: alpha('#F59E0B', 0.28) } }} />
          ) : null}

          {/* HIỂN THỊ NỘI DUNG CHỮ */}
          <Typography sx={{ fontSize: 14, color: TEXT, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {comment.content}
          </Typography>

          {/* NÚT BẤM "Trả lời" / "Hủy" */}
          <Box sx={{ mt: 1 }}>
            <Typography component="span" onClick={() => setReplyingToId(isReplying ? null : comment.id)} sx={{ fontSize: 12, fontWeight: 600, color: PRIMARY, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
              {isReplying ? 'Hủy' : 'Trả lời'}
            </Typography>
          </Box>

          {/* FORM NHẬP TRẢ LỜI: Sẽ hiện ra nếu isReplying == true */}
          {isReplying && (
            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexDirection: 'column' }}>
              <TextField size="small" fullWidth placeholder="Viết câu trả lời..." value={replyContent} onChange={(e) => setReplyContent(e.target.value)} />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <AppButton size="small" onClick={handleSendReply} disabled={!replyContent.trim()}>Gửi trả lời</AppButton>
              </Box>
            </Box>
          )}

          {/* ĐỆ QUY THÔNG QUA BIẾN childComment */}
          {/* Lấy từng đứa con ra, và lại dùng chính Component <CommentItem> để hiển thị nó */}
          {comment.replies && comment.replies.length > 0 && (
            <Box sx={{ mt: 1 }}>
              {comment.replies.map((childComment) => (
                <CommentItem
                  key={childComment.id}
                  comment={childComment}
                  depth={depth + 1}
                  onReply={onReply}
                  replyingToId={replyingToId}
                  setReplyingToId={setReplyingToId}
                />
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

// -------------------------------------------------------------------------------------------------
// COMPONENT CHÍNH: XUẤT RA TOÀN BỘ TRANG BÌNH LUẬN CỦA HỌC VIÊN
// -------------------------------------------------------------------------------------------------
export default function CourseCommentsSection({ courseId, isEnrolled = false, progress = 0 }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);

  // Biến lưu trạng thái xem user đang trả lời ai
  const [replyingToId, setReplyingToId] = useState(null);
  
  // Biến lưu trạng thái Dialog Xác nhận
  const [openConfirm, setOpenConfirm] = useState(false);
  const [pendingRating, setPendingRating] = useState(null);
  const [ratingKey, setRatingKey] = useState(0); // Dùng để ép MUI Rating re-mount
  const prevRatingRef = useRef(5);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  }, []);

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/courses/${courseId}/comments`);
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        setComments(result.data.map(mapApiComment));
      }
    } catch {
      // lờ đi nếu lỗi
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { loadComments(); }, [loadComments]);

  // Tìm đánh giá gốc của user hiện tại
  const myReview = useMemo(() => {
    if (!user?.userId) return null;
    return comments.find(c => c.userId === user.userId && !c.parentCommentId && c.rating !== null);
  }, [comments, user]);

  // Tự động điền dữ liệu nếu đã từng đánh giá (CHỈ ĐIỀN SAO, KHÔNG ĐIỀN CHỮ)
  const [hasPrefilled, setHasPrefilled] = useState(false);
  useEffect(() => {
    if (myReview && !hasPrefilled) {
      setRating(myReview.rating); // Chỉ điền sao
      prevRatingRef.current = myReview.rating; // Khởi tạo mốc cũ
      setHasPrefilled(true);
    }
  }, [myReview, hasPrefilled]);

  const handleContentChange = (event) => setContent(event.target.value.slice(0, COMMENT_MAX_LENGTH));

  // Hàm đa năng bắn API: dùng chung cho cả khi Gửi Mới lẫn Trả Lời
  const submitCommentToApi = async (text, starRating, parentId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/courses/${courseId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': String(user.userId) },
        body: JSON.stringify({ content: text, rating: starRating, parentCommentId: parentId }),
      });
      const result = await res.json();
      if (result.success && result.data) {
        toast.success('Đã gửi bình luận.');
        loadComments(); // Lấy lại toàn bộ cây bình luận từ Server
        return true;
      }
      toast.error(result.message || 'Không thể gửi bình luận.');
      return false;
    } catch {
      toast.error('Lỗi mạng. Vui lòng thử lại.');
      return false;
    }
  };

  // Khi người dùng bấm thẳng vào Ngôi sao
  const handleRatingChange = (newValue) => {
    if (!user.userId) return toast.error('Vui lòng đăng nhập.');
    if (!isEnrolled) return toast.error('Bạn cần đăng ký khóa học.');
    if (!progress || Number(progress) === 0) return toast.error('Bạn cần hoàn thành ít nhất 1 chương để đánh giá.');
    if (myReview && myReview.editCount >= 1) return toast.error('Bạn chỉ được sửa đánh giá 1 lần duy nhất!');
    if (newValue === null) return; // Không cho phép chọn rỗng
    
    prevRatingRef.current = rating; // Lưu lại số sao hiện tại để lỡ bề có Hủy thì quay về
    setPendingRating(newValue);
    setRating(newValue); // Cập nhật state
    setOpenConfirm(true); // Bật Dialog ngay lập tức
  };

  // Hàm Hủy (bấm Hủy hoặc bấm ra ngoài Dialog)
  const handleCancelRating = () => {
    setOpenConfirm(false);
    setPendingRating(null);
    setRating(prevRatingRef.current); // Quay về số sao cũ
    setRatingKey(prev => prev + 1);   // Ép MUI Rating render lại từ đầu để xóa lỗi dính hiệu ứng Hover
  };

  // Nút xác nhận gửi Rating trong Dialog
  const handleConfirmSubmit = async () => {
    setOpenConfirm(false);
    setSubmitting(true);
    // Nếu cập nhật sao, ta gửi kèm nội dung đánh giá cũ (nếu có) để BE không bị đè mất nội dung cũ
    const contentToSend = myReview ? myReview.content : ''; 
    const success = await submitCommentToApi(contentToSend, pendingRating, null);
    if (!success) { 
      setRating(prevRatingRef.current); // Nếu lỗi thì trả về sao cũ
    } else {
      prevRatingRef.current = pendingRating; // Cập nhật mốc mới
    }
    setSubmitting(false);
  };

  // Nút gửi Bình luận (Chỉ gửi text, rating = null để được phép tạo nhiều comment)
  const handleSubmitComment = async () => {
    const trimmed = content.trim();
    if (!trimmed) return toast.error('Vui lòng nhập nội dung.');
    if (!user.userId) return toast.error('Vui lòng đăng nhập.');
    if (!isEnrolled) return toast.error('Bạn cần đăng ký khóa học.');

    setSubmitting(true);
    // Truyền rating = null để Backend hiểu đây là Bình luận thường (được thêm mới liên tục)
    const success = await submitCommentToApi(trimmed, null, null);
    if (success) { setContent(''); }
    setSubmitting(false);
  };

  // Nút gửi trả lời (Truyền ngầm xuống tận cháu chắt)
  const handleSendReply = async (replyText, parentId) => {
    await submitCommentToApi(replyText, null, parentId);
  };

  // ---------------------------------------------------------------------------
  // KÍCH HOẠT ĐỆ QUY
  // ---------------------------------------------------------------------------
  const nestedComments = useMemo(() => buildCommentTree(comments), [comments]);

  return (
    <Box>
      <Box sx={{ pb: 2, mb: 0.5, borderBottom: `1px solid ${DIVIDER}` }}>
        <SectionTitle sx={{ mb: 0.75 }}>Bình luận & đánh giá</SectionTitle>
        <Typography sx={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>{comments.length} bình luận</Typography>
      </Box>

      {/* FORM NHẬP BÌNH LUẬN GỐC (BẮT BUỘC ĐĂNG KÝ VÀ HỌC THÌ MỚI ĐƯỢC NHẬP) */}
      {user.userId && isEnrolled ? (
        <Box sx={{ mt: 2.5, mb: 3, p: 2.25, borderRadius: '16px', border: `1px solid ${DIVIDER}`, bgcolor: alpha(PRIMARY, 0.02) }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: TEXT, mb: 1.25 }}>Viết bình luận của bạn</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Typography sx={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>Đánh giá:</Typography>
            <Rating 
              key={`rating-${ratingKey}`}
              value={rating} 
              onChange={(_, value) => handleRatingChange(value)} 
              size="small" 
              icon={<StarRoundedIcon sx={{ fontSize: 20 }} />} 
              emptyIcon={<StarRoundedIcon sx={{ fontSize: 20, opacity: 0.28 }} />} 
              sx={{ color: '#F59E0B' }} 
            />
          </Box>
          <TextField 
            multiline 
            minRows={3} 
            fullWidth 
            placeholder="Chia sẻ cảm nhận hoặc đặt câu hỏi..." 
            value={content} 
            onChange={handleContentChange} 
            sx={{ mb: 0.75, '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#fff', fontSize: 14 } }} 
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: content.length >= COMMENT_MAX_LENGTH ? '#DC2626' : MUTED }}>
              {content.length}/{COMMENT_MAX_LENGTH}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <AppButton 
              onClick={handleSubmitComment} 
              loading={submitting} 
              disabled={submitting || !content.trim()}
            >
              Gửi bình luận
            </AppButton>
          </Box>
        </Box>
      ) : (
        <Typography sx={{ mt: 2, mb: 2.5, fontSize: 13.5, color: MUTED }}>Bạn cần đăng ký khóa học để đánh giá.</Typography>
      )}

      {/* HIỂN THỊ DANH SÁCH BÌNH LUẬN*/}
      {loading ? (
        <Typography sx={{ py: 3, fontSize: 14, color: MUTED, textAlign: 'center' }}>Đang tải bình luận...</Typography>
      ) : comments.length === 0 ? (
        <Typography sx={{ py: 3, fontSize: 14, color: MUTED, textAlign: 'center' }}>Chưa có bình luận nào.</Typography>
      ) : (
        <Box sx={{ maxHeight: COMMENT_LIST_MAX_HEIGHT, overflowY: 'auto', pr: 0.5 }}>

          {/* ĐỆ QUY */}
          {nestedComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleSendReply}
              replyingToId={replyingToId}
              setReplyingToId={setReplyingToId}
            />
          ))}

        </Box>
      )}

      {/* DIALOG XÁC NHẬN ĐÁNH GIÁ */}
      <Dialog open={openConfirm} onClose={handleCancelRating} PaperProps={{ sx: { borderRadius: 3, padding: 1 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: TEXT }}>Xác nhận đánh giá</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: MUTED, fontSize: 14.5 }}>
            {myReview 
              ? "Bạn chỉ được sửa đánh giá 1 lần duy nhất. Bạn có chắc chắn muốn sửa không?"
              : "Bạn có chắc chắn muốn gửi đánh giá này không? Đánh giá của bạn sẽ gắn liền với khóa học."}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCancelRating} sx={{ color: MUTED, fontWeight: 600 }}>Hủy</Button>
          <Button variant="contained" onClick={handleConfirmSubmit} sx={{ bgcolor: PRIMARY, borderRadius: 2, fontWeight: 600, px: 3, '&:hover': { bgcolor: alpha(PRIMARY, 0.8) } }}>
            Đồng ý
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
