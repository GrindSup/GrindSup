// src/services/turnos.servicio.js
import axios from '../config/axios.config'; // (Ajusta la ruta si es necesario)

/** Base URL (env o fallback local) */
const API = import.meta?.env?.VITE_API_BASE_URL || "http://localhost:8080/api";

/** Utils */
const ok = (r) => r && r.status >= 200 && r.status < 300;
const toIsoWithOffset = (d) => {
    // A veces el backend espera +00:00 en vez de Z
    const iso = new Date(d).toISOString();      // 2025-10-10T15:00:00.000Z
    return iso.replace(/\.000Z$/, "+00:00");    // 2025-10-10T15:00:00+00:00
};

// 🎯 CORRECCIÓN CLAVE 1: Helper para obtener el ID del usuario autenticado (si no se provee)
const getAuthHeaders = (optUserId) => {
    // Fallback ID to ensure the header is always present for the backend controller
    const userId = optUserId || 
                   localStorage.getItem("gs_user_id") || 
                   localStorage.getItem("userId") || 
                   "primary"; 
    
    return {
        headers: {
            'X-User-Id': userId
        }
    };
};


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
 * Crea un turno. 
 * payload: { entrenadorId, tipoTurnoId, fecha, ... }
 */
export async function crearTurno(payload, opts = {}) {
    const fecha = payload?.fecha ? toIsoWithOffset(payload.fecha) : undefined;
    const body = { ...payload, ...(fecha ? { fecha } : {}) };

    const headers = getAuthHeaders(opts.userId); 
    
    // 🛑 IMPORTANTE: El backend espera X-User-Id como HEADER, y el controller espera un QUERY PARAM 'userId'.
    const queryParams = { userId: headers.headers['X-User-Id'] };

    try {
        // Enviar body, HEADERS (X-User-Id) y QUERY PARAM (userId)
        return await axios.post(`${API}/turnos`, body, { headers: headers.headers, params: queryParams });
        
    } catch (e) {
        // Fallback 1: algunos backends esperan 'alumnos' en lugar de 'alumnosIds'
        if (body.alumnosIds && !body.alumnos) {
            const alt = { ...body, alumnos: body.alumnosIds };
            return await axios.post(`${API}/turnos`, alt, { headers: headers.headers, params: queryParams });
        }
        throw e;
    }
}

/**
 * Actualiza solo la fecha/hora de un turno.
 */
export async function actualizarFechaTurno(id, isoDateTime, opts = {}) {
    if (!id) throw new Error("turnoId requerido");
    const fecha = toIsoWithOffset(isoDateTime);
    const headers = getAuthHeaders(opts.userId);

    try {
        return await axios.put(`${API}/turnos/${id}/fecha`, { fecha }, { headers: headers.headers });
    } catch {
        return await axios.put(`${API}/turnos/${id}`, { fecha }, { headers: headers.headers });
    }
}

/* =============================================================================
 * RELACIÓN ALUMNOS - TURNOS
 * ============================================================================= */

export async function asignarAlumnos(turnoId, ids, opts = {}) {
    if (!turnoId) throw new Error("turnoId requerido");
    const clean = (ids || []).map(Number).filter(Boolean);
    if (!clean.length) throw new Error("alumnosIds vacío");

    const headers = getAuthHeaders(opts.userId);

    // 🎯 CORRECCIÓN: Intentar el formato envuelto primero, que es más estable con Jackson/Axios
    const bodyWithWrapper = { alumnosIds: clean };
    
    try {
        // Forma 1: Envuelto en objeto { alumnosIds: [31, 32] }
        return await axios.post(`${API}/turnos/${turnoId}/alumnos`, bodyWithWrapper, { headers: headers.headers });
    } catch (e) {
        // Si el envuelto falla, probamos el array crudo [...]
        try {
            // Forma 2: Array crudo [31, 32]
            return await axios.post(`${API}/turnos/${turnoId}/alumnos`, clean, { headers: headers.headers });
        } catch {
            // Forma 3: query string (si el backend lo soporta, aunque es incorrecto para @RequestBody)
            const params = { ids: clean.join(",") };
            return await axios.post(`${API}/turnos/${turnoId}/alumnos`, null, { params, headers: headers.headers });
        }
    }
}

/**
 * Quita un alumno de un turno.
 */
export async function quitarAlumnoDeTurno(turnoId, alumnoId, opts = {}) {
    if (!turnoId || !alumnoId) throw new Error("turnoId y alumnoId requeridos");
    const headers = getAuthHeaders(opts.userId);

    try {
        return await axios.delete(`${API}/turnos/${turnoId}/alumnos/${alumnoId}`, { headers: headers.headers });
    } catch {
        // Fallbacks (ajustados para incluir headers)
        try {
            return await axios.post(`${API}/turnos/${turnoId}/alumnos/${alumnoId}/delete`, null, { headers: headers.headers });
        } catch {
            const params = { turnoId, alumnoId };
            return await axios.delete(`${API}/turnos/alumno`, { params, headers: headers.headers });
        }
    }
}

/** Eliminar turno */
export function eliminarTurno(id, opts = {}) {
    if (!id) throw new Error("turnoId requerido");
    const headers = getAuthHeaders(opts.userId);
    return axios.delete(`${API}/turnos/${id}`, { headers: headers.headers });
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