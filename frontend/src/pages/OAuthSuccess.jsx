// frontend/src/pages/OAuthSuccess.jsx
import { useEffect } from "react";
import api from "../config/axios.config";

export default function OAuthSuccess({ setUsuario }) {
  useEffect(() => {
    // El backend redirige a /oauth/success#token=...&uid=...&nombre=...
    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.substring(1)
      : "";
    const params = new URLSearchParams(hash);

    const token  = params.get("token");
    const uid    = params.get("uid");
    const nombre = params.get("nombre") || "";

    if (!token) {
      window.location.replace("/login");
      return;
    }

    // Guarda el token (por si querés usar Authorization en algún caso)
    localStorage.setItem("gs_token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    // Guarda un usuario mínimo para que App renderice el Dashboard
    const usuario = { id_usuario: Number(uid), nombre };
    localStorage.setItem("usuario", JSON.stringify(usuario));
    setUsuario?.(usuario);

    // TIP: si preferís re-montar toda la app y que el init lea localStorage:
    // window.location.replace("/");

    // O, si tu /api/usuarios/me existe y querés hidratar con datos “reales”:
    // api.get("/api/usuarios/me").then(({data}) => {
    //   const u = data.usuario ?? data;
    //   localStorage.setItem("usuario", JSON.stringify(u));
    //   setUsuario?.(u);
    //   window.location.replace("/");
    // }).catch(() => window.location.replace("/"));
    window.location.replace("/");
  }, [setUsuario]);

  return <div style={{ padding: 24 }}>Iniciando sesión…</div>;
}
