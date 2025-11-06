// frontend/src/pages/Usuarios/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../config/axios.config";
import GoogleButton from "../../components/GoogleButton";

export default function Register() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const navigate = useNavigate();

  const enviar = async (e) => {
    e.preventDefault();
    setError("");
    setOk("");

    if (!nombre || !apellido || !correo || !contrasena) {
      setError("Completá todos los campos.");
      return;
    }
    if (contrasena !== confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      // Tu backend hashea si viene texto plano (como en tu UsuarioController.create)
      const { data } = await api.post("/api/usuarios", {
        nombre,
        apellido,
        correo,
        contrasena,
        // opcionalmente podrías setear rol/estado por defecto desde el backend
      });

      if (data?.id_usuario || data?.correo) {
        setOk("Cuenta creada. Ahora podés iniciar sesión.");
        setTimeout(() => navigate("/login"), 900);
      } else {
        setError("No se pudo crear la cuenta.");
      }
    } catch (err) {
      const msg = err?.response?.data?.mensaje || "Error al crear la cuenta.";
      setError(msg);
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
            />
            <input
              type="text"
              placeholder="Apellido"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              className="login-input"
            />
          </div>

          <input
            type="email"
            placeholder="Correo electrónico"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            className="login-input"
            autoComplete="username"
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            className="login-input"
            autoComplete="new-password"
          />

          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            className="login-input"
            autoComplete="new-password"
          />

          <div className="button-group">
            <button type="submit" className="login-button" style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
              Crear cuenta
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
