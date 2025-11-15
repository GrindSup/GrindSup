// frontend/src/pages/Usuarios/Register.jsx - Versión Mejorada

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../config/axios.config";
import GoogleButton from "../../components/GoogleButton";

// Expresión regular simple para validar formato de correo
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6; // Longitud mínima recomendada

export default function Register() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [cargando, setCargando] = useState(false); // Para deshabilitar el botón
  const navigate = useNavigate();

  const enviar = async (e) => {
    e.preventDefault();
    setError("");
    setOk("");
    setCargando(true);

    // --- 1. VALIDACIONES LOCALES (Frontend) ---
    if (!nombre || !apellido || !correo || !contrasena || !confirmar) {
      setError("❌ ¡Error! Completá todos los campos.");
      setCargando(false);
      return;
    }

    if (!EMAIL_REGEX.test(correo)) {
      setError("❌ ¡Error! El formato del correo electrónico no es válido.");
      setCargando(false);
      return;
    }

    if (contrasena.length < MIN_PASSWORD_LENGTH) {
      setError(`❌ ¡Error! La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      setCargando(false);
      return;
    }

    if (contrasena !== confirmar) {
      setError("❌ ¡Error! Las contraseñas no coinciden.");
      setCargando(false);
      return;
    }
    // --- FIN VALIDACIONES LOCALES ---


    try {
      const { data } = await api.post("/api/usuarios", {
        nombre,
        apellido,
        correo,
        contrasena,
      });

      if (data?.id_usuario || data?.correo) {
        setOk("✅ ¡Éxito! Cuenta creada. Ahora podés iniciar sesión.");
        setTimeout(() => navigate("/login"), 900);
      } else {
        // En caso de que el backend devuelva un 200 pero sin datos esperados
        setError("❌ No se pudo crear la cuenta. Inténtalo más tarde.");
      }
    } catch (err) {
      const responseMsg = err?.response?.data?.mensaje || err?.response?.data?.message || "";

      // 2. MANEJO DE ERRORES DEL BACKEND (Ej: Correo duplicado)
      if (responseMsg.toLowerCase().includes('duplicate') || responseMsg.toLowerCase().includes('unique constraint')) {
        // Asumiendo que tu backend devuelve un error 400/409/500 con un mensaje específico
        setError("❌ ¡Error! El correo electrónico ya está registrado.");
      } else if (responseMsg) {
        // Otros errores del backend con mensaje claro
        setError(`❌ Error del servidor: ${responseMsg}`);
      } else {
        // Error genérico (ej: el servidor no responde o 500 desconocido)
        setError("❌ Error al crear la cuenta. Por favor, verifica tu conexión.");
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title" style={{ fontWeight: "bold", fontSize: "2rem" }}>
          Crear cuenta
        </h1>

        {/* Opción 1: Google */}
        <GoogleButton label="Registrarte con Google" />

        {/* separador */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "1rem 0" }}>
          <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
          <span style={{ color: "#6b7280", fontSize: 13, fontWeight: 600 }}>o completa el formulario</span>
          <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
        </div>

        {/* Opción 2: Formulario */}
        <form onSubmit={enviar} className="login-form">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <input
              type="text"
              placeholder="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="login-input"
              disabled={cargando}
            />
            <input
              type="text"
              placeholder="Apellido"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              className="login-input"
              disabled={cargando}
            />
          </div>

          <input
            type="email"
            placeholder="Correo electrónico"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            className="login-input"
            autoComplete="username"
            disabled={cargando}
          />

          <input
            type="password"
            placeholder={`Contraseña (mín. ${MIN_PASSWORD_LENGTH} caracteres)`}
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            className="login-input"
            autoComplete="new-password"
            disabled={cargando}
          />

          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            className="login-input"
            autoComplete="new-password"
            disabled={cargando}
          />

          <div className="button-group">
            <button
              type="submit"
              className="login-button"
              style={{ fontWeight: "bold", fontSize: "1.1rem" }}
              disabled={cargando} // Deshabilita el botón mientras carga
            >
              {cargando ? 'Registrando...' : 'Crear cuenta'}
            </button>
            <Link to="/login" className="back-button as-link" style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
              Ya tengo cuenta
            </Link>
          </div>
        </form>

        {error && <p className="login-error">{error}</p>}
        {ok && <p style={{ color: "#0a7f22", marginTop: 10 }}>{ok}</p>}
      </div>
    </div>
  );
}