import { useEffect, useState } from "react";
import LoginPage from "./pages/Auth/LoginPage";
import HomePage from "./pages/Home/HomePage";

function App() {
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
  );
}

export default App;
