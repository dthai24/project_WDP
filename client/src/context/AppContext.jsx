import { createContext, useContext, useState, useEffect } from 'react';
import { currentUser } from '../data/mockData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem('isAuthenticated') === 'true'
  );
  const [user, setUser] = useState(currentUser);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('darkMode') === 'true'
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const login = (email, password) => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
    setUser({ ...currentUser, email: email || currentUser.email });
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
  };

  const register = (name, email) => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
    setUser({ ...currentUser, name, email });
    return true;
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        user,
        darkMode,
        setDarkMode,
        sidebarCollapsed,
        setSidebarCollapsed,
        sidebarOpen,
        setSidebarOpen,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
