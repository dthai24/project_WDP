<<<<<<< Updated upstream
import { useEffect, useState } from "react";
import LoginPage from "./pages/Auth/LoginPage";
=======
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
>>>>>>> Stashed changes
import HomePage from "./pages/Home/HomePage";
import AdminRoutes from "./routes/admin-routes";

function App() {
<<<<<<< Updated upstream
  const [currentPage, setCurrentPage] = useState("home");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("learnpath_user");

    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userSession) => {
    setCurrentUser(userSession);
    localStorage.setItem("learnpath_user", JSON.stringify(userSession));
    setCurrentPage("home");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("learnpath_user");
    setCurrentPage("home");
  };

  if (currentPage === "login") {
    return (
      <LoginPage
        onLogin={handleLogin}
        onBackHome={() => setCurrentPage("home")}
      />
    );
  }

  return (
    <HomePage
      currentUser={currentUser}
      onLoginClick={() => setCurrentPage("login")}
      onLogout={handleLogout}
    />
=======
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Public Route */}
        <Route path="/" element={<HomePage />} />
        
        {/* Admin Dashboard Subsystem Route Group */}
        <Route path="/admin/*" element={<AdminRoutes />} />
        
        {/* Fallback Redirect to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
>>>>>>> Stashed changes
  );
}

export default App;
