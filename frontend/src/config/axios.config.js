import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080",
  timeout: 10000,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  // withCredentials: true, // Quítalo, no es necesario para tokens Bearer
});

// ✅ INTERCEPTOR DE REQUEST (LA SOLUCIÓN)
// Esto se ejecuta ANTES de CADA petición
axiosInstance.interceptors.request.use(
  (config) => {
    // Busca el token en localStorage en CADA petición
    const token = localStorage.getItem("gs_token");
    if (token) {
      // Si existe, lo añade a los headers
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Esto es para errores en la configuración de la petición
    return Promise.reject(error);
  }
);

// Tu interceptor de respuesta (esto está bien como lo tenías)
axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("HTTP error:", err?.response?.status, err?.response?.data || err.message);
    // Opcional: Si el error es 401, podríamos borrar el token y redirigir al login
    if (err.response && err.response.status === 401) {
       localStorage.removeItem("gs_token");
       // window.location.href = '/login'; // Descomentar para redirigir
    }
    return Promise.reject(err);
  }
);

export default axiosInstance;