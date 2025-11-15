import { useState, useEffect } from "react";
import api from "../config/axios.config";

/* ======================
 * GETTERS DE USUARIO
 * ====================== */

export function getUsuario() {
  try {
    return JSON.parse(localStorage.getItem("usuario") || "null");
  } catch {
    return null;
  }
}

export function getEntrenadorId(user) {
  if (!user) return null;
  return (
    user?.entrenador?.id_entrenador ??
    user?.entrenador?.id ??
    user?.id_entrenador ??
    user?.id_usuario ??
    user?.id ??
    null
  );
}

export function getEntrenadorName(user) {
  if (!user) return null;

  const ent = user?.entrenador || user?.usuario || user;

  const nombre =
    ent?.nombre ??
    user?.nombre ??
    ent?.firstName ??
    user?.firstName ??
    null;

  const apellido =
    ent?.apellido ??
    user?.apellido ??
    ent?.lastName ??
    user?.lastName ??
    null;

  if (nombre || apellido) {
    return [nombre, apellido].filter(Boolean).join(" ").trim() || null;
  }

  if (user?.username) return user.username;
  if (user?.email) return user.email.split("@")[0];

  return null;
}

/* ======================
 * ensureEntrenadorId
 * ====================== */

export async function ensureEntrenadorId() {
  // 1) cache
  const cached = localStorage.getItem("entrenadorId");
  if (cached && Number(cached)) return Number(cached);

  // 2) deducción desde usuario
  const user = getUsuario();
  const fromUser =
    getEntrenadorId(user) && Number(getEntrenadorId(user))
      ? Number(getEntrenadorId(user))
      : null;

  if (fromUser) {
    localStorage.setItem("entrenadorId", String(fromUser));
    return fromUser;
  }

  // 3) backend
  try {
    if (!user?.id_usuario) return null;

    // a) /entrenadores?usuarioId=x
    try {
      const { data } = await api.get(
        `/api/entrenadores?usuarioId=${user.id_usuario}`
      );

      const id =
        Array.isArray(data) && data.length
          ? data[0]?.id_entrenador ?? data[0]?.id
          : null;

      if (id) {
        localStorage.setItem("entrenadorId", String(id));
        return Number(id);
      }
    } catch (err) {
      console.warn("ensureEntrenadorId (query 1) falló", err);
    }

    // b) /entrenadores/by-usuario/{id}
    try {
      const { data } = await api.get(
        `/api/entrenadores/by-usuario/${user.id_usuario}`
      );

      const id = data?.id_entrenador ?? data?.id ?? null;
      if (id) {
        localStorage.setItem("entrenadorId", String(id));
        return Number(id);
      }
    } catch (err) {
      console.warn("ensureEntrenadorId (query 2) falló", err);
    }
  } catch (err) {
    console.error("Error general en ensureEntrenadorId", err);
  }

  return null;
}

/* ======================
 * ensureEntrenadorInfo
 * ====================== */

export async function ensureEntrenadorInfo() {
  const cachedName = localStorage.getItem("entrenadorName");
  const id = await ensureEntrenadorId();
  const userName = getEntrenadorName(getUsuario());

  if (userName) {
    if (cachedName !== userName)
      localStorage.setItem("entrenadorName", userName);
    return { id, displayName: userName };
  }

  if (cachedName) return { id, displayName: cachedName };

  if (id) {
    try {
      const { data: ent } = await api.get(`/api/entrenadores/${id}`);
      if (ent) {
        const displayName =
          [ent?.nombre, ent?.apellido]
            .filter(Boolean)
            .join(" ")
            .trim() ||
          ent?.username ||
          (ent?.email ? ent.email.split("@")[0] : null) ||
          null;

        if (displayName) {
          localStorage.setItem("entrenadorName", displayName);
          return { id, displayName };
        }
      }
    } catch (err) {
      console.warn("ensureEntrenadorInfo (query 3) falló", err);
    }
  }

  return { id, displayName: null };
}

/* ======================
 * limpiar session cache
 * ====================== */

export function clearSessionCache() {
  localStorage.removeItem("entrenadorId");
  localStorage.removeItem("entrenadorName");
  localStorage.removeItem("gs_user_id"); // ✔ necesario ahora
  localStorage.removeItem("userId");     // ✔ necesario ahora
}

/* ======================
 * Hook de auth mínimo
 * ====================== */

export default function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("gs_token");
    setIsLoggedIn(!!token);
  }, []);

  return { isLoggedIn, setIsLoggedIn };
}
