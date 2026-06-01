import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import HomePage from "../pages/Home/HomePage"; 
import LoginPage from "../pages/Auth/LoginPage";
import BecomeMentor from "../pages/Mentor/BecomeMentor";

export default function AppRoutes({ currentUser, onLogin, onLogout }) {
  const navigate = useNavigate();

  return (
    <Routes>
      {/* 1. Trang chủ */}
      <Route 
        path="/" 
        element={
          <HomePage 
            currentUser={currentUser} 
            onLogout={onLogout} 
            onLoginClick={() => navigate("/login")} 
          />
        } 
      />

      {/* 2. Trang Đăng nhập của bạn */}
      <Route 
        path="/login" 
        element={
          <LoginPage 
            onLogin={(userSession) => {
              onLogin(userSession);
              navigate("/"); // Đăng nhập xong đẩy tự động về trang chủ
            }} 
            onBackHome={() => navigate("/")} // Click nút "← Home" nhảy về "/"
          />
        } 
      />

      {/* 3. Trang Become a Mentor */}
      <Route path="/become-mentor" element={<BecomeMentor />} />
    </Routes>
  );
}