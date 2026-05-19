import { Box, Container, Typography, Link, alpha, useTheme } from "@mui/material";
import Logo from "../common/Logo";

const DEFAULT_LINKS = [
  { label: "Về chúng tôi", href: "#" },
  { label: "Hỗ trợ", href: "#" },
  { label: "Điều khoản", href: "#" },
];

export default function Footer({
  brand = "S.T.A.R Learning Path",
  links = DEFAULT_LINKS,
  year = new Date().getFullYear(),
}) {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        py: 3,
        borderTop: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
        background: alpha(theme.palette.background.paper, 0.6),
        backdropFilter: "blur(12px)",
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Logo height={28} to="/" />
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              © {year} {brand}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 3 }}>
            {links.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                underline="hover"
                variant="body2"
                sx={{
                  color: "text.secondary",
                  fontWeight: 500,
                  "&:hover": { color: "secondary.main" },
                }}
              >
                {item.label}
              </Link>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
