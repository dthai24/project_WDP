import React, { useState, useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);

  // Giữ trạng thái đăng nhập khi tải lại trang
  useEffect(() => {
    const savedUser = localStorage.getItem("lexiora_user");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userSession) => {
    setCurrentUser(userSession);
    localStorage.setItem("lexiora_user", JSON.stringify(userSession));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("lexiora_user");
  };

  return (
    <AppRoutes
      currentUser={currentUser}
      onLogin={handleLogin}
      onLogout={handleLogout}
    />
  );
}