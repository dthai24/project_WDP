import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import OtpPage from '@/features/auth/pages/OtpPage';
import HomePage from '@/features/home/HomePage';
import ProfilePage from '@/features/profile/pages/ProfilePage';
import SurveyPage from '@/features/auth/pages/SurveyPage';
import TestPage from '@/features/dev/Test';
import CourseListPage from '@/features/courses/pages/CourseListPage';
import CourseDetailPage from '@/features/courses/pages/CourseDetailPage';
import CourseLearningPage from '@/features/learning/pages/CourseLearningPage';
import MyCoursesListPage from '@/features/learning/pages/MyCoursesListPage';
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/features/auth/pages/ResetPasswordPage';
import UnauthorizedPage from '@/features/auth/pages/UnauthorizedPage';
import MentorCoursesPage from '@/features/mentor/pages/MentorCoursesPage';
import MentorNewsPage from '@/features/mentor/pages/MentorNewsPage';
import MentorStudentProgressPage from '@/features/mentor/pages/MentorStudentProgressPage';
import MentorCreateCoursePage from '@/features/mentor/pages/MentorCreateCoursePage';
import MentorCreateCourseContentPage from '@/features/mentor/pages/MentorCreateCourseContentPage';
import MentorCreateCourseReviewPage from '@/features/mentor/pages/MentorCreateCourseReviewPage';
import MentorEditCoursePage from '@/features/mentor/pages/MentorEditCoursePage';
import MentorEditCourseContentPage from '@/features/mentor/pages/MentorEditCourseContentPage';
import MentorEditCourseReviewPage from '@/features/mentor/pages/MentorEditCourseReviewPage';
import MentorCourseDetailPage from '@/features/mentor/pages/MentorCourseDetailPage';
import MentorQuestionBankListPage from '@/features/mentor/pages/MentorQuestionBankListPage';
import MentorQuestionBankCreatePage from '@/features/mentor/pages/MentorQuestionBankCreatePage';
import MentorCourseQuestionsPage from '@/features/mentor/pages/MentorCourseQuestionsPage';
import MentorCoursePlaceholder from '@/features/mentor/components/MentorCoursePlaceholder';

import MainLayout from '@/shared/layout/MainLayout';
import MentorLayout from '@/shared/layout/MentorLayout';
import ProtectedRoute from '@/shared/ui/ProtectedRoute';

const MENTOR_BLOCK_REDIRECTS = { Mentor: '/mentor/courses' };
const STUDENT_MENTOR_ROUTE_REDIRECTS = { Student: '/courses' };

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<OtpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
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
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="home" element={<HomePage />} />

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
          <Route path="courses/:courseId/review" element={<MentorEditCourseReviewPage />} />
          <Route path="courses/:courseId/content/edit" element={<MentorEditCourseContentPage />} />
          <Route path="courses/:courseId/edit" element={<MentorEditCoursePage />} />
          <Route path="courses/:courseId/questions" element={<MentorCourseQuestionsPage />} />
          <Route path="courses/:courseId" element={<MentorCourseDetailPage />} />
          <Route path="courses" element={<MentorCoursesPage />} />
          <Route path="question-banks/create" element={<MentorQuestionBankCreatePage />} />
          <Route path="question-banks" element={<MentorQuestionBankListPage />} />
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
