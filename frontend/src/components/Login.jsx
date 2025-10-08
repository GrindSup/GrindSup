import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login({ setUsuario, onVolverClick }) {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState("");

  const navigate = useNavigate();

  const validar = async (e) => {
    e.preventDefault();

    if (!correo.trim() || !contrasena.trim()) {
      setError(true);
      setErrorMensaje("Faltan datos por completar");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, contrasena }),
      });

      const data = await response.json();

      if (data.exito) {
        setError(false);
        localStorage.setItem("usuario", JSON.stringify(data.usuario));
        setUsuario(data.usuario);
        localStorage.setItem("sesionId", data.idSesion);
        navigate("/");
      } else {
        setError(true);
        setErrorMensaje(data.mensaje);
      }
    } catch (err) {
      setError(true);
      setErrorMensaje("Error al conectar con el servidor. Intente nuevamente.");
      console.error("Error en la petición:", err);
    }

    setCorreo("");
    setContrasena("");
  };
  
  const handleVolver = () => {
    onVolverClick();
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">Inicio de Sesión</h1>
        <form onSubmit={validar} className="login-form">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            name="correo"
            className="login-input"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            name="contrasena"
            className="login-input"
          />
          <div className="button-group">
            <button type="submit" className="login-button">Iniciar Sesión</button>
            <button type="button" className="back-button" onClick={handleVolver}>
              Volver
            </button>
          </div>
        </form>
        {error && <p className="login-error">{errorMensaje}</p>}
      </div>
    </div>
  );
}