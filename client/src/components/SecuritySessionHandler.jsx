import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const TIMEOUT_MS = 60 * 60 * 1000; // 1 tiếng (3600000 ms)

export default function SecuritySessionHandler({ currentUser, onLogout }) {
  const navigate = useNavigate();
  const timerRef = useRef(null);

  // Lưu reference của onLogout để tránh phụ thuộc chạy lại useEffect
  const onLogoutRef = useRef(onLogout);
  useEffect(() => {
    onLogoutRef.current = onLogout;
  }, [onLogout]);

  useEffect(() => {
    if (!currentUser) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      return;
    }

    const resetTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Thiết lập bộ đếm thời gian chờ 1 tiếng
      timerRef.current = setTimeout(() => {
        console.warn("Phiên hoạt động hết hạn (1 tiếng). Tự động đăng xuất an toàn...");
        onLogoutRef.current();
        alert("Phiên đăng nhập của bạn đã hết hạn do không có hoạt động trong 1 giờ. Các tiến trình học tập của bạn đã được tự động lưu lại.");
        navigate("/login?reason=timeout");
      }, TIMEOUT_MS);
    };

    // Các sự kiện tương tác để tính là đang hoạt động
    const activityEvents = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];

    // Khởi tạo bộ đếm lần đầu
    resetTimer();

    // Lắng nghe sự kiện tương tác
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [currentUser, navigate]);

  return null;
}
