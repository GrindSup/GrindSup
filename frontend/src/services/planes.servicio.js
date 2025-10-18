import axiosInstance from "../config/axios.config";

export const planesService = {
  // Lista todos los planes (si tu backend expone /api/planes)
  listAll: async () => {
    const r = await axiosInstance.get("/api/planes");
    return r.data;
  },

  // Obtener plan por id
  getById: async (idPlan) => {
    const r = await axiosInstance.get(`/api/planes/${idPlan}`);
    return r.data;
  },

  // Crear plan
  create: async ({ idAlumno, objetivo, fechaInicio, fechaFin }) => {
    // se acopla a tu PlanEntrenamientoService.crearPlan(CrearPlanrequestDTO)
    const payload = {
      idAlumno,
      objetivo,
      fechaInicio, // "yyyy-mm-dd"
      fechaFin     // "yyyy-mm-dd" o null
    };
    const r = await axiosInstance.post("/api/planes", payload);
    return r.data;
  },

  // (opcional) listar planes por alumno
  listByAlumno: async (idAlumno) => {
    const r = await axiosInstance.get(`/api/alumnos/${idAlumno}/planes`);
    return r.data;
  }
};
