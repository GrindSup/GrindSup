import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../config/axios.config";

export default function OAuthSuccess({ setUsuario, redirectTo = "/dashboard" }) {
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true; 

        // Función asíncrona principal
        const handleAuthSuccess = async () => {
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

            // 2) guardar token y configurar Axios
            localStorage.setItem("gs_token", token);
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            document.cookie = `gs_token=${token}; Path=/; SameSite=Lax`;

            try {
                // 3) Llamar /me y obtener datos de usuario
                const r = await api.get("/api/usuarios/me");
                const usuario = r.data?.usuario ?? r.data ?? null;

                if (isMounted && usuario && setUsuario) {
                    // ACTUALIZAR ESTADO
                    setUsuario(usuario);
                    localStorage.setItem("usuario", JSON.stringify(usuario));
                    
                    // Asegurar que userId se guarda para los servicios
                    if (usuario?.correo) {
                        localStorage.setItem("userId", usuario.correo);
                    } else if (usuario?.id_usuario) {
                        localStorage.setItem("userId", String(usuario.id_usuario));
                    }
                }

                // 4) 🚀 REDIRECCIÓN FINAL DE DESFASE (TIMEOUT 0)
                // Forzar la navegación fuera del ciclo de renderizado inmediato del useEffect
                setTimeout(() => {
                    if (isMounted) {
                        navigate(redirectTo, { replace: true });
                    }
                }, 0); 

            } catch (e) {
                console.warn("OAuthSuccess: /me falló. Limpiando y navegando a login...", e);
                // Si falla /me, limpiamos y enviamos al login
                localStorage.removeItem("gs_token");
                localStorage.removeItem("usuario");
                setUsuario(null); // Limpiamos el estado en App
                setTimeout(() => {
                    if (isMounted) {
                        navigate("/login", { replace: true });
                    }
                }, 0); 
            }
        };

        handleAuthSuccess();

        return () => { isMounted = false; };
        
    }, [navigate, setUsuario, redirectTo]); // Asegura que las dependencias estén correctas

    // Puedes renderizar un spinner o null mientras esperas la redirección
    return null;
}