import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import MainLayout from '../components/layout/MainLayout';
import LandingPage from '../pages/LandingPage/LandingPage';
import Home from '../pages/Home/Home';
import Categories from '../pages/Categories/Categories';
import Words from '../pages/Words/Words';
import Practice from '../pages/Practice/Practice';
import Games from '../pages/Games/Games';
import Roadmap from '../pages/Roadmap/Roadmap';
import Leaderboard from '../pages/Leaderboard/Leaderboard';
import Store from '../pages/Store/Store';
import Pricing from '../pages/Pricing/Pricing';
import Quiz from '../pages/Quiz/Quiz';
import Classes from '../pages/Classes/Classes';
import Policy from '../pages/Policy/Policy';
import Login from '../pages/Login/Login';
import Register from '../pages/Register/Register';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useApp();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated } = useApp();
  if (isAuthenticated) return <Navigate to="/home" replace />;
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/home" element={<Home />} />
        <Route path="/category-list" element={<Categories />} />
        <Route path="/words" element={<Words />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/games" element={<Games />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/store" element={<Store />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/classes" element={<Classes />} />
        <Route path="/policy" element={<Policy />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
