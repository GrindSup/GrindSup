import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../config/axios.config";
import GoogleButton from "./GoogleButton";
import "./Login.css";

export default function Login({ setUsuario, usuario }) {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState("");
  const navigate = useNavigate();

  // 🚀 Si ya hay sesión, redirigir
  useEffect(() => {
    if (usuario) navigate("/dashboard", { replace: true });
  }, [usuario, navigate]);

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
      // 1) Login credenciales
      const res = await api.post("/api/usuarios/login", {
        correo: correoLimpio,
        contrasena,
      });

      const data = res?.data || {};

      // 2) Resolver token
      let token =
        data.token ||
        data.jwt ||
        data.access_token ||
        data.accessToken ||
        data.tokenJwt ||
        data?.data?.token ||
        null;

      if (!token) {
        const authHeader =
          res.headers?.authorization || res.headers?.Authorization || "";
        if (/^Bearer\s+/i.test(authHeader)) {
          token = authHeader.replace(/^Bearer\s+/i, "");
        }
      }

      if (!data?.exito && !token) {
        setError(true);
        setErrorMensaje(data?.mensaje ?? "Credenciales inválidas");
        return;
      }

      // 3) Guardar token e inyectar en axios
      localStorage.setItem("gs_token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // 4) Guardar idSesion si viene
      if (data.idSesion) {
        localStorage.setItem("sesionId", data.idSesion);
      }

      // 5) SIEMPRE traer usuario completo desde /me
      let usuarioFinal = null;
      try {
        const me = await api.get("/api/usuarios/me");
        usuarioFinal = me.data?.usuario ?? me.data ?? null;
      } catch (e) {
        console.error("Error llamando a /me", e);
      }

      // Fallback por las dudas
      if (!usuarioFinal && data.usuario) {
        usuarioFinal = data.usuario;
      }

      if (usuarioFinal) {
        localStorage.setItem("usuario", JSON.stringify(usuarioFinal));

        const finalUserId =
          usuarioFinal.id_usuario ??
          usuarioFinal.id ??
          data.usuario?.id_usuario ??
          null;

        if (finalUserId != null) {
          const idString = String(finalUserId);
          localStorage.setItem("gs_user_id", idString);
          localStorage.setItem("userId", idString);
        }
      }

      // 6) Actualizar estado global
      setUsuario?.(usuarioFinal || null);

      // 7) Ir al dashboard (App decide si admin o entrenador)
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.mensaje;

      if (status === 401)
        setErrorMensaje(msg ?? "Contraseña incorrecta");
      else if (status === 404)
        setErrorMensaje(msg ?? "Usuario no encontrado");
      else
        setErrorMensaje(
          "Error al conectar con el servidor. Intente nuevamente."
        );

      setError(true);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1
          className="login-title"
          style={{ fontWeight: "bold", fontSize: "2rem" }}
        >
          Inicio de Sesión
        </h1>

        <GoogleButton label="Continuar con Google" />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            margin: "1rem 0",
          }}
        >
          <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
          <span
            style={{ color: "#6b7280", fontSize: 13, fontWeight: 600 }}
          >
            o
          </span>
          <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
        </div>

        <form onSubmit={validar} className="login-form">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            className="login-input"
            autoComplete="username"
          />

          <div className="password-wrapper">
            <input
              type={showPwd ? "text" : "password"}
              placeholder="Contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              className="login-input login-input-password"
              autoComplete="current-password"
            />
            <button
              type="button"
              className="toggle-visibility"
              onClick={() => setShowPwd((v) => !v)}
            >
              {showPwd ? "🙈" : "👁️"}
            </button>
          </div>

          <div className="button-group">
            <button type="submit" className="login-button">
              Iniciar Sesión
            </button>
            <Link to="/" className="back-button as-link">
              Volver
            </Link>
          </div>
        </form>

        <Link to="/forgot" className="forgot-link">
          ¿Olvidaste tu contraseña?
        </Link>

        <div style={{ marginTop: "1rem", textAlign: "center", fontSize: 14 }}>
          <span>¿Eres nuevo?</span>{" "}
          <Link
            to="/register"
            className="forgot-link"
            style={{ fontWeight: 700 }}
          >
            Crea tu cuenta
          </Link>
        </div>

        {error && <p className="login-error">{errorMensaje}</p>}
      </div>
    </div>
  );
}
