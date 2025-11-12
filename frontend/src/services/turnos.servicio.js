import axios from '../config/axios.config'; // (Ajusta la ruta si es necesario)

/** Base URL (env o fallback local) */
const API = import.meta?.env?.VITE_API_BASE_URL || "http://localhost:8080/api";

/** Utils */
const ok = (r) => r && r.status >= 200 && r.status < 300;
const toIsoWithOffset = (d) => {
    // A veces el backend espera +00:00 en vez de Z
    const iso = new Date(d).toISOString();       // 2025-10-10T15:00:00.000Z
    return iso.replace(/\.000Z$/, "+00:00");    // 2025-10-10T15:00:00+00:00
};

// -----------------------------------------------------
// LÓGICA DE RESOLUCIÓN DE USER ID
// -----------------------------------------------------

/** Lectura segura de localStorage */
const safeLocalStorageGet = (key) => {
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            return window.localStorage.getItem(key);
        }
    } catch (err) {
        console.warn('No se pudo leer de localStorage:', err);
    }
    return null;
};

/** Resuelve el ID del usuario priorizando: optUserId, gs_user_id, userId (localStorage) */
const resolveUserId = (optUserId) => {
    const candidates = [
        optUserId,
        safeLocalStorageGet("gs_user_id"),
        safeLocalStorageGet("userId"),
        // Intenta obtener el ID del objeto 'usuario' si está guardado
        safeLocalStorageGet("usuario") ? JSON.parse(safeLocalStorageGet("usuario")).id_usuario : null 
    ];

    const raw = candidates.find((value) => value != null && String(value).trim() !== '' && String(value).toLowerCase() !== 'undefined');
    
    // Solo devuelve si es un valor numérico (asumiendo que el ID de usuario es un número o string numérico)
    if (raw && /^\d+$/.test(String(raw).trim())) {
        return String(raw).trim();
    }
    return null;
};

/**
 * Retorna los headers y el userId resuelto.
 * Headers se usa para 'X-User-Id' (backend lo espera)
 * userId se usa para el query param (legacy/compatibilidad)
 */
const getAuthHeaders = (optUserId) => {
    const userId = resolveUserId(optUserId);
    const headers = {};
    if (userId) {
        headers['X-User-Id'] = userId;
    }
    return { headers, userId }; // Retorna ambos para flexibilidad
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
 * CREACIÓN / ACTUALIZACIÓN (CON X-User-Id)
 * ============================================================================= */

/**
 * Crea un turno. 
 * payload: { entrenadorId, tipoTurnoId, fecha, ... }
 */
export async function crearTurno(payload, opts = {}) {
    const fecha = payload?.fecha ? toIsoWithOffset(payload.fecha) : undefined;
    const body = { ...payload, ...(fecha ? { fecha } : {}) };

    const { headers, userId } = getAuthHeaders(opts.userId); 
    const queryParams = userId ? { userId } : {};

    try {
        // Enviar body, HEADERS (X-User-Id) y QUERY PARAM (userId)
        return await axios.post(`${API}/turnos`, body, { headers, params: queryParams });
        
    } catch (e) {
        // Fallback 1: algunos backends esperan 'alumnos' en lugar de 'alumnosIds'
        if (body.alumnosIds && !body.alumnos) {
            const alt = { ...body, alumnos: body.alumnosIds };
            return await axios.post(`${API}/turnos`, alt, { headers, params: queryParams });
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
    const { headers, userId } = getAuthHeaders(opts.userId);
    const params = userId ? { userId } : {};

    try {
        // Intenta endpoint específico
        return await axios.put(`${API}/turnos/${id}/fecha`, { fecha }, {
            headers,
            params,
        });
    } catch {
        // Fallback a PUT completo
        return await axios.put(`${API}/turnos/${id}`, { fecha }, {
            headers,
            params,
        });
    }
}

/* =============================================================================
 * RELACIÓN ALUMNOS - TURNOS (CON X-User-Id)
 * ============================================================================= */

export async function asignarAlumnos(turnoId, ids, opts = {}) {
    if (!turnoId) throw new Error("turnoId requerido");
    const clean = (ids || []).map(Number).filter(Boolean);
    if (!clean.length) throw new Error("alumnosIds vacío");

    const { headers, userId } = getAuthHeaders(opts.userId);
    const queryParams = userId ? { userId } : {};

    // 🛑 IMPORTANTE: El backend espera un List<Long>, por lo que enviamos el array limpio (clean)
    // o un objeto envoltorio si eso falla.

    try {
        // Forma 1 (preferida por Spring): Array JSON plano [31, 32]
        return await axios.post(`${API}/turnos/${turnoId}/alumnos`, clean, {
            headers,
            params: queryParams,
        });
    } catch (e) {
        // Si el array plano falla (por compatibilidad con backends antiguos), probamos con objeto envoltorio
        const bodyWithWrapper = { alumnosIds: clean };
        try {
            // Forma 2: Objeto envoltorio { alumnosIds: [31, 32] }
            return await axios.post(`${API}/turnos/${turnoId}/alumnos`, bodyWithWrapper, {
                headers,
                params: queryParams,
            });
        } catch {
            // Forma 3: query string (fallback extremo)
            const params = { ids: clean.join(",") };
            return await axios.post(`${API}/turnos/${turnoId}/alumnos`, null, {
                params: { ...params, ...queryParams },
                headers,
            });
        }
    }
}

/**
 * Quita un alumno de un turno.
 */
export async function quitarAlumnoDeTurno(turnoId, alumnoId, opts = {}) {
    if (!turnoId || !alumnoId) throw new Error("turnoId y alumnoId requeridos");
    const { headers, userId } = getAuthHeaders(opts.userId);
    const queryParams = userId ? { userId } : {};

    try {
        // Endpoint DELETE principal
        return await axios.delete(`${API}/turnos/${turnoId}/alumnos/${alumnoId}`, {
            headers,
            params: queryParams,
        });
    } catch {
        // Fallbacks (ajustados para incluir headers y params)
        try {
            // Fallback 1: POST con /delete
            return await axios.post(`${API}/turnos/${turnoId}/alumnos/${alumnoId}/delete`, null, {
                headers,
                params: queryParams,
            });
        } catch {
            // Fallback 2: DELETE genérico con query params
            const params = { turnoId, alumnoId };
            return await axios.delete(`${API}/turnos/alumno`, {
                params: { ...params, ...queryParams },
                headers,
            });
        }
    }
}

/** Eliminar turno */
export function eliminarTurno(id, opts = {}) {
    if (!id) throw new Error("turnoId requerido");
    const { headers, userId } = getAuthHeaders(opts.userId);
    const params = userId ? { userId } : {};
    
    return axios.delete(`${API}/turnos/${id}`, {
        headers,
        params,
    });
}

/* =============================================================================
 * EXPORT POR DEFECTO
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