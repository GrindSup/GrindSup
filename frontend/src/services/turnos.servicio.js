// src/services/turnos.servicio.js
import axios from '../config/axios.config'; 

/** Base URL (env o fallback local) */
const API = import.meta?.env?.VITE_API_BASE_URL || "http://localhost:8080/api";

/** Utils */
const ok = (r) => r && r.status >= 200 && r.status < 300;
const toIsoWithOffset = (d) => {
    const iso = new Date(d).toISOString();       // 2025-10-10T15:00:00.000Z
    return iso.replace(/\.000Z$/, "+00:00");     // 2025-10-10T15:00:00+00:00
};

/* ============================================================
   LOCALSTORAGE SEGURO
============================================================ */
const safeLocalStorageGet = (key) => {
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            return window.localStorage.getItem(key);
        }
    } catch (err) {
        console.warn("No se pudo leer localStorage:", err);
    }
    return null;
};

/* ============================================================
   RESOLVER USER ID (LO QUE PIDE EL PATCH)
   PRIORIDAD:
   1) optUserId
   2) gs_user_id
   3) userId
   4) usuario.id_usuario (JSON)
============================================================ */
const resolveUserId = (optUserId) => {
    let storedUserObj = null;
    const usuarioStr = safeLocalStorageGet("usuario");

    if (usuarioStr) {
        try { storedUserObj = JSON.parse(usuarioStr); } catch {}
    }

    const candidates = [
        optUserId,
        safeLocalStorageGet("gs_user_id"),
        safeLocalStorageGet("userId"),
        storedUserObj?.id_usuario,
    ];

    const raw = candidates.find(
        val => val != null && String(val).trim() !== "" && String(val) !== "undefined"
    );

    return raw ? String(raw) : null;
};

/* ============================================================
   HEADERS + PARAMS (X-User-Id + userId)
============================================================ */
const getAuthHeaders = (optUserId) => {
    const resolved = resolveUserId(optUserId);
    const userId = resolved || "primary";

    return {
        headers: { "X-User-Id": userId },
        userId
    };
};

/* ============================================================
   LISTAR TURNOS
============================================================ */
export async function listarTurnos(entrenadorId, { desde, hasta, tipo } = {}) {
    const params = {};
    if (desde) params.desde = desde;
    if (hasta) params.hasta = hasta;
    if (tipo)  params.tipo  = tipo;

    if (entrenadorId != null) {
        try {
            const r1 = await axios.get(`${API}/turnos/entrenador/${entrenadorId}`, { params });
            if (ok(r1)) return r1;
        } catch {}
        params.entrenadorId = entrenadorId;
    }

    try {
        return await axios.get(`${API}/turnos`, { params });
    } catch {
        return { data: [] };
    }
}

/* ============================================================
   OBTENER TURNO
============================================================ */
export async function obtenerTurno(id) {
    if (!id) return { data: null };

    try {
        return await axios.get(`${API}/turnos/${id}`);
    } catch {
        const r = await axios.get(`${API}/turnos`, { params: { id } });
        if (Array.isArray(r.data)) {
            const found = r.data.find(x => String(x.id_turno ?? x.id) === String(id));
            return { data: found ?? null };
        }
        return r;
    }
}

/* ============================================================
   ALUMNOS DE TURNO
============================================================ */
export async function alumnosDeTurno(id) {
    if (!id) return { data: [] };
    return axios.get(`${API}/turnos/${id}/alumnos`);
}

export const obtenerAlumnosTurno = alumnosDeTurno;

/* ============================================================
   TIPOS DE TURNO
============================================================ */
export function listarTiposTurno() {
    return axios.get(`${API}/tipos-turno`);
}

/* ============================================================
   LISTAR ALUMNOS
============================================================ */
export async function listarAlumnos(entrenadorId) {
    if (entrenadorId != null) {
        try {
            const r1 = await axios.get(`${API}/alumnos`, {
                params: { entrenadorId, entrenador: entrenadorId }
            });
            if (ok(r1)) return r1;
        } catch {}

        try {
            return await axios.get(`${API}/entrenadores/${entrenadorId}/alumnos`);
        } catch {
            return { data: [] };
        }
    }

    try {
        return await axios.get(`${API}/alumnos`);
    } catch {
        return { data: [] };
    }
}

/* ============================================================
   CREAR TURNO  (INCLUYE PATCH COMPLETO)
============================================================ */
export async function crearTurno(payload, opts = {}) {
    const fecha = payload?.fecha ? toIsoWithOffset(payload.fecha) : undefined;
    const body = { ...payload, ...(fecha ? { fecha } : {}) };

    const { headers, userId } = getAuthHeaders(opts.userId);
    const params = userId ? { userId } : {};

    try {
        return await axios.post(`${API}/turnos`, body, { headers, params });

    } catch (e) {
        if (body.alumnosIds && !body.alumnos) {
            const alt = { ...body, alumnos: body.alumnosIds };
            return await axios.post(`${API}/turnos`, alt, { headers, params });
        }
        throw e;
    }
}

/* ============================================================
   ACTUALIZAR FECHA
============================================================ */
export async function actualizarFechaTurno(id, isoDateTime, opts = {}) {
    if (!id) throw new Error("turnoId requerido");

    const fecha = toIsoWithOffset(isoDateTime);
    const { headers, userId } = getAuthHeaders(opts.userId);
    const params = userId ? { userId } : {};

    try {
        return await axios.put(`${API}/turnos/${id}/fecha`, { fecha }, { headers, params });
    } catch {
        return await axios.put(`${API}/turnos/${id}`, { fecha }, { headers, params });
    }
}

/* ============================================================
   ASIGNAR ALUMNOS (PATCH + FALLBACKS)
============================================================ */
export async function asignarAlumnos(turnoId, ids, opts = {}) {
    if (!turnoId) throw new Error("turnoId requerido");
    const clean = (ids || []).map(Number).filter(Boolean);
    if (!clean.length) throw new Error("alumnosIds vacío");

    const { headers, userId } = getAuthHeaders(opts.userId);
    const params = userId ? { userId } : {};

    try {
        return await axios.post(`${API}/turnos/${turnoId}/alumnos`, clean, { headers, params });
    } catch {
        const alt = { alumnosIds: clean };
        try {
            return await axios.post(`${API}/turnos/${turnoId}/alumnos`, alt, { headers, params });
        } catch {
            return await axios.post(`${API}/turnos/${turnoId}/alumnos`, null, {
                params: { ids: clean.join(","), ...params },
                headers
            });
        }
    }
}

/* ============================================================
   QUITAR ALUMNO
============================================================ */
export async function quitarAlumnoDeTurno(turnoId, alumnoId, opts = {}) {
    if (!turnoId || !alumnoId) throw new Error("turnoId y alumnoId requeridos");

    const { headers, userId } = getAuthHeaders(opts.userId);
    const params = userId ? { userId } : {};

    try {
        return await axios.delete(`${API}/turnos/${turnoId}/alumnos/${alumnoId}`, { headers, params });
    } catch {
        try {
            return await axios.post(`${API}/turnos/${turnoId}/alumnos/${alumnoId}/delete`, null, { headers, params });
        } catch {
            const fallback = { turnoId, alumnoId };
            return await axios.delete(`${API}/turnos/alumno`, {
                params: { ...fallback, ...params },
                headers
            });
        }
    }
}

/* ============================================================
   ELIMINAR TURNO
============================================================ */
export function eliminarTurno(id, opts = {}) {
    if (!id) throw new Error("turnoId requerido");

    const { headers, userId } = getAuthHeaders(opts.userId);
    const params = userId ? { userId } : {};

    return axios.delete(`${API}/turnos/${id}`, { headers, params });
}

/* ============================================================
   EXPORT
============================================================ */
const turnosService = {
    listarTurnos,
    obtenerTurno,
    alumnosDeTurno,
    obtenerAlumnosTurno,
    listarTiposTurno,
    listarAlumnos,
    crearTurno,
    actualizarFechaTurno,
    asignarAlumnos,
    quitarAlumnoDeTurno,
    eliminarTurno
};

export default turnosService;
