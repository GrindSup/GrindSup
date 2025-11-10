// frontend/src/config/axios.config.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080",
  timeout: 10000,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  // ✅ Enviar cookies (gs_token / gs_jwt) al backend
  withCredentials: true,
});

// ✅ Request interceptor:
// - Si hay gs_token en localStorage, lo manda como Bearer.
// - Si no hay, igual viajan las cookies por withCredentials.
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("gs_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    } else {
      delete config.headers["Authorization"];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor (opcional)

export default axiosInstance;
