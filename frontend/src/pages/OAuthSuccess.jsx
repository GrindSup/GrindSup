// frontend/src/pages/OAuthSuccess.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../config/axios.config";

export default function OAuthSuccess({ setUsuario }) {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.substring(1)
      : "";
    const params = new URLSearchParams(hash);
    const token = params.get("token");

    if (!token) {
      navigate("/login");
      return;
    }

    // 1. Guarda el token INMEDIATAMENTE
    localStorage.setItem("gs_token", token);
    
    // 2. Configura la instancia de Axios para USAR ESE TOKEN
    //    (Importante: esto solo afecta a ESTA instancia, 
    //     el interceptor se encargará del resto de la app)
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    // 3. ¡DESCOMENTA ESTO!
    // Llama a /api/usuarios/me para obtener los datos REALES del usuario
    api.get("/api/usuarios/me")
      .then(({ data }) => {
        // El controller devuelve { "usuario": { ... } }
        const usuarioReal = data.usuario ?? data; 
        
        // 4. Guarda el usuario REAL (con rol, etc.)
        localStorage.setItem("usuario", JSON.stringify(usuarioReal));
        setUsuario?.(usuarioReal);
        
        // 5. Ahora sí, redirige a la página principal
        navigate("/");
      })
      .catch((err) => {
        // Si /me falla por alguna razón, borra todo y vuelve al login
        console.error("Error al obtener /me después de OAuth", err);
        localStorage.removeItem("gs_token");
        localStorage.removeItem("usuario");
        navigate("/login");
      });

    // ¡No navegues aquí! Espera a que /me responda.
    // navigate("/"); <-- ESTA LÍNEA SE QUITA

  }, [setUsuario, navigate]);

  return <div style={{ padding: 24 }}>Verificando sesión…</div>;
}