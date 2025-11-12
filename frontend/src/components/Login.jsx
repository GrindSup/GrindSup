// frontend/src/components/Login.jsx
import { useState, useEffect } from "react"; // 💡 AGREGAR useEffect
import { useNavigate, Link } from "react-router-dom";
import api from "../config/axios.config";
import GoogleButton from "./GoogleButton";
import "./Login.css";

// 💡 RECIBIR LA PROP 'usuario' del App.jsx
export default function Login({ setUsuario, usuario }) { 
    const [correo, setCorreo] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [error, setError] = useState(false);
    const [errorMensaje, setErrorMensaje] = useState("");
    const navigate = useNavigate();

    // 🚀 REDIRECCIÓN CLAVE: Si ya está logueado, vamos al dashboard
    useEffect(() => {
        if (usuario) {
            navigate("/dashboard", { replace: true });
        }
    }, [usuario, navigate]); // Se ejecuta al cargar el componente y cuando 'usuario' cambia

    const validar = async (e) => {
        e.preventDefault();
        setError(false);
        setErrorMensaje("");

        const correoLimpio = (correo || "").trim();
        if (!correoLimpio || !contrasena) {
            setError(true);
            setErrorMensaje("Faltan datos por completar");
            return;
        }

        try {
            const res = await api.post("/api/usuarios/login", {
                correo: correoLimpio,
                contrasena,
            });
            const data = res?.data || {};

            // Intentos robustos para extraer token
            let token =
                data.token ||
                data.jwt ||
                data.access_token ||
                data.accessToken ||
                data.tokenJwt ||
                data?.data?.token ||
                null;

            // Si vino en headers (Authorization: Bearer xxx / X-Auth-Token)
            if (!token) {
                const authHeader =
                    res.headers?.authorization || res.headers?.Authorization || "";
                if (authHeader && /^Bearer\s+/i.test(authHeader)) {
                    token = authHeader.replace(/^Bearer\s+/i, "");
                } else if (res.headers?.["x-auth-token"]) {
                    token = res.headers["x-auth-token"];
                }
            }

            if (!data?.exito && !token) {
                setError(true);
                setErrorMensaje(data?.mensaje ?? "Credenciales inválidas");
                return;
            }

            if (!token) {
                setError(true);
                setErrorMensaje(
                    "Inicio de sesión exitoso pero el servidor no envió token. Verifica la clave (token/jwt/access_token) o el header Authorization."
                );
                return;
            }

            // Guardar token y configurar axios inmediatamente
            localStorage.setItem("gs_token", token);
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

            // Guardar usuario/sesión si vinieron
            if (data.usuario) localStorage.setItem("usuario", JSON.stringify(data.usuario));
            if (data.usuario?.correo) {
                localStorage.setItem("userId", data.usuario.correo);
            } else if (data.usuario?.id_usuario) {
                localStorage.setItem("userId", String(data.usuario.id_usuario));
            }
            if (data.idSesion) localStorage.setItem("sesionId", data.idSesion);

            // Si no vino el usuario, lo obtenemos con /me usando el token recién seteado
            let usuarioFinal = data.usuario;
            if (!usuarioFinal) {
                try {
                    const me = await api.get("/api/usuarios/me");
                    usuarioFinal = me.data?.usuario ?? me.data ?? null;
                    if (usuarioFinal) {
                        localStorage.setItem("usuario", JSON.stringify(usuarioFinal));
                        if (usuarioFinal.correo) {
                            localStorage.setItem("userId", usuarioFinal.correo);
                        } else if (usuarioFinal.id_usuario) {
                            localStorage.setItem("userId", String(usuarioFinal.id_usuario));
                        }
                    }
                } catch {
                    // si /me falla, igual seguimos con el token guardado
                }
            }

            setUsuario?.(usuarioFinal || null);
            navigate("/dashboard", { replace: true }); // Redirigir al dashboard

        } catch (err) {
            const status = err?.response?.status;
            const msg = err?.response?.data?.mensaje;
            if (status === 401) setErrorMensaje(msg ?? "Contraseña incorrecta");
            else if (status === 404) setErrorMensaje(msg ?? "Usuario no encontrado");
            else setErrorMensaje("Error al conectar con el servidor. Intente nuevamente.");
            setError(true);
        }
    };

    return (
        <div className="login-container">
            {/* ... Tu JSX de Login se mantiene igual ... */}
            <div className="login-box">
                <h1 className="login-title" style={{ fontWeight: "bold", fontSize: "2rem" }}>
                    Inicio de Sesión
                </h1>

                {/* Botón Google arriba como opción rápida */}
                <GoogleButton label="Continuar con Google" />

                {/* separador */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "1rem 0" }}>
                    <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
                    <span style={{ color: "#6b7280", fontSize: 13, fontWeight: 600 }}>o</span>
                    <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
                </div>

                {/* Form tradicional */}
                <form onSubmit={validar} className="login-form">
                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                        name="correo"
                        className="login-input"
                        autoComplete="username"
                    />

                    <div className="password-wrapper">
                        <input
                            type={showPwd ? "text" : "password"}
                            placeholder="Contraseña"
                            value={contrasena}
                            onChange={(e) => setContrasena(e.target.value)}
                            name="contrasena"
                            className="login-input login-input-password"
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            className="toggle-visibility"
                            aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
                            onClick={() => setShowPwd((v) => !v)}
                            title={showPwd ? "Ocultar" : "Mostrar"}
                        >
                            {showPwd ? "🙈" : "👁️"}
                        </button>
                    </div>

                    <div className="button-group">
                        <button type="submit" className="login-button" style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                            Iniciar Sesión
                        </button>
                        <Link to="/" className="back-button as-link" style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                            Volver
                        </Link>
                    </div>
                </form>

                <Link to="/forgot" className="forgot-link">
                    ¿Olvidaste tu contraseña?
                </Link>

                {/* CTA de registro */}
                <div style={{ marginTop: "1rem", textAlign: "center", fontSize: 14 }}>
                    <span>¿Eres nuevo?</span>{" "}
                    <Link to="/register" className="forgot-link" style={{ fontWeight: 700 }}>
                        Crea tu cuenta
                    </Link>
                </div>

                {error && <p className="login-error">{errorMensaje}</p>}
            </div>
        </div>
    );
}