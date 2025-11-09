// frontend/src/components/GoogleButton.jsx
export default function GoogleButton({
  label = "Continuar con Google",
  size = "md",        // "sm" | "md" | "lg"
  full = true,        // botón ancho completo
}) {
  const base = import.meta.env?.VITE_API_BASE_URL || "http://localhost:8080";
  const href = `${base}/oauth2/authorization/google`;

  const paddings = { sm: "0.55rem 0.9rem", md: "0.75rem 1rem", lg: "0.9rem 1.25rem" };
  const font = { sm: "0.95rem", md: "1.05rem", lg: "1.15rem" };

  return (
    <button
      onClick={() => (window.location.href = href)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.6rem",
        backgroundColor: "#fff",
        color: "#3c4043",
        border: "1px solid #dadce0",
        borderRadius: "8px",
        padding: paddings[size],
        fontWeight: 600,
        fontSize: font[size],
        width: full ? "100%" : "auto",
        boxShadow: "0 1px 1px rgba(0,0,0,0.05)",
        cursor: "pointer",
      }}
      aria-label={label}
    >
      {/* Google “G” oficial (SVG) */}
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3A12.9 12.9 0 0111 24a12.9 12.9 0 0123.3-7.7l5.7-5.7A21 21 0 1036 44a20.4 20.4 0 007.6-23.5z"/>
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8A12.9 12.9 0 0124 11a12.9 12.9 0 018.7 3.3l6-6A21 21 0 006 14.7z"/>
        <path fill="#4CAF50" d="M24 45a21 21 0 0014.1-5.4l-6.5-5.3A12.9 12.9 0 0111 24H3a21 21 0 0021 21z"/>
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3A13 13 0 0124 37a12.9 12.9 0 01-11.1-6.5l-6.6 5A21 21 0 0045 24a20.8 20.8 0 00-1.4-3.5z"/>
      </svg>
      {label}
    </button>
  );
}
