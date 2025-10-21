import axios from "axios";
const API = import.meta.env?.VITE_API_BASE_URL || "http://localhost:8080/api";

export const listarRutinasPorPlan = (idPlan) =>
  axios.get(`${API}/planes/${idPlan}/rutinas`);

export const crearRutina = (idPlan, payload) =>
  axios.post(`${API}/planes/${idPlan}/rutinas`, payload);

export const obtenerDetalleRutina = (idPlan, idRutina) =>
  axios.get(`${API}/planes/${idPlan}/rutinas/${idRutina}/detalle`);
