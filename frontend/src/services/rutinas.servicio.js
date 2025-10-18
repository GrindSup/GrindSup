import axiosInstance from "../config/axios.config";

export const rutinasService = {
  listarPorPlan: (idPlan) =>
    axiosInstance.get(`/api/planes/${idPlan}/rutinas`),

  detalle: (idPlan, idRutina) =>
    axiosInstance.get(`/api/planes/${idPlan}/rutinas/${idRutina}/detalle`),

  crear: (idPlan, payload) =>
    axiosInstance.post(`/api/planes/${idPlan}/rutinas`, payload), // si el endpoint está comentado, capturamos el error en la UI
};
