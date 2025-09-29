import { useState, useEffect } from "react";
import {
  crearTurno,
  listarAlumnos,
  listarTiposTurno,
} from "../../services/turnos.servicio";

export function RegistrarTurno() {
  const [alumno, setAlumno] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [tipo, setTipo] = useState("");
  const [cupo, setCupo] = useState(1);

  const [alumnos, setAlumnos] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [alRes, ttRes] = await Promise.all([
          listarAlumnos(),
          listarTiposTurno(),
        ]);
        setAlumnos(alRes.data || []);
        setTipos(ttRes.data || []);
      } catch (e) {
        console.error("Error inicial cargando combos:", e);
        setError("No se pudieron cargar alumnos/tipos de turno");
      }
    })();
  }, []);

  useEffect(() => {
    const sel = tipos.find((t) => t.id_tipoturno === Number(tipo));
    if (sel && sel.nombre?.toLowerCase() === "individual") setCupo(1);
  }, [tipo, tipos]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("SUBMIT presionado"); // <-- Debe verse SI o SI

    setError("");
    setMsg("");

    // Validaciones mínimas (si falla, no llamamos al backend)
    if (!alumno) { setError("Seleccioná un alumno"); return; }
    if (!tipo)   { setError("Seleccioná el tipo de turno"); return; }
    if (!fecha)  { setError("Seleccioná una fecha"); return; }
    if (!hora)   { setError("Seleccioná una hora"); return; }

    const fechaHora = new Date(`${fecha}T${hora}:00`);
    if (!(fechaHora instanceof Date) || isNaN(fechaHora.getTime())) {
      setError("Fecha/hora inválida");
      return;
    }
    if (fechaHora < new Date()) {
      setError("No se permiten turnos en fechas anteriores");
      return;
    }

    // Armo payload
    const payload = {
      fecha: fechaHora.toISOString(),
      alumno: { id_alumno: Number(alumno) },
      entrenador: { id_entrenador: 1 }, // pruebas
      tipoTurno: { id_tipoturno: Number(tipo) },
      estado: { id_estado: 1 },
      cupo: Number(cupo),
    };
    console.log("Payload a enviar:", payload); // <-- Debe verse

    try {
      setLoading(true);
      const res = await crearTurno(payload); // <-- Debe aparecer en Network
      console.log("Respuesta backend:", res.status, res.data);
      setMsg("Turno registrado con éxito ✅");
    } catch (err) {
      console.error("Error al registrar turno:", err);
      setError("Error al registrar turno ❌ (mirá la consola del backend)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="turno-container">
      <div className="turno-box">
        <h1>GrindSup</h1>
        <h2>Registrar Turno</h2>

        <form className="turno-form" onSubmit={handleSubmit}>
          <label>Alumno</label>
          <select
            value={alumno}
            onChange={(e) => setAlumno(e.target.value)}
            required
          >
            <option value="">Seleccione un alumno</option>
            {alumnos.map((a) => (
              <option key={a.id_alumno} value={a.id_alumno}>
                {a.nombre} {a.apellido}
              </option>
            ))}
          </select>

          <label>Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
          />

          <label>Hora</label>
          <input
            type="time"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            required
          />

          <label>Tipo de turno</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(Number(e.target.value))}
            required
          >
            <option value="">Seleccione tipo</option>
            {tipos.map((t) => (
              <option key={t.id_tipoturno} value={t.id_tipoturno}>
                {t.nombre}
              </option>
            ))}
          </select>

          {tipo &&
            tipos.find((t) => t.id_tipoturno === Number(tipo))?.nombre?.toLowerCase() ===
              "grupal" && (
              <>
                <label>Cupo</label>
                <input
                  type="number"
                  min="2"
                  value={cupo}
                  onChange={(e) => setCupo(e.target.value)}
                  required
                />
              </>
            )}

          {error && <p className="error">{error}</p>}
          {msg && <p className="success">{msg}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Guardando..." : "Guardar turno"}
          </button>
        </form>
      </div>
    </div>
  );
}
