// src/pages/OAuthSuccess.jsx (o donde lo tengas)
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../config/axios.config";

export default function OAuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      // 1) tomar token de query (?token=...) o de hash (#token=...)
      const url = new URL(window.location.href);
      const fromQuery = url.searchParams.get("token");
      const fromHash = (() => {
        const h = url.hash || "";
        if (h.startsWith("#token=")) return decodeURIComponent(h.slice(7));
        return null;
      })();
      const token = fromQuery || fromHash;

      if (!token) {
        console.error("OAuthSuccess: no vino token en la URL");
        navigate("/login");
        return;
      }

      console.log("TOKEN OBTENIDO:", token);

      // 2) guardarlo **ANTES** de llamar a /me
      localStorage.setItem("gs_token", token);

      // 3) setear header por si el interceptor aún no lo tomó
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // 4) (opcional) dejar cookie de escape para el filtro
      document.cookie = `gs_token=${token}; Path=/; SameSite=Lax`;

      // 5) ahora sí, llamar /me
      (async () => {
        try {
          const r = await api.get("/api/usuarios/me");
          // guarda usuario si te sirve
          const usuario = r.data?.usuario ?? r.data ?? null;
          if (usuario) localStorage.setItem("usuario", JSON.stringify(usuario));
          navigate("/"); // listo
        } catch (e) {
          console.warn("OAuthSuccess: /me falló", e);
          // si falla por CORS/headers, igual redirige, ya con token seteado
          navigate("/");
        }
      })();
    } catch (e) {
      console.error("OAuthSuccess error", e);
      navigate("/login");
    }
  }, [navigate]);

  return null;
}
