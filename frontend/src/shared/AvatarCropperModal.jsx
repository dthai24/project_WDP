import { useState, useCallback, useRef, useEffect } from "react";
import Cropper from "react-easy-crop";
import {
  Modal,
  Box,
  Typography,
  Slider,
  CircularProgress,
  IconButton,
  alpha,
  Tooltip,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CropRoundedIcon from "@mui/icons-material/CropRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import FilterFramesOutlinedIcon from "@mui/icons-material/FilterFramesOutlined";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";

/* ─── Constants ─────────────────────────────────────────────────────────── */
const PRIMARY = "#0891B2";
const TEXT = "#0F172A";
const MUTED = "#64748B";

const FRAMES = [
  { id: "none", name: "Không viền", shortName: "Không viền", url: null, color: "#94A3B8" },
  { id: "blue", name: "Khung Xanh Ruy Băng", shortName: "Khung Xanh Ruy Băng", url: "/frames/frame_test1.png", color: "#3B82F6" },
  { id: "yellow", name: "Vòng Hoa Lá Vàng", shortName: "Vòng Hoa Lá Vàng", url: "/frames/frame_test2.png", color: "#EAB308" },
];

const CROPPER_STYLE = {
  containerStyle: { borderRadius: "16px" },
  cropAreaStyle: {
    border: `3px solid ${PRIMARY}`,
    boxShadow: `0 0 0 9999em rgba(26,26,46,0.7)`,
  },
};

/* ─── Canvas helpers ────────────────────────────────────────────────────── */
async function getCroppedCanvas(imageSrc, pixelCrop, canvasSize = 400) {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  const ctx = canvas.getContext("2d");

  ctx.beginPath();
  ctx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  const { x, y, width, height } = pixelCrop;
  ctx.drawImage(image, x, y, width, height, 0, 0, canvasSize, canvasSize);
  return canvas;
}

async function mergeFrameOntoCanvas(faceCanvas, frameUrl) {
  if (!frameUrl) {
    return new Promise((resolve, reject) => {
      faceCanvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Canvas toBlob returned null"))),
        "image/png",
        1
      );
    });
  }

  const canvasSize = faceCanvas.width;
  const mergedCanvas = document.createElement("canvas");
  mergedCanvas.width = canvasSize;
  mergedCanvas.height = canvasSize;
  const ctx = mergedCanvas.getContext("2d");

  // Arena of Valor Style Outer Border: Face is 80%, Frame is 100%
  const avatarSize = canvasSize * 0.80; 
  const faceOffset = canvasSize * 0.10; 
  
  ctx.save();
  ctx.beginPath();
  ctx.arc(canvasSize / 2, canvasSize / 2, avatarSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(faceCanvas, faceOffset, faceOffset, avatarSize, avatarSize);
  ctx.restore();

  const frameImg = new Image();
  frameImg.crossOrigin = "anonymous";
  frameImg.src = frameUrl;
  await new Promise((resolve) => { frameImg.onload = resolve; });
  ctx.drawImage(frameImg, 0, 0, canvasSize, canvasSize);

  return new Promise((resolve, reject) => {
    mergedCanvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas toBlob returned null"));
      },
      "image/png",
      1
    );
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

async function uploadAvatarBlob(blob, userId) {
  const formData = new FormData();
  formData.append("avatar", blob, "avatar.png");
  const response = await fetch("http://localhost:5000/api/users/avatar", {
    method: "POST",
    headers: { "x-user-id": String(userId) },
    body: formData,
  });
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.message || "Upload failed");
  return data.avatarUrl;
}

/* ─── Sub-components ────────────────────────────────────────────────────── */
function FramePreview({ imageSrc, croppedAreaPixels, frameUrl, existingAvatarUrl, size = 180 }) {
  const canvasRef = useRef(null);
  const hasNewCrop = imageSrc && croppedAreaPixels;

  useEffect(() => {
    if (!hasNewCrop || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const { x, y, width, height } = croppedAreaPixels;
    const canvasSize = size;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      ctx.clearRect(0, 0, canvasSize, canvasSize);
      ctx.drawImage(img, x, y, width, height, 0, 0, canvasSize, canvasSize);
    };
  }, [imageSrc, croppedAreaPixels, size, hasNewCrop]);

  return (
    <Box sx={{ position: "relative", width: size, height: size, mx: "auto" }}>
      {/* Base Face Layer */}
      {hasNewCrop ? (
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          style={{
            position: "absolute",
            top: frameUrl ? "10%" : "0%",
            left: frameUrl ? "10%" : "0%",
            width: frameUrl ? "80%" : "100%",
            height: frameUrl ? "80%" : "100%",
            borderRadius: "50%",
            objectFit: "cover",
            zIndex: 0,
            transition: "all 0.3s ease",
          }}
        />
      ) : (
        <img
          src={existingAvatarUrl || ""}
          alt="avatar"
          crossOrigin="anonymous"
          style={{
            position: "absolute",
            top: frameUrl ? "10%" : "0%",
            left: frameUrl ? "10%" : "0%",
            width: frameUrl ? "80%" : "100%",
            height: frameUrl ? "80%" : "100%",
            borderRadius: "50%",
            objectFit: "cover",
            zIndex: 0,
            transition: "all 0.3s ease",
            display: existingAvatarUrl ? "block" : "none"
          }}
        />
      )}

      {/* Placeholder Silhouette if no face at all */}
      {!hasNewCrop && !existingAvatarUrl && (
        <Box
          sx={{
            position: "absolute",
            top: frameUrl ? "10%" : "0%",
            left: frameUrl ? "10%" : "0%",
            width: frameUrl ? "80%" : "100%",
            height: frameUrl ? "80%" : "100%",
            borderRadius: "50%",
            bgcolor: alpha(MUTED, 0.05),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 0,
            transition: "all 0.3s ease",
          }}
        >
          <PersonRoundedIcon sx={{ fontSize: size * 0.4, color: alpha(MUTED, 0.3) }} />
        </Box>
      )}

      {/* Frame Layer */}
      {frameUrl && (
        <img
          src={frameUrl}
          alt="frame"
          crossOrigin="anonymous"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            zIndex: 10,
            pointerEvents: "none",
          }}
        />
      )}
    </Box>
  );
}

/* ─── Main Component ────────────────────────────────────────────────────── */
export default function AvatarCropperModal({ open, onClose, onAvatarUpdated }) {
  const [activeTab, setActiveTab] = useState("avatar"); // "avatar" | "frame"
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  
  const [step, setStep] = useState("idle"); // "idle" | "uploading" | "done"
  const [error, setError] = useState("");
  
  const explicitFrame = sessionStorage.getItem("frameUrl");
  const [selectedFrameUrl, setSelectedFrameUrl] = useState(() => {
    if (explicitFrame === "null") return null;
    return explicitFrame || null;
  });

  const userRaw = sessionStorage.getItem("user");
  const currentUser = userRaw ? JSON.parse(userRaw) : null;
  const explicitBase = sessionStorage.getItem("baseAvatarUrl");
  const explicitAvatar = sessionStorage.getItem("avatarUrl");
  const existingAvatarUrl = explicitBase || currentUser?.baseAvatarUrl || explicitAvatar || currentUser?.avatarUrl || null;

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    setError("");
    setActiveTab("avatar");
  };

  const onCropComplete = useCallback((_croppedArea, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleConfirm = async () => {
    if (!imageSrc && !existingAvatarUrl) {
      setError("Vui lòng tải lên ảnh hoặc bạn phải có ảnh đại diện hiện tại.");
      setActiveTab("avatar");
      return;
    }
    setStep("uploading");
    setError("");

    try {
      let faceCanvas;
      let hasNewFace = false;

      if (imageSrc && croppedAreaPixels) {
        faceCanvas = await getCroppedCanvas(imageSrc, croppedAreaPixels, 400);
        hasNewFace = true;
      } else {
        const img = await loadImage(existingAvatarUrl);
        faceCanvas = document.createElement("canvas");
        faceCanvas.width = 400;
        faceCanvas.height = 400;
        const ctx = faceCanvas.getContext("2d");
        ctx.drawImage(img, 0, 0, 400, 400);
      }

      const mergedBlob = await mergeFrameOntoCanvas(faceCanvas, selectedFrameUrl);

      if (!currentUser?.userId) throw new Error("Bạn chưa đăng nhập.");

      const newAvatarUrl = await uploadAvatarBlob(mergedBlob, currentUser.userId);

      if (newAvatarUrl && typeof newAvatarUrl === 'string' && newAvatarUrl.trim() !== '') {
        const finalUrl = newAvatarUrl.startsWith('http') ? newAvatarUrl : `http://localhost:5000${newAvatarUrl}`;
        
        let finalBaseUrl = currentUser?.baseAvatarUrl || explicitBase;
        if (hasNewFace) {
           finalBaseUrl = faceCanvas.toDataURL("image/png");
           sessionStorage.setItem("baseAvatarUrl", finalBaseUrl);
        }
        
        sessionStorage.setItem("frameUrl", selectedFrameUrl || "null");

        const updatedUser = { ...currentUser, avatarUrl: finalUrl, baseAvatarUrl: finalBaseUrl };
        sessionStorage.setItem("user", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("storage"));
        onAvatarUpdated?.(finalUrl, finalBaseUrl);
      }

      setStep("done");
      setTimeout(() => handleClose(), 1000);
    } catch (err) {
      console.error("[AvatarCropperModal] Upload error:", err);
      setError(err.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
      setStep("idle");
    }
  };

  const handleClose = () => {
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setStep("idle");
    setActiveTab("avatar");
    setError("");
    onClose?.();
  };

  const renderSidebarItem = (id, label, Icon) => {
    const isActive = activeTab === id;
    return (
      <Box
        onClick={() => setActiveTab(id)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          py: 1.5,
          px: 2,
          borderRadius: "12px",
          cursor: "pointer",
          bgcolor: isActive ? alpha(PRIMARY, 0.1) : "transparent",
          color: isActive ? PRIMARY : MUTED,
          fontWeight: isActive ? 700 : 500,
          transition: "all 0.2s",
          "&:hover": {
            bgcolor: isActive ? alpha(PRIMARY, 0.1) : alpha(MUTED, 0.05),
          }
        }}
      >
        <Icon sx={{ fontSize: 20 }} />
        <Typography sx={{ fontSize: 14, fontWeight: "inherit" }}>{label}</Typography>
      </Box>
    );
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <Modal
        open={open}
        onClose={step === "uploading" ? undefined : handleClose}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Box
          sx={{
            position: "relative",
            bgcolor: "#fff",
            borderRadius: "24px",
            boxShadow: "0 24px 80px rgba(8,145,178,0.18)",
            width: { xs: "95vw", md: 860 },
            height: { xs: "90vh", md: 580 },
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 3,
              pt: 3,
              pb: 2,
              borderBottom: "1px solid rgba(8,145,178,0.08)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CropRoundedIcon sx={{ fontSize: 20, color: PRIMARY }} />
              <Typography sx={{ fontSize: 16, fontWeight: 700, color: TEXT }}>
                Cập nhật ảnh đại diện
              </Typography>
            </Box>
            <IconButton
              onClick={step === "uploading" ? undefined : handleClose}
              size="small"
              sx={{ color: MUTED }}
            >
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Full-Screen Loading/Success Overlays */}
          {step === "uploading" && (
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
              <CircularProgress size={52} sx={{ color: PRIMARY }} />
              <Typography sx={{ fontSize: 15, color: MUTED }}>Đang tải ảnh lên…</Typography>
            </Box>
          )}
          {step === "done" && (
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
              <Box sx={{ width: 64, height: 64, borderRadius: "50%", bgcolor: alpha("#16A34A", 0.1), display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckRoundedIcon sx={{ fontSize: 34, color: "#16A34A" }} />
              </Box>
              <Typography sx={{ fontSize: 16, fontWeight: 700, color: TEXT }}>Cập nhật thành công!</Typography>
            </Box>
          )}

          {/* Main Content Area */}
          {step === "idle" && (
            <Box sx={{ flex: 1, display: "flex", overflow: "hidden", flexDirection: { xs: "column", sm: "row" } }}>
              {/* Sidebar */}
              <Box
                sx={{
                  width: { xs: "100%", sm: 220 },
                  borderRight: { sm: "1px solid rgba(8,145,178,0.08)" },
                  borderBottom: { xs: "1px solid rgba(8,145,178,0.08)", sm: "none" },
                  p: 2,
                  display: "flex",
                  flexDirection: { xs: "row", sm: "column" },
                  gap: 1,
                  bgcolor: alpha(MUTED, 0.02),
                  flexShrink: 0,
                  overflowX: "auto"
                }}
              >
                {renderSidebarItem("avatar", "Ảnh đại diện", ImageOutlinedIcon)}
                {renderSidebarItem("frame", "Khung Viền", FilterFramesOutlinedIcon)}
              </Box>

              {/* Tab Content */}
              <Box sx={{ flex: 1, p: { xs: 2, md: 3 }, overflowY: "auto", display: "flex", flexDirection: "column" }}>
                {error && (
                  <Typography sx={{ mb: 2, fontSize: 13, color: "#DC2626", bgcolor: alpha("#DC2626", 0.06), px: 2, py: 1, borderRadius: "8px" }}>
                    {error}
                  </Typography>
                )}

                {/* TAB: AVATAR */}
                {activeTab === "avatar" && (
                  <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    {!imageSrc ? (
                      <Box
                        onClick={() => fileInputRef.current?.click()}
                        sx={{
                          flex: 1,
                          borderRadius: "16px",
                          border: `2px dashed ${alpha(PRIMARY, 0.4)}`,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1.5,
                          cursor: "pointer",
                          bgcolor: alpha(PRIMARY, 0.02),
                          transition: "all 0.2s",
                          "&:hover": { bgcolor: alpha(PRIMARY, 0.06), borderColor: PRIMARY },
                        }}
                      >
                        <AddPhotoAlternateOutlinedIcon sx={{ fontSize: 48, color: PRIMARY }} />
                        <Typography sx={{ fontSize: 15, fontWeight: 600, color: TEXT }}>Tải ảnh lên</Typography>
                        <Typography sx={{ fontSize: 13, color: MUTED }}>Nhấn để chọn ảnh từ thiết bị</Typography>
                      </Box>
                    ) : (
                      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                        <Box sx={{ position: "relative", width: "100%", flex: 1, minHeight: { xs: 260, md: 300 }, borderRadius: "16px", overflow: "hidden", bgcolor: "#1a1a2e" }}>
                          <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            cropShape="round"
                            showGrid={false}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                            style={CROPPER_STYLE}
                          />
                        </Box>
                        <Box sx={{ mt: 3, px: 1 }}>
                          <Typography sx={{ fontSize: 13, color: MUTED, mb: 1, fontWeight: 500 }}>Thu phóng ảnh</Typography>
                          <Slider
                            value={zoom} min={1} max={3} step={0.01}
                            onChange={(_, v) => setZoom(v)}
                            sx={{ color: PRIMARY }}
                          />
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                          <Box
                            component="button"
                            onClick={() => fileInputRef.current?.click()}
                            sx={{
                              height: 36, px: 2, borderRadius: "8px", border: `1px solid ${alpha(PRIMARY, 0.3)}`,
                              bgcolor: "transparent", color: PRIMARY, fontSize: 13, fontWeight: 600, cursor: "pointer",
                              "&:hover": { bgcolor: alpha(PRIMARY, 0.05) }
                            }}
                          >
                            Đổi ảnh khác
                          </Box>
                        </Box>
                      </Box>
                    )}
                  </Box>
                )}

                {/* TAB: FRAME */}
                {activeTab === "frame" && (
                  <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: { xs: 3, md: 4 }, flex: 1 }}>
                    {/* Live Preview - Center/Left */}
                    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRight: { md: `1px solid rgba(8,145,178,0.08)` }, pr: { md: 4 } }}>
                      <Typography sx={{ fontSize: 15, fontWeight: 600, color: TEXT, mb: 4 }}>Xem trước hiệu ứng</Typography>
                      <FramePreview imageSrc={imageSrc} croppedAreaPixels={croppedAreaPixels} frameUrl={selectedFrameUrl} existingAvatarUrl={existingAvatarUrl} size={180} />
                    </Box>
                    {/* Frame Selection Grid - Right */}
                    <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                      <Typography sx={{ fontSize: 15, fontWeight: 600, color: TEXT, mb: 2 }}>Khung viền có sẵn</Typography>
                      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: 2, overflowY: "auto", pb: 2 }}>
                        {FRAMES.map((f) => {
                          const isSelected = selectedFrameUrl === f.url;
                          return (
                            <Tooltip key={f.id} title={f.name} placement="top" arrow>
                              <Box
                                onClick={() => setSelectedFrameUrl(f.url)}
                                sx={{
                                  aspectRatio: "1",
                                  borderRadius: "16px",
                                  border: `2px solid ${isSelected ? f.color : "transparent"}`,
                                  bgcolor: isSelected ? alpha(f.color, 0.08) : alpha(MUTED, 0.04),
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                  transition: "all 0.2s",
                                  "&:hover": { bgcolor: isSelected ? alpha(f.color, 0.12) : alpha(MUTED, 0.08) },
                                }}
                              >
                                {f.url ? (
                                  <img src={f.url} alt={f.name} style={{ width: "65%", height: "65%", objectFit: "contain" }} />
                                ) : (
                                  <BlockRoundedIcon sx={{ fontSize: 32, color: MUTED, opacity: 0.5 }} />
                                )}
                              </Box>
                            </Tooltip>
                          );
                        })}
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {/* Persistent Footer */}
          {step === "idle" && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                px: 3,
                py: 2,
                borderTop: "1px solid rgba(8,145,178,0.08)",
                bgcolor: alpha(MUTED, 0.01)
              }}
            >
              <Box
                component="button"
                onClick={handleConfirm}
                sx={{
                  height: 44,
                  px: 4,
                  borderRadius: "12px",
                  border: "none",
                  background: `linear-gradient(135deg, #0891B2 0%, #0E7490 100%)`,
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                  boxShadow: `0 4px 14px ${alpha(PRIMARY, 0.35)}`,
                  transition: "opacity 0.2s, transform 0.15s",
                  "&:hover": { opacity: 0.9, transform: "translateY(-1px)" },
                  "&:active": { transform: "translateY(0)" },
                }}
              >
                <CheckRoundedIcon sx={{ fontSize: 20 }} />
                Xác nhận & Tải lên
              </Box>
            </Box>
          )}
        </Box>
      </Modal>
    </>
  );
}
