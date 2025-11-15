import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../config/axios.config";

export default function OAuthSuccess({ setUsuario, redirectTo = "/dashboard" }) {
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;

        const handleAuthSuccess = async () => {
            // 1) Tomar token de query (?token=...) o de hash (#token=...)
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

            // 2) Guardar token y configurar Axios
            localStorage.setItem("gs_token", token);
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            document.cookie = `gs_token=${token}; Path=/; SameSite=Lax`;

            try {
                // 3) Llamar /me
                const r = await api.get("/api/usuarios/me");
                const usuario = r.data?.usuario ?? r.data ?? null;

                if (isMounted && usuario && setUsuario) {
                    // Actualizar estado global
                    setUsuario(usuario);
                    localStorage.setItem("usuario", JSON.stringify(usuario));

                    // 🔥 Guardar ID del usuario para servicios (Google Calendar, Turnos, etc.)
                    if (usuario?.id_usuario != null) {
                        const idString = String(usuario.id_usuario);
                        localStorage.setItem("gs_user_id", idString);
                        localStorage.setItem("userId", idString);
                    }
                }

                // 4) Redirección final con pequeño desfase para estabilizar estados
                setTimeout(() => {
                    if (isMounted) navigate(redirectTo, { replace: true });
                }, 0);

            } catch (e) {
                console.warn("OAuthSuccess: /me falló. Limpiando sesión…", e);

                // Limpiar todo y enviar al login
                localStorage.removeItem("gs_token");
                localStorage.removeItem("usuario");
                localStorage.removeItem("gs_user_id");
                localStorage.removeItem("userId");
                setUsuario(null);

                setTimeout(() => {
                    if (isMounted) navigate("/login", { replace: true });
                }, 0);
            }
        };

        handleAuthSuccess();

        return () => { isMounted = false; };

    }, [navigate, setUsuario, redirectTo]);

    return null;
}
