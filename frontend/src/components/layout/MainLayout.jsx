import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./Sidebar";
import { SIDEBAR_WIDTH } from "./Sidebar";

/** Header height — matches AppBar Toolbar minHeight at sm breakpoint */
export const HEADER_HEIGHT = 60;

/** Padding for page content areas */
export const pageContentSx = {
  width: "100%",
  boxSizing: "border-box",
  py: { xs: 2, sm: 3, md: 4 },
  px: { xs: 2, sm: 3, md: 4, lg: 6 },
};

export default function MainLayout({ children }) {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#FFFFFF" }}>
      {/* Full-width sticky header */}
      <Header />

      {/* Fixed sidebar — rendered outside the flow so it doesn't scroll */}
      <Sidebar />

      {/* Main content offset by sidebar width */}
      <Box
        sx={{
          ml: `${SIDEBAR_WIDTH}px`,
          display: "flex",
          flexDirection: "column",
          minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
          bgcolor: "#FFFFFF",
        }}
      >
        <Box component="main" sx={{ flex: 1 }}>
          <Box sx={pageContentSx}>{children ?? <Outlet />}</Box>
        </Box>
        <Footer />
      </Box>
    </Box>
  );
}
