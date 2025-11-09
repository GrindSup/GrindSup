import axiosInstance from '../config/axios.config'; // (Ajusta la ruta si es necesario)
const ENDPOINTS = {
  forgot: "/auth/password/forgot", // { correo }
  reset:  "/auth/password/reset",  // { token, nuevaContrasena }
};

export async function solicitarRecupero(correo) {
  const { status, data } = await axiosInstance.post(ENDPOINTS.forgot, { correo });
  return { ok: status === 200, data };
}

export async function restablecerContrasena(token, nuevaContrasena) {
  const { status, data } = await axiosInstance.post(ENDPOINTS.reset, { token, nuevaContrasena });
  return { ok: status === 200, data };
}
