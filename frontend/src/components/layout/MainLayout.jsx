import { Box, Container } from "@mui/material";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./Sidebar";

export default function MainLayout({ children }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#F8FAFC",
      }}
    >
      <Header />

      <Box sx={{ display: "flex", flex: 1, alignItems: "stretch" }}>
        <Sidebar />
        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            py: { xs: 2, md: 4 },
            bgcolor: "#F8FAFC",
          }}
        >
          <Container maxWidth="lg">{children ?? <Outlet />}</Container>
        </Box>
      </Box>

      <Footer />
    </Box>
  );
}
