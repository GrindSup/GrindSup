import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080",
  timeout: 10000,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  withCredentials: true, // ya no dependemos de cookie
});

// si hay token guardado de una sesión anterior, úsalo
const saved = localStorage.getItem("gs_token");
if (saved) {
  axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${saved}`;
}

axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("HTTP error:", err?.response?.status, err?.response?.data || err.message);
    return Promise.reject(err);
  }
);

export default axiosInstance;
