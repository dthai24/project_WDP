import React from "react";
import AppRoutes from "./routes/AppRoutes"; // Đường dẫn đến file AppRoutes của bạn

export default function App() {
  return (
    <>
      {/* Chỉ gọi duy nhất AppRoutes ở đây để quản lý toàn bộ trang */}
      <AppRoutes />
    </>
  );
}