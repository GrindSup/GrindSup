// src/services/turnos.servicio.js
import axios from '../config/axios.config'; // (Ajusta la ruta si es necesario)

/** Base URL (env o fallback local) */
const API = import.meta?.env?.VITE_API_BASE_URL || "http://localhost:8080/api";

/** Utils */
const ok = (r) => r && r.status >= 200 && r.status < 300;
const toIsoWithOffset = (d) => {
  // A veces el backend espera +00:00 en vez de Z
  const iso = new Date(d).toISOString();       // 2025-10-10T15:00:00.000Z
  return iso.replace(/\.000Z$/, "+00:00");     // 2025-10-10T15:00:00+00:00
};

// helper para Calendar
// helper para Calendar
const resolveUserId = (optUserId) =>
  optUserId ?? ((typeof localStorage !== "undefined" && localStorage.getItem("userId")) || "primary");

/**
 * Lista turnos. Intenta /turnos/entrenador/{id} y cae a /turnos?entrenadorId=...
 * Params opcionales: {desde, hasta, tipo}
 */
export async function listarTurnos(entrenadorId, { desde, hasta, tipo } = {}) {
  const params = {};
  if (desde) params.desde = desde;
  if (hasta) params.hasta = hasta;
  if (tipo)  params.tipo  = tipo;

  // Ruta 1: específica por entrenador
  if (entrenadorId != null) {
    try {
      const r1 = await axios.get(`${API}/turnos/entrenador/${entrenadorId}`, { params });
      if (ok(r1)) return r1;
    } catch { /* fallback */ }
    params.entrenadorId = entrenadorId; // para la ruta 2
  }

  // Ruta 2: listado general con query
  try {
    return await axios.get(`${API}/turnos`, { params });
  } catch {
    return { data: [] };
  }
}

/** Obtiene un turno por id (GET /turnos/{id}). Fallback: /turnos?id= */
export async function obtenerTurno(id) {
  if (id == null || String(id) === "" || String(id) === "undefined") {
    return { data: null };
  }
  try {
    return await axios.get(`${API}/turnos/${id}`);
  } catch {
    const r = await axios.get(`${API}/turnos`, { params: { id } });
    if (Array.isArray(r.data)) {
      const found = r.data.find((t) => String(t.id_turno ?? t.id) === String(id));
      return { data: found ?? null };
    }
    return r;
  }
}

/** Alumnos (con id) de un turno: GET /turnos/{id}/alumnos */
export async function alumnosDeTurno(id) {
  if (id == null || String(id) === "" || String(id) === "undefined") {
    return { data: [] };
  }
  return axios.get(`${API}/turnos/${id}/alumnos`);
}
// Alias por compatibilidad con imports antiguos
export const obtenerAlumnosTurno = alumnosDeTurno;

/** Tipos de turno (GET /tipos-turno) */
export function listarTiposTurno() {
  return axios.get(`${API}/tipos-turno`);
}

/** Lista alumnos. Primero /alumnos?entrenadorId=..., fallback /entrenadores/{id}/alumnos */
export async function listarAlumnos(entrenadorId) {
  if (entrenadorId != null) {
    try {
      const r1 = await axios.get(`${API}/alumnos`, {
        params: { entrenadorId, entrenador: entrenadorId },
      });
      if (ok(r1)) return r1;
    } catch { /* fallback */ }

    try {
      return await axios.get(`${API}/entrenadores/${entrenadorId}/alumnos`);
    } catch {
      return { data: [] };
    }
  }
  // sin filtro
  try {
    return await axios.get(`${API}/alumnos`);
  } catch {
    return { data: [] };
  }
}

/* =============================================================================
 * CREACIÓN / ACTUALIZACIÓN
 * ============================================================================= */

/**
 * Crea un turno. Enviá todo JUNTOS (incluyendo alumnosIds) para evitar 400.
 * payload:
 * {
 *   entrenadorId: number,
 *   tipoTurnoId: number,
 *   fecha: ISO string (Z o +00:00),
 *   estadoId?: number,
 *   alumnosIds?: number[]
 * }
 */
export async function crearTurno(payload, opts = {}) {
  const fecha = payload?.fecha ? toIsoWithOffset(payload.fecha) : undefined;
  const body = { ...payload, ...(fecha ? { fecha } : {}) };

  const userId = resolveUserId(opts.userId);

  try {
    // IMPORTANTE: userId como query param (requerido por el backend)
    return await axios.post(`${API}/turnos`, body, { params: { userId } });
  } catch (e) {
    // Fallback 1: algunos backends esperan 'alumnos' en lugar de 'alumnosIds'
    if (body.alumnosIds && !body.alumnos) {
      const alt = { ...body, alumnos: body.alumnosIds };
      return await axios.post(`${API}/turnos`, alt, { params: { userId } });
    }
    throw e;
  }
}

/**
 * Actualiza solo la fecha/hora de un turno.
 * Ruta principal: PUT /turnos/{id}/fecha {fecha}
 * Fallback: PUT /turnos/{id} {fecha}
 */
export async function actualizarFechaTurno(id, isoDateTime) {
  if (!id) throw new Error("turnoId requerido");
  const fecha = toIsoWithOffset(isoDateTime);
  try {
    return await axios.put(`${API}/turnos/${id}/fecha`, { fecha });
  } catch {
    return await axios.put(`${API}/turnos/${id}`, { fecha });
  }
}

/* =============================================================================
 * RELACIÓN ALUMNOS - TURNOS
 * ============================================================================= */

export async function asignarAlumnos(turnoId, ids) {
  if (!turnoId) throw new Error("turnoId requerido");
  const clean = (ids || []).map(Number).filter(Boolean);
  if (!clean.length) throw new Error("alumnosIds vacío");

  // shape 1: array crudo
  try {
    return await axios.post(`${API}/turnos/${turnoId}/alumnos`, clean);
  } catch {
    // shape 2: { alumnosIds: [...] }
    try {
      return await axios.post(`${API}/turnos/${turnoId}/alumnos`, { alumnosIds: clean });
    } catch {
      // shape 3: query string
      const params = { ids: clean.join(",") };
      return await axios.post(`${API}/turnos/${turnoId}/alumnos`, null, { params });
    }
  }
}

/**
 * Quita un alumno de un turno.
 * Ruta principal: DELETE /turnos/{turnoId}/alumnos/{alumnoId}
 * Fallbacks: POST /turnos/{turnoId}/alumnos/{alumnoId}/delete, DELETE /turnos/alumno?turnoId=&alumnoId=
 */
export async function quitarAlumnoDeTurno(turnoId, alumnoId) {
  if (!turnoId || !alumnoId) throw new Error("turnoId y alumnoId requeridos");
  try {
    return await axios.delete(`${API}/turnos/${turnoId}/alumnos/${alumnoId}`);
  } catch {
    try {
      return await axios.post(`${API}/turnos/${turnoId}/alumnos/${alumnoId}/delete`);
    } catch {
      return await axios.delete(`${API}/turnos/alumno`, { params: { turnoId, alumnoId } });
    }
  }
}

/** Eliminar turno */
export function eliminarTurno(id) {
  if (!id) throw new Error("turnoId requerido");
  return axios.delete(`${API}/turnos/${id}`);
}

/* =============================================================================
 * EXPORT POR DEFECTO (opcional)
 * ============================================================================= */
const turnosService = {
  listarTurnos,
  obtenerTurno,
  alumnosDeTurno,
  obtenerAlumnosTurno, // alias
  listarTiposTurno,
  listarAlumnos,
  crearTurno,
  actualizarFechaTurno,
  asignarAlumnos,
  quitarAlumnoDeTurno,
  eliminarTurno,
};

export default turnosService;
