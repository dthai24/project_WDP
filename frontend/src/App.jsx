import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OtpPage from './pages/OtpPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import SurveyPage from './pages/SurveyPage';
import TestPage from './pages/Test';
import CourseListPage from './pages/CourseListPage';
import CourseDetailPage from './pages/CourseDetailPage';
import CourseLearningPage from './pages/CourseLearningPage';
import MyCoursesListPage from './pages/MyCoursesListPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

import MainLayout from './components/layout/MainLayout';

/** Guard: redirect về /login nếu chưa đăng nhập */
function ProtectedRoute({ children }) {
  const user = sessionStorage.getItem('user');
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ──────────────────────────────────────────────────── */}
        {/* Public routes — accessible without login            */}
        {/* ──────────────────────────────────────────────────── */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<OtpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Demo UI components — public */}
        <Route path="/test-component" element={<TestPage />} />

        {/* Onboarding survey — cần đăng nhập */}
        <Route
          path="/survey"
          element={
            <ProtectedRoute>
              <SurveyPage />
            </ProtectedRoute>
          }
        />

        {/* Main app — Header + Footer */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home" element={<HomePage />} />

          {/* Student-accessible routes — require login */}
          <Route
            path="courses"
            element={
              <ProtectedRoute allowedRoles={['Student', 'Admin', 'Mentor']}>
                <CourseListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="courses/:id"
            element={
              <ProtectedRoute allowedRoles={['Student', 'Admin', 'Mentor']}>
                <CourseDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="my-courses"
            element={
              <ProtectedRoute allowedRoles={['Student', 'Mentor']}>
                <MyCoursesListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="my-courses/:courseId/learn"
            element={
              <ProtectedRoute allowedRoles={['Student']}>
                <CourseLearningPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes >
    </BrowserRouter >
  );
}
