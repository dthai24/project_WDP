import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OtpPage      from './pages/OtpPage';
import HomePage     from './pages/HomePage';
import ProfilePage  from './pages/ProfilePage';
import SurveyPage   from './pages/SurveyPage';
import TestPage     from './pages/Test';
import MainLayout   from './components/layout/MainLayout';

/** Guard: redirect về /login nếu chưa đăng nhập */
function ProtectedRoute({ children }) {
  const user = sessionStorage.getItem('user');
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes — public */}
        <Route path="/login"      element={<LoginPage />} />
        <Route path="/register"   element={<RegisterPage />} />
        <Route path="/verify-otp" element={<OtpPage />} />

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
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
