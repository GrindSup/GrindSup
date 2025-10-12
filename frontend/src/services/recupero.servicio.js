import axios from "../config/axios.config";

const ENDPOINTS = {
  forgot: "/auth/password/forgot", // { correo }
  reset:  "/auth/password/reset",  // { token, nuevaContrasena }
};

export async function solicitarRecupero(correo) {
  const { status, data } = await axios.post(ENDPOINTS.forgot, { correo });
  return { ok: status === 200, data };
}

export async function restablecerContrasena(token, nuevaContrasena) {
  const { status, data } = await axios.post(ENDPOINTS.reset, { token, nuevaContrasena });
  return { ok: status === 200, data };
}
