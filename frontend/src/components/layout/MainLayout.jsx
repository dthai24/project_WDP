import { Box, Container } from "@mui/material";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const DEFAULT_NAV = [
  { label: "Trang chủ", to: "/" },
  { label: "Test UI", to: "/test-component" },
];

export default function MainLayout({ navLinks = DEFAULT_NAV, children }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
      }}
    >
      <Header navLinks={navLinks} />
      <Box component="main" sx={{ flex: 1, py: { xs: 2, md: 4 } }}>
        <Container maxWidth="lg">
          {children ?? <Outlet />}
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}
