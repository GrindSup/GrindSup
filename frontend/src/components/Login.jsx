// frontend/src/components/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../config/axios.config";
import GoogleButton from "./GoogleButton";
import "./Login.css";

export default function Login({ setUsuario }) {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState("");
  const navigate = useNavigate();

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
      const { data } = await api.post("/api/usuarios/login", {
        correo: correoLimpio,
        contrasena,
      });
      console.log("Respuesta del login:", data);
      if (data?.exito) {
        localStorage.setItem("usuario", JSON.stringify(data.usuario));
        localStorage.setItem("sesionId", data.idSesion);
        localStorage.setItem("gs_token", data.token);
        setUsuario?.(data.usuario);
        navigate("/");
      } else {
        setError(true);
        setErrorMensaje(data?.mensaje ?? "Credenciales inválidas");
      }
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
