import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import HomePage from "../pages/Home/HomePage"; 
import LoginPage from "../pages/Auth/LoginPage";
import CreateCourse from "../pages/Mentor/CreateCourse";
import BecomeMentor from "../pages/Mentor/BecomeMentor"; 
import { Dashboard } from "../pages/Home/Dashboard";
import AdminRoutes from "./admin-routes"; 

export default function AppRoutes({ currentUser, onLogin, onLogout }) {
  const navigate = useNavigate();

  return (
    <Routes>
      {/* Trang chủ */}
      <Route 
        path="/" 
        element={
          currentUser?.role === "Learner" ? (
            <Dashboard 
              currentUser={currentUser} 
              onLogout={onLogout} 
            />
          ) : (
            <HomePage 
              currentUser={currentUser} 
              onLogout={onLogout} 
              onLoginClick={() => navigate("/login")} 
            />
          )
        } 
      />

      {/* Trang Đăng nhập */}
      <Route 
        path="/login" 
        element={
          <LoginPage 
            onLogin={(userSession) => {
              onLogin(userSession);
              navigate("/"); 
            }} 
            onBackHome={() => navigate("/")} 
          />
        } 
      />

      {/* 2.  Trang đăng ký làm Mentor */}
      <Route 
        path="/become-mentor" 
        element={
          <BecomeMentor 
            currentUser={currentUser} 
            onBackHome={() => navigate("/")} 
          />
        } 
      />

      {/* Trang Tạo lộ trình học của Mentor */}
      <Route 
        path="/create-roadmap" 
        element={
          <CreateCourse 
            currentUser={currentUser} 
            onBackDashboard={() => navigate("/")} 
          />
        } 
      />

      {/* Student Dashboard */}
      <Route 
        path="/dashboard" 
        element={
          <Dashboard 
            currentUser={currentUser} 
            onLogout={onLogout} 
          />
        } 
      />

      {/* Admin Panel */}
      <Route 
        path="/admin/*" 
        element={
          <AdminRoutes 
            currentUser={currentUser} 
            onLogout={onLogout} 
          />
        } 
      />
    </Routes>
  );
}