// src/services/clienteApi.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta?.env?.VITE_API_BASE_URL || "http://localhost:8080",
  withCredentials: false,
  headers: { "Content-Type": "application/json" },
});

// helper: siempre devolver data (y dejar pasar errores al catch)
api.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err)
);

export default api;
