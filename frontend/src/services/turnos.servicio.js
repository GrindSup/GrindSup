// src/services/turnos.servicio.js
import axios from "axios";

/** Base URL (env o fallback local) */
const API = import.meta?.env?.VITE_API_BASE_URL || "http://localhost:8080/api";

/** Utils */
const ok = (r) => r && (r.status >= 200 && r.status < 300);
const toIsoWithOffset = (d) => {
  // A veces el backend espera +00:00 en vez de Z
  const iso = new Date(d).toISOString();          // 2025-10-10T15:00:00.000Z
  return iso.replace(/\.000Z$/, "+00:00");        // 2025-10-10T15:00:00+00:00
};

/* =================================================================================
 * LECTURA / LISTADO
 * ================================================================================= */

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
    } catch (_) { /* fallback */ }
    params.entrenadorId = entrenadorId; // para la ruta 2
  }

  // Ruta 2: listado general con query
  try {
    const r2 = await axios.get(`${API}/turnos`, { params });
    return r2;
  } catch (e) {
    // Último recurso: devolver array vacío
    return { data: [] };
  }
}

/** Obtiene un turno por id (GET /turnos/{id}). Fallback: /turnos?id= */
export async function obtenerTurno(id) {
  try {
    return await axios.get(`${API}/turnos/${id}`);
  } catch (_) {
    const r = await axios.get(`${API}/turnos`, { params: { id } });
    if (Array.isArray(r.data)) {
      const found = r.data.find((t) => String(t.id_turno ?? t.id) === String(id));
      return { data: found ?? null };
    }
    return r;
  }
}

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
    } catch (_) { /* fallback */ }

    try {
      const r2 = await axios.get(`${API}/entrenadores/${entrenadorId}/alumnos`);
      return r2;
    } catch (e) {
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

/* =================================================================================
 * CREACIÓN / ACTUALIZACIÓN
 * ================================================================================= */

/**
 * Crea un turno. Enviá todo JUNTOS (incluyendo alumnosIds) para evitar 400.
 * payload esperado:
 * {
 *   entrenadorId: number,
 *   tipoTurnoId: number,
 *   fecha: ISO string (Z o +00:00),
 *   estadoId?: number,
 *   alumnosIds?: number[]
 * }
 */
export async function crearTurno(payload) {
  // normalizamos fecha a formato amigable para OffsetDateTime
  const fecha = payload?.fecha ? toIsoWithOffset(payload.fecha) : undefined;
  const body = { ...payload, ...(fecha ? { fecha } : {}) };

  // Ruta principal
  try {
    return await axios.post(`${API}/turnos`, body);
  } catch (e) {
    // Fallbacks comunes:
    // 1) algunos backends esperan otra clave para alumnos
    if (body.alumnosIds && !body.alumnos) {
      try {
        const alt = { ...body, alumnos: body.alumnosIds };
        return await axios.post(`${API}/turnos`, alt);
      } catch (_) { /* sigue */ }
    }
    // 2) algunos requieren primero crear y luego asignar (lo resolvemos desde UI)
    throw e;
  }
}

/**
 * Actualiza solo la fecha/hora de un turno.
 * Ruta principal: PUT /turnos/{id}/fecha {fecha}
 * Fallback: PUT /turnos/{id} {fecha}
 */
export async function actualizarFechaTurno(id, isoDateTime) {
  const fecha = toIsoWithOffset(isoDateTime);
  try {
    return await axios.put(`${API}/turnos/${id}/fecha`, { fecha });
  } catch (_) {
    // Fallback más permisivo
    return await axios.put(`${API}/turnos/${id}`, { fecha });
  }
}

/* =================================================================================
 * RELACIÓN ALUMNOS - TURNOS
 * ================================================================================= */

/**
 * Asigna alumnos a un turno (agrega, no reemplaza).
 * Ruta principal: POST /turnos/{turnoId}/alumnos  [ids...]
 * Fallbacks con distintos shapes.
 */
export async function asignarAlumnos(turnoId, ids) {
  // shape 1: array crudo
  try {
    return await axios.post(`${API}/turnos/${turnoId}/alumnos`, ids);
  } catch (_) {
    // shape 2: { alumnosIds: [...] }
    try {
      return await axios.post(`${API}/turnos/${turnoId}/alumnos`, { alumnosIds: ids });
    } catch (_) {
      // shape 3: query string
      const params = { ids: ids.join(",") };
      try {
        return await axios.post(`${API}/turnos/${turnoId}/alumnos`, null, { params });
      } catch (e) {
        throw e;
      }
    }
  }
}

/**
 * Quita un alumno de un turno.
 * Ruta principal: DELETE /turnos/{turnoId}/alumnos/{alumnoId}
 * Fallbacks: POST /turnos/{turnoId}/alumnos/{alumnoId}/delete, DELETE /turnos/alumno?turnoId=&alumnoId=
 */
export async function quitarAlumnoDeTurno(turnoId, alumnoId) {
  try {
    return await axios.delete(`${API}/turnos/${turnoId}/alumnos/${alumnoId}`);
  } catch (_) {
    try {
      return await axios.post(`${API}/turnos/${turnoId}/alumnos/${alumnoId}/delete`);
    } catch (_) {
      return await axios.delete(`${API}/turnos/alumno`, {
        params: { turnoId, alumnoId },
      });
    }
  }
}

/* =================================================================================
 * EXPORT POR DEFECTO (opcional)
 * ================================================================================= */
const turnosService = {
  listarTurnos,
  obtenerTurno,
  listarTiposTurno,
  listarAlumnos,
  crearTurno,
  actualizarFechaTurno,
  asignarAlumnos,
  quitarAlumnoDeTurno,
};

export default turnosService;
