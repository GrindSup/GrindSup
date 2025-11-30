// src/services/recupero.servicio.js
import axiosInstance from "../config/axios.config";

const ENDPOINTS = {
  forgot: "/auth/password/forgot", 
  reset:  "/auth/password/reset",
  check:  "/auth/password/check"  // <-- NUEVO
};

const isOk = (status) => status >= 200 && status < 300;

export async function solicitarRecupero(correo) {
  const { status, data } = await axiosInstance.post(ENDPOINTS.forgot, { correo });
  return { ok: isOk(status), data };
}

export async function restablecerContrasena(token, nuevaContrasena) {
  const { status, data } = await axiosInstance.post(ENDPOINTS.reset, {
    token,
    nuevaContrasena,
  });
  return { ok: isOk(status), data };
}

// 🔥 NUEVO: valida si la contraseña nueva no coincide con la actual
export async function verifPasswordActual(token, nuevaContrasena) {
  const { data } = await axiosInstance.get(ENDPOINTS.check, {
    params: { token, nueva: nuevaContrasena }
  });
  return data; // { misma: true/false }
}
