import React, { useEffect, useState } from "react";
import AppRoutes from "./routes/AppRoutes";
import ChatBot from "./components/ChatBot";
import FloatingChatButton from "./components/FloatingChatButton";
import SecuritySessionHandler from "./components/SecuritySessionHandler";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

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

  const userRole = currentUser?.role;
  const isUserAdmin = currentUser && (
    userRole === "Admin" ||
    currentUser.email === "admin@gmail.com" ||
    currentUser.email === "minh@gmail.com" ||
    (Array.isArray(currentUser.roles) && currentUser.roles.some(r => r.roleName === "Admin"))
  );

  const isUserMentor = currentUser && (
    userRole === "Mentor" ||
    (Array.isArray(currentUser.roles) && currentUser.roles.some(r => r.roleName === "Mentor"))
  );

  const shouldShowChatbot = !isUserAdmin && !isUserMentor;

  return (
    <>
      <SecuritySessionHandler
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      <AppRoutes
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
      {shouldShowChatbot && (
        <>
          <FloatingChatButton onClick={() => setIsChatOpen(true)} />
          <ChatBot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </>
      )}
    </>
  );
}
