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
import MentorCoursesPage from './pages/mentor/MentorCoursesPage';
import MentorNewsPage from './pages/mentor/MentorNewsPage';
import MentorStudentProgressPage from './pages/mentor/MentorStudentProgressPage';
import MentorCreateCoursePage from './pages/mentor/MentorCreateCoursePage';
import MentorCreateCourseContentPage from './pages/mentor/MentorCreateCourseContentPage';
import MentorCreateCourseReviewPage from './pages/mentor/MentorCreateCourseReviewPage';
import MentorCoursePlaceholder from './components/mentor/MentorCoursePlaceholder';

import MainLayout from './components/layout/MainLayout';
import MentorLayout from './components/layout/MentorLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

const MENTOR_BLOCK_REDIRECTS = { Mentor: '/mentor/courses' };
const STUDENT_MENTOR_ROUTE_REDIRECTS = { Student: '/courses' };

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/register"        element={<RegisterPage />} />
        <Route path="/verify-otp"      element={<OtpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password"  element={<ResetPasswordPage />} />
        <Route path="/unauthorized"    element={<UnauthorizedPage />} />
        <Route path="/test-component" element={<TestPage />} />

        <Route
          path="/survey"
          element={
            <ProtectedRoute allowedRoles={['Student', 'Admin', 'Mentor']}>
              <SurveyPage />
            </ProtectedRoute>
          }
        />

        {/* Student app shell */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="home" element={<HomePage />} />

          <Route
            path="courses"
            element={
              <ProtectedRoute
                allowedRoles={['Student', 'Admin']}
                roleRedirects={MENTOR_BLOCK_REDIRECTS}
              >
                <CourseListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="courses/:id"
            element={
              <ProtectedRoute
                allowedRoles={['Student', 'Admin']}
                roleRedirects={MENTOR_BLOCK_REDIRECTS}
              >
                <CourseDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="my-courses"
            element={
              <ProtectedRoute
                allowedRoles={['Student']}
                roleRedirects={MENTOR_BLOCK_REDIRECTS}
              >
                <MyCoursesListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="my-courses/:courseId/learn"
            element={
              <ProtectedRoute
                allowedRoles={['Student']}
                roleRedirects={MENTOR_BLOCK_REDIRECTS}
              >
                <CourseLearningPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute
                allowedRoles={['Student', 'Admin']}
                roleRedirects={MENTOR_BLOCK_REDIRECTS}
              >
                <ProfilePage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Admin routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <Navigate to="/" replace />
            </ProtectedRoute>
          }
        />

        {/* Mentor routes */}
        <Route
          path="/mentor"
          element={
            <ProtectedRoute
              allowedRoles={['Mentor']}
              roleRedirects={STUDENT_MENTOR_ROUTE_REDIRECTS}
            >
              <MentorLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/mentor/courses" replace />} />
          <Route path="courses/create/review" element={<MentorCreateCourseReviewPage />} />
          <Route path="courses/create/content" element={<MentorCreateCourseContentPage />} />
          <Route path="courses/create" element={<MentorCreateCoursePage />} />
          <Route path="courses/:courseId/edit" element={
            <MentorCoursePlaceholder
              title="Chỉnh sửa khóa học"
              description="Cập nhật thông tin khóa học."
            />
          } />
          <Route path="courses/:courseId/content" element={
            <MentorCoursePlaceholder
              title="Quản lý nội dung"
              description="Quản lý chương, bài và học liệu."
            />
          } />
          <Route path="courses/:courseId" element={
            <MentorCoursePlaceholder
              title="Chi tiết khóa học"
              description="Xem tổng quan khóa học."
            />
          } />
          <Route path="courses" element={<MentorCoursesPage />} />
          <Route path="news" element={<MentorNewsPage />} />
          <Route path="student-progress" element={<MentorStudentProgressPage />} />
          <Route path="paths" element={<Navigate to="/mentor/courses" replace />} />
          <Route path="*" element={<Navigate to="/mentor/courses" replace />} />
        </Route>

        {/* Student-specific routes placeholder */}
        <Route
          path="/student/*"
          element={
            <ProtectedRoute allowedRoles={['Student']}>
              <Navigate to="/" replace />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
