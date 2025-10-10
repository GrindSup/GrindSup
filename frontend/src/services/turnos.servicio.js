// src/services/turnos.servicio.js
import axios from "axios";

// Normalizo la base para evitar dobles barras si viene con '/' al final
const RAW_API = import.meta?.env?.VITE_API_BASE_URL || "http://localhost:8080/api";
const API = RAW_API.replace(/\/+$/, "");

// Podés usar esta instancia si querés interceptores luego
const http = axios.create({ baseURL: API });

/** --- Catálogos --- */
export const listarAlumnos = () => http.get("/alumnos");
export const listarTiposTurno = () => http.get("/tipos-turno");

/** --- Turnos --- */

// Crea el turno SIN alumnos (DTO TurnoRequestDTO: entrenadorId, tipoTurnoId, fecha(ISO), estadoId)
export const crearTurno = (payload) => http.post("/turnos", payload);

// Asigna alumnos a un turno existente (body = [ids])
export const asignarAlumnos = (turnoId, alumnosIds = []) =>
  http.post(`/turnos/${turnoId}/alumnos`, alumnosIds);

// Opcionales / utilitarios (por si los necesitás ahora o después)
export const listarTurnos = () => http.get("/turnos");
export const obtenerTurno = (id) => http.get(`/turnos/${id}`);
export const eliminarTurno = (id) => http.delete(`/turnos/${id}`);

// Quitar un alumno puntual de un turno (usa tu endpoint nuevo)
export const quitarAlumnoDeTurno = (turnoId, alumnoId) =>
  http.delete(`/turnos/${turnoId}/alumnos/${alumnoId}`);
// ...lo que ya tenías arriba

// Actualiza solo la fecha/hora de un turno (body: { fecha: ISOString })
export const actualizarFechaTurno = (turnoId, isoFecha) =>
  http.put(`/turnos/${turnoId}/fecha`, { fecha: isoFecha });

// ...resto igual
