import { useCallback, useEffect, useRef, useState } from 'react';
import {
    Box,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
    alpha,
} from '@mui/material';
import AppButton from '@/shared/ui/AppButton';
import {
    clampCropOffset,
    getCroppedImageDataUrl,
    getRenderedSize,
    validateThumbnailDataUrl,
} from '@/features/mentor/utils/mentorCourseImageUtils';
import { toast } from '@/shared/ui/Toast';
// ==========================================
// 1. CÁC HẰNG SỐ CƠ BẢN (CONSTANTS)
// ==========================================
const CROP_SIZE = 300;     // Chiều dài và rộng của khung tròn (300x300)
const MIN_ZOOM = 1;        // Mức thu nhỏ tối đa (vừa vặn khung)
const MAX_ZOOM = 3;        // Mức phóng to tối đa (gấp 3 lần)
const ZOOM_STEP = 0.08;    // Tốc độ zoom mỗi lần cuộn chuột
const PRIMARY = "#0891B2"; // Màu sắc chủ đạo của nút bấm
export default function ProfileImageCropDialog({ open, imageSrc, onClose, onSave }) {
    // ==========================================
    // 2. KHAI BÁO TRẠNG THÁI (STATE) & REF
    // ==========================================
    const [zoom, setZoom] = useState(MIN_ZOOM);                // Trạng thái phóng to/thu nhỏ
    const [offset, setOffset] = useState({ x: 0, y: 0 });      // Tọa độ kéo ảnh (x, y)
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 }); // Kích thước gốc của ảnh
    const [saving, setSaving] = useState(false);               // Trạng thái đang lưu (loading)

    // Các Ref dùng để xử lý logic kéo thả mượt mà không làm re-render toàn bộ
    const [dragging, setDragging] = useState(false);
    const dragStateRef = useRef(null);
    const cropBoxRef = useRef(null);
    // ==========================================
    // 3. CÁC HÀM TÍNH TOÁN LOGIC (UTILITIES)
    // ==========================================
    /**
     * Tác dụng: Giữ cho ảnh không bị kéo vượt ra khoảng trống ngoài khung cắt.
     */
    const clampOffset = useCallback(
        (nextOffset, nextZoom = zoom) => {
            if (!imageSize.width) return nextOffset;
            const { width, height } = getRenderedSize(imageSize.width, imageSize.height, CROP_SIZE, CROP_SIZE, nextZoom);
            return clampCropOffset(nextOffset, width, height, CROP_SIZE, CROP_SIZE);
        },
        [imageSize, zoom]
    );
    // ==========================================
    // 4. HIỆU ỨNG VÒNG ĐỜI (USE EFFECT)
    // ==========================================
    // Load kích thước thật của ảnh khi người dùng vừa chọn file mới
    useEffect(() => {
        if (!open || !imageSrc) return;
        const image = new Image();
        image.onload = () => {
            setImageSize({ width: image.naturalWidth, height: image.naturalHeight });
            setZoom(MIN_ZOOM);         // Reset zoom về ban đầu
            setOffset({ x: 0, y: 0 }); // Đưa ảnh về giữa
        };
        image.src = imageSrc;
    }, [open, imageSrc]);
    // Cập nhật lại tọa độ nếu người dùng zoom (tránh việc ảnh bị lọt thỏm)
    useEffect(() => {
        if (!imageSize.width) return;
        setOffset((prev) => clampOffset(prev, zoom));
    }, [zoom, imageSize, clampOffset]);
    // Bắt sự kiện cuộn chuột để Zoom
    useEffect(() => {
        const node = cropBoxRef.current;
        if (!open || !node) return;
        const onWheel = (event) => {
            event.preventDefault(); // Ngăn trình duyệt tự động cuộn trang
            if (!imageSize.width) return;

            const direction = event.deltaY > 0 ? -1 : 1;
            setZoom((prevZoom) => {
                const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number((prevZoom + direction * ZOOM_STEP).toFixed(3))));
                setOffset((prevOffset) => clampOffset(prevOffset, nextZoom));
                return nextZoom;
            });
        };
        node.addEventListener('wheel', onWheel, { passive: false });
        return () => node.removeEventListener('wheel', onWheel);
    }, [open, imageSize.width, clampOffset]);
    // ==========================================
    // 5. CÁC HÀM SỰ KIỆN KÉO THẢ CHUỘT (MOUSE EVENTS)
    // ==========================================
    const handlePointerDown = useCallback((event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        setDragging(true);
        dragStateRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            startOffset: { ...offset },
        };
    }, [offset]);
    const handlePointerMove = useCallback((event) => {
        if (!dragStateRef.current || dragStateRef.current.pointerId !== event.pointerId) return;
        const nextOffset = {
            x: dragStateRef.current.startOffset.x + (event.clientX - dragStateRef.current.startX),
            y: dragStateRef.current.startOffset.y + (event.clientY - dragStateRef.current.startY),
        };
        setOffset(clampOffset(nextOffset));
    }, [clampOffset]);
    const handlePointerUp = useCallback((event) => {
        if (!dragStateRef.current || dragStateRef.current.pointerId !== event.pointerId) return;
        dragStateRef.current = null;
        setDragging(false);
        event.currentTarget.releasePointerCapture(event.pointerId);
    }, []);
    // ==========================================
    // 6. HÀM LƯU ẢNH (SAVE)
    // ==========================================
    const handleSave = async () => {
        if (!imageSrc) return;
        setSaving(true);

        try {
            // Gọi hàm cắt ảnh và chuyển thành chuỗi Base64 (size ảnh xuất ra là 400x400)
            const croppedBase64 = await getCroppedImageDataUrl(imageSrc, {
                cropWidth: CROP_SIZE,
                cropHeight: CROP_SIZE,
                zoom,
                offset,
                outputWidth: 400,
            });
            // Kiểm tra file có hợp lệ (dung lượng, định dạng) hay không
            const validationError = validateThumbnailDataUrl(croppedBase64);
            if (validationError) {
                toast.error(validationError);
                return;
            }
            // Trả file Base64 về cho Component cha (ProfilePage)
            onSave(croppedBase64);
        } finally {
            setSaving(false);
        }
    };
    const { width: renderedWidth, height: renderedHeight } = imageSize.width
        ? getRenderedSize(imageSize.width, imageSize.height, CROP_SIZE, CROP_SIZE, zoom)
        : { width: 0, height: 0 };
    // ==========================================
    // 7. GIAO DIỆN (RENDER)
    // ==========================================
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Cập nhật ảnh đại diện</DialogTitle>
            <DialogContent sx={{ pt: 0.5 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Kéo ảnh để chọn vùng hiển thị. Cuộn chuột để phóng to/thu nhỏ.
                </Typography>
                {/* Khung cắt chính */}
                <Box
                    ref={cropBoxRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    sx={{
                        position: 'relative',
                        width: CROP_SIZE,
                        height: CROP_SIZE,
                        mx: 'auto',
                        overflow: 'hidden',
                        borderRadius: '50%', // Bắt buộc 50% để tạo khung tròn cho Avatar
                        bgcolor: '#0F172A',
                        cursor: dragging ? 'grabbing' : 'grab',
                        touchAction: 'none',
                        userSelect: 'none',
                    }}
                >
                    {/* Lớp hiển thị ảnh bị kéo */}
                    {imageSrc && imageSize.width > 0 && (
                        <Box
                            component="img"
                            src={imageSrc}
                            alt=""
                            draggable={false}
                            sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                width: renderedWidth,
                                height: renderedHeight,
                                transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
                                pointerEvents: 'none',
                            }}
                        />
                    )}
                    {/* Lớp Overlay viền trắng để tạo điểm nhấn vùng bị cắt */}
                    <Box
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            boxShadow: `0 0 0 9999px ${alpha('#0F172A', 0.62)}`,
                            border: '2px solid #FFFFFF',
                            borderRadius: '50%',
                            pointerEvents: 'none',
                        }}
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                <AppButton variant="outlined" onClick={onClose} disabled={saving}>Hủy</AppButton>
                <AppButton loading={saving} onClick={handleSave} sx={{ bgcolor: PRIMARY }}>Lưu ảnh</AppButton>
            </DialogActions>
        </Dialog>
    );
}