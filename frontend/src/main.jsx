import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import ToastProvider from './shared/ui/Toast.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import ErrorBoundary from './shared/ui/ErrorBoundary.jsx';

console.log("main.jsx: Render process started");
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
