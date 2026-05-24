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
    <>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          bgcolor: "#FFFFFF",
        }}
      >
        <Header />

        {/* Fixed sidebar — rendered outside the flow so it doesn't scroll */}
        <Sidebar />

        <Box
          component="main"
          sx={{
            ml: `${SIDEBAR_WIDTH}px`,
            flex: 1,
            bgcolor: "#FFFFFF",
          }}
        >
          <Box sx={pageContentSx}>{children ?? <Outlet />}</Box>
        </Box>
      </Box>

      {/* Full viewport width — renders above fixed sidebar at page bottom */}
      <Footer />
    </>
  );
}
