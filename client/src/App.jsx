import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import HomePage from "./pages/Home/HomePage";
import LoginPage from "./pages/Auth/LoginPage";
import AdminRoutes from "./routes/admin-routes";

function MainRoutes({ currentUser, handleLogin, handleLogout }) {
  const navigate = useNavigate();

  return (
    <Routes>
      {/* Main Public Route */}
      <Route
        path="/"
        element={
          <HomePage
            currentUser={currentUser}
            onLoginClick={() => navigate("/login")}
            onLogout={handleLogout}
          />
        }
      />

      {/* Authentication Route */}
      <Route
        path="/login"
        element={
          currentUser ? (
            <Navigate to="/" replace />
          ) : (
            <LoginPage
              onLogin={handleLogin}
              onBackHome={() => navigate("/")}
            />
          )
        }
      />

      {/* Admin Dashboard Subsystem Route Group */}
      <Route path="/admin/*" element={<AdminRoutes />} />

      {/* Fallback Redirect to Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("learnpath_user");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Error parsing saved user session:", error);
        localStorage.removeItem("learnpath_user");
      }
    }
  }, []);

  const handleLogin = (userSession) => {
    setCurrentUser(userSession);
    localStorage.setItem("learnpath_user", JSON.stringify(userSession));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("learnpath_user");
  };

  return (
    <BrowserRouter>
      <MainRoutes
        currentUser={currentUser}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
      />
    </BrowserRouter>
  );
}

export default App;
