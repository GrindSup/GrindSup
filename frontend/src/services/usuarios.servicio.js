// src/services/usuarios.servicio.js
import api from "./clienteApi";

export const usuariosService = {
  login: (email, password) =>
    api.post("/api/usuarios/login", { email, password }).then((r) => r.data),

  logout: (sesionId) =>
    api.put(`/api/usuarios/logout/${sesionId}`).then((r) => r.data),

  me: () => api.get("/api/usuarios/me").then((r) => r.data),

  crear: (payload) => api.post("/api/usuarios", payload).then((r) => r.data),

  cambiarPassword: (payload) =>
    api.put("/api/usuarios/password", payload).then((r) => r.data),

  forgotPassword: (email) =>
    api.post("/api/usuarios/forgot-password", { email }).then((r) => r.data),

  resetPassword: (token, password) =>
    api.post("/api/usuarios/reset-password", { token, password }).then((r) => r.data),
};

export default usuariosService;
