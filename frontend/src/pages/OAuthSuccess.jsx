// src/pages/OAuthSuccess.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../config/axios.config";

// 💡 Aceptamos las props setUsuario y redirectTo
export default function OAuthSuccess({ setUsuario, redirectTo = "/dashboard" }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Usamos una bandera para evitar la ejecución doble en React StrictMode (en desarrollo)
    let isMounted = true; 

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
        navigate("/login", { replace: true });
        return;
      }

      // 2) guardar token
      localStorage.setItem("gs_token", token);
      
      // 3) setear header de Axios inmediatamente
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      // 4) (opcional) dejar cookie de escape para el filtro
      document.cookie = `gs_token=${token}; Path=/; SameSite=Lax`;

      // 5) Llamar /me y actualizar estado de la app de forma síncrona
      (async () => {
        try {
          const r = await api.get("/api/usuarios/me");
          const usuario = r.data?.usuario ?? r.data ?? null;

          if (isMounted && usuario && setUsuario) {
            // ✅ ACTUALIZACIÓN CLAVE: Llama a setUsuario para actualizar el estado en App.jsx
            setUsuario(usuario);
            // ✅ Y luego guardar en localStorage (el useEffect de App.jsx también lo haría, 
            // pero es buena práctica hacerlo aquí también si no estás 100% seguro)
            localStorage.setItem("usuario", JSON.stringify(usuario));
          }

          // ✅ REDIRIGIR A LA RUTA FINAL: El estado 'usuario' en App.jsx YA NO ES NULL.
          navigate(redirectTo, { replace: true });

        } catch (e) {
          console.warn("OAuthSuccess: /me falló. Navegando a login...", e);
          // Si falla /me (ej. token inválido), limpiamos y enviamos al login
          localStorage.removeItem("gs_token");
          localStorage.removeItem("usuario");
          navigate("/login", { replace: true });
        }
      })();
    } catch (e) {
      console.error("OAuthSuccess error fatal", e);
      navigate("/login", { replace: true });
    }
    
    return () => { isMounted = false; };
    
  }, [navigate, setUsuario, redirectTo]); // Asegura que las dependencias estén correctas

  // Puedes renderizar un spinner o null mientras esperas la redirección
  return null;
}