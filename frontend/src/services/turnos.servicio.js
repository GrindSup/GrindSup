import axios from "axios";

// Base URL (env o fallback local)
const API = import.meta?.env?.VITE_API_BASE_URL || "http://localhost:8080/api";

/**
import axios from "axios";
const API = import.meta?.env?.VITE_API_BASE_URL || "http://localhost:8080/api";

// ----------------------------------------------------------------------------------
// FUNCIONES NECESARIAS PARA DetalleTurno.jsx (NUEVAS)
// ----------------------------------------------------------------------------------

/**
 * Obtiene un turno específico por ID.
 * Corresponde a GET /api/turnos/{id}
 */
export function obtenerTurno(id) {
    return axios.get(`${API}/turnos/${id}`);
}

/**
 * Actualiza la fecha y hora de un turno.
 * Corresponde a PUT /api/turnos/{id}/fecha
 * @param {string} isoDateTime La nueva fecha en formato ISO (ej: "2025-10-10T15:00:00+00:00")
 */
export function actualizarFechaTurno(id, isoDateTime) {
    // El backend espera un objeto JSON con la propiedad 'fecha'
    return axios.put(`${API}/turnos/${id}/fecha`, { fecha: isoDateTime });
}

/**
 * Quita un alumno de un turno.
 * Corresponde a DELETE /api/turnos/{turnoId}/alumnos/{alumnoId}
 */
export function quitarAlumnoDeTurno(turnoId, alumnoId) {
    return axios.delete(`${API}/turnos/${turnoId}/alumnos/${alumnoId}`);
}

// ----------------------------------------------------------------------------------
// FUNCIONES YA EXISTENTES (CON CORRECCIÓN EN listarTurnos)
// ----------------------------------------------------------------------------------

/**
 * Lista los turnos filtrados por entrenador, fecha y tipo.
 * ✅ CORRECCIÓN: Usa el endpoint /turnos/entrenador/{id} para aplicar el filtro en el backend.
 */
export function listarTurnos(entrenadorId, { desde, hasta, tipo } = {}) {
    if (entrenadorId == null) {
        return Promise.resolve({ data: [] });
    }

    const params = {};
    if (desde) params.desde = desde;
    if (hasta) params.hasta = hasta;
    if (tipo)  params.tipo  = tipo;

    // Llama a /api/turnos/entrenador/{id}
    return axios.get(`${API}/turnos/entrenador/${entrenadorId}`, { params });
}

export function crearTurno(payload) {
    return axios.post(`${API}/turnos`, payload);
}

export function asignarAlumnos(turnoId, ids) {
    return axios.post(`${API}/turnos/${turnoId}/alumnos`, ids);
}

export function listarTiposTurno() {
    return axios.get(`${API}/tipos-turno`);
}

/**
 * Lista alumnos, enviando el ID del entrenador como parámetro de consulta.
 */
export function listarAlumnos(entrenadorId) {
    const params = {};
    if (entrenadorId != null) {
        params.entrenadorId = entrenadorId;
        params.entrenador   = entrenadorId;
    }
    return axios.get(`${API}/alumnos`, { params });
}