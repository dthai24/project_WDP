import { ToastContainer, toast as notify } from "react-toastify";
import { Alert, alpha, GlobalStyles, ThemeProvider } from "@mui/material";
import appTheme from "../theme.js";
import "react-toastify/dist/ReactToastify.css";

export const TOAST_DURATION = 1500;

const PROGRESS_COLOR = appTheme.palette.primary.main;

const SEVERITY_MAP = {
  success: "success",
  error: "error",
  info: "info",
  warning: "warning",
};

const PROGRESS_SEVERITY_COLOR = {
  success: appTheme.palette.success.main,
  error: appTheme.palette.error.main,
  info: appTheme.palette.primary.main,
  warning: appTheme.palette.accent?.main ?? "#EA580C",
};

function ToastAlert({ message, severity, closeToast }) {
  return (
    <ThemeProvider theme={appTheme}>
      <Alert
        severity={severity}
        variant="standard"
        onClose={closeToast}
        sx={{
          width: "100%",
          minWidth: 320,
          maxWidth: 440,
          py: 1.5,
          px: 2,
          borderRadius: `${appTheme.shape.borderRadius}px`,
          bgcolor: "background.paper",
          border: `1px solid ${alpha(appTheme.palette.primary.main, 0.12)}`,
          boxShadow: appTheme.ios18?.shadow?.md,
          fontSize: 14,
          fontWeight: 600,
          alignItems: "center",
          "& .MuiAlert-icon": { fontSize: 22, mr: 1.25 },
          "& .MuiAlert-message": {
            padding: "3px 0",
            fontSize: 14,
            fontWeight: 600,
            lineHeight: 1.45,
          },
          "& .MuiAlert-action": { pt: 0, alignItems: "center" },
        }}
      >
        {message}
      </Alert>
    </ThemeProvider>
  );
}

function showToast(message, type = "info", options = {}) {
  const severity = SEVERITY_MAP[type] ?? "info";

  return notify(
    ({ closeToast }) => (
      <ToastAlert message={message} severity={severity} closeToast={closeToast} />
    ),
    {
      autoClose: TOAST_DURATION,
      closeButton: false,
      icon: false,
      className: `app-toast app-toast--${severity}`,
      progressClassName: `app-toast-progress app-toast-progress--${severity}`,
      ...options,
    },
  );
}

export const toast = {
  success: (message, options) => showToast(message, "success", options),
  error: (message, options) => showToast(message, "error", options),
  info: (message, options) => showToast(message, "info", options),
  warning: (message, options) => showToast(message, "warning", options),
};

const toastGlobalStyles = {
  ".Toastify__toast.app-toast": {
    marginBottom: "12px",
  },
  ".Toastify__progress-bar.app-toast-progress": {
    opacity: "1 !important",
    height: "4px !important",
    background: `${PROGRESS_COLOR} !important`,
  },
  ".Toastify__progress-bar.app-toast-progress--success": {
    background: `${PROGRESS_SEVERITY_COLOR.success} !important`,
  },
  ".Toastify__progress-bar.app-toast-progress--error": {
    background: `${PROGRESS_SEVERITY_COLOR.error} !important`,
  },
  ".Toastify__progress-bar.app-toast-progress--info": {
    background: `${PROGRESS_SEVERITY_COLOR.info} !important`,
  },
  ".Toastify__progress-bar.app-toast-progress--warning": {
    background: `${PROGRESS_SEVERITY_COLOR.warning} !important`,
  },
};

export default function ToastProvider() {
  return (
    <>
      <GlobalStyles styles={toastGlobalStyles} />
      <ToastContainer
        position="top-right"
        autoClose={TOAST_DURATION}
        newestOnTop
        pauseOnHover
        closeOnClick
        draggable
        limit={3}
        hideProgressBar={false}
        style={{ zIndex: 9999, width: "auto", maxWidth: 460 }}
        toastClassName="app-toast"
        progressClassName="app-toast-progress"
        toastStyle={{
          background: "transparent",
          boxShadow: "none",
          padding: 0,
          minHeight: "unset",
          width: "auto",
        }}
        progressStyle={{
          opacity: 1,
          height: 4,
          background: PROGRESS_COLOR,
        }}
      />
    </>
  );
}
