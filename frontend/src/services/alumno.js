// src/services/alumno.js
import axiosInstance from "../config/axios.config";

// Devuelve TODOS los alumnos (sin filtrar)
async function listAll() {
  const { data } = await axiosInstance.get("/api/alumnos");
  return Array.isArray(data) ? data : [];
}

// Devuelve alumnos del entrenador, probando endpoints comunes
async function listarPorEntrenador(entrenadorId) {
  // 1) /api/entrenadores/:id/alumnos
  try {
    const r1 = await axiosInstance.get(`/api/entrenadores/${entrenadorId}/alumnos`);
    if (Array.isArray(r1.data)) return r1.data;
  } catch {}

  // 2) /api/alumnos?entrenadorId=...
  try {
    const r2 = await axiosInstance.get(`/api/alumnos`, { params: { entrenadorId } });
    if (Array.isArray(r2.data)) return r2.data;
  } catch {}

  // 3) Fallback: /api/alumnos y filtrar en front por campos conocidos
  const todos = await listAll();
  return todos.filter(a => {
    const eid =
      a?.entrenador?.id_entrenador ??
      a?.entrenador?.id ??
      a?.id_entrenador ??
      null;
    return Number(eid) === Number(entrenadorId);
  });
}

export const alumnosService = { listAll, listarPorEntrenador };
export default alumnosService;
