import { Link as RouterLink } from "react-router-dom";
import logoImg from "../../asset/image/logo.png";

export const LOGO_SRC = logoImg;

export default function Logo({
  height = 40,
  to = "/",
  link = true,
  className = "",
  alt = "English Master Learning Path",
}) {
  const image = (
    <img
      src={logoImg}
      alt={alt}
      className={className}
      style={{
        height,
        width: "auto",
        maxWidth: "100%",
        display: "block",
        objectFit: "contain",
      }}
    />
  );

  if (link && to) {
    return (
      <RouterLink
        to={to}
        aria-label={alt}
        style={{ display: "inline-flex", lineHeight: 0, flexShrink: 0 }}
      >
        {image}
      </RouterLink>
    );
  }

  return image;
}
