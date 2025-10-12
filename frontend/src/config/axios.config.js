import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080", // << raíz (tus endpoints empiezan con /auth)
  timeout: 10000,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  withCredentials: false,
});

axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("HTTP error:", err?.response?.status, err?.response?.data || err.message);
    return Promise.reject(err);
  }
);

export default axiosInstance;
