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
import UnauthorizedPage from './pages/UnauthorizedPage';

import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ──────────────────────────────────────────────────── */}
        {/* Public routes — accessible without login            */}
        {/* ──────────────────────────────────────────────────── */}
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/register"        element={<RegisterPage />} />
        <Route path="/verify-otp"      element={<OtpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password"  element={<ResetPasswordPage />} />
        <Route path="/unauthorized"    element={<UnauthorizedPage />} />

        {/* Demo UI components — public */}
        <Route path="/test-component" element={<TestPage />} />

        {/* ──────────────────────────────────────────────────── */}
        {/* Onboarding survey — any authenticated user          */}
        {/* ──────────────────────────────────────────────────── */}
        <Route
          path="/survey"
          element={
            <ProtectedRoute>
              <SurveyPage />
            </ProtectedRoute>
          }
        />

        {/* ──────────────────────────────────────────────────── */}
        {/* Main app with Header + Sidebar + Footer             */}
        {/* Root "/" shows HomePage for everyone (public)        */}
        {/* Other pages under "/" require login (Student role)   */}
        {/* ──────────────────────────────────────────────────── */}
        <Route path="/" element={<MainLayout />}>
          {/* Landing page — public, no login required */}
          <Route index element={<HomePage />} />
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
              <ProtectedRoute allowedRoles={['Student','Mentor']}>
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

        {/* ──────────────────────────────────────────────────── */}
        {/* Admin routes — Admin role only                      */}
        {/* ──────────────────────────────────────────────────── */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              {/* TODO: Replace with admin layout / dashboard pages */}
              <Navigate to="/" replace />
            </ProtectedRoute>
          }
        />

        {/* ──────────────────────────────────────────────────── */}
        {/* Mentor routes — Mentor role only                    */}
        {/* ──────────────────────────────────────────────────── */}
        <Route
          path="/mentor/*"
          element={
            <ProtectedRoute allowedRoles={['Mentor']}>
              {/* TODO: Replace with mentor layout / dashboard pages */}
              <Navigate to="/" replace />
            </ProtectedRoute>
          }
        />

        {/* ──────────────────────────────────────────────────── */}
        {/* Student routes — Student role only                  */}
        {/* ──────────────────────────────────────────────────── */}
        <Route
          path="/student/*"
          element={
            <ProtectedRoute allowedRoles={['Student']}>
              {/* TODO: Replace with student-specific pages */}
              <Navigate to="/" replace />
            </ProtectedRoute>
          }
        />

        {/* ──────────────────────────────────────────────────── */}
        {/* Fallback — unknown routes go to home                */}
        {/* ──────────────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
