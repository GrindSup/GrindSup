// frontend/src/context/auth.js
import { useState, useEffect } from "react";

const API = import.meta?.env?.VITE_API_BASE_URL || "http://localhost:8080/api";

/* ======================
 * Utilidades de sesión
 * ====================== */

export function getUsuario() {
  try { return JSON.parse(localStorage.getItem("usuario") || "null"); }
  catch { return null; }
}

// Intenta varios nombres posibles de campos (camel/snake y modelos distintos)
export function getEntrenadorId(user) {
  if (!user) return null;
  return (
    user?.entrenador?.id_entrenador ??
    user?.entrenador?.id ??
    user?.id_entrenador ??
    user?.id_usuario ??       // a veces lo guardan así por error
    user?.id ??
    null
  );
}

// Obtiene un nombre legible del entrenador/usuario guardado
export function getEntrenadorName(user) {
  if (!user) return null;

  // candidato “entrenador”
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

/**
 * Obtiene el id del entrenador DE LA SESIÓN, sin tocar backend si es posible.
 * 1) Usa localStorage.entrenadorId si existe.
 * 2) Intenta deducirlo del usuario guardado.
 * 3) Como último recurso consulta al backend por el entrenador del usuario.
 *    Endpoints intentados (si existen):
 *      - GET /api/entrenadores?usuarioId=...
 *      - GET /api/entrenadores/by-usuario/{usuarioId}
 */
export async function ensureEntrenadorId() {
  // 1) cache explícito
  const cached = localStorage.getItem("entrenadorId");
  if (cached && Number(cached)) return Number(cached);

  // 2) deducir de usuario guardado
  const user = getUsuario();
  const fromUser =
    getEntrenadorId(user) && Number(getEntrenadorId(user))
      ? Number(getEntrenadorId(user))
      : null;
  if (fromUser) {
    localStorage.setItem("entrenadorId", String(fromUser));
    return fromUser;
  }

  // 3) último recurso: preguntar gentilmente al backend
  try {
    if (!user?.id_usuario) return null;

    // a) /entrenadores?usuarioId=...
    const q1 = await fetch(`${API}/entrenadores?usuarioId=${user.id_usuario}`);
    if (q1.ok) {
      const data = await q1.json();
      const id =
        Array.isArray(data) && data.length
          ? data[0]?.id_entrenador ?? data[0]?.id
          : null;
      if (id) {
        localStorage.setItem("entrenadorId", String(id));
        return Number(id);
      }
    }

    // b) /entrenadores/by-usuario/{id}
    const q2 = await fetch(`${API}/entrenadores/by-usuario/${user.id_usuario}`);
    if (q2.ok) {
      const data = await q2.json();
      const id = data?.id_entrenador ?? data?.id ?? null;
      if (id) {
        localStorage.setItem("entrenadorId", String(id));
        return Number(id);
      }
    }
  } catch {
    // ignoramos: si no hay endpoint, no rompemos el front
  }

  return null;
}

/**
 * Devuelve { id, displayName } del entrenador logueado.
 * - Usa caches (entrenadorId, entrenadorName)
 * - Intenta armar el nombre desde localStorage.usuario
 * - Si no hay nombre y sabemos el id, intenta GET /api/entrenadores/{id}
 */
export async function ensureEntrenadorInfo() {
  // cache de nombre si existe
  const cachedName = localStorage.getItem("entrenadorName");

  // obtenemos id primero (usará cache si lo tiene)
  const id = await ensureEntrenadorId();

  // 1) nombre a partir del usuario guardado
  const userName = getEntrenadorName(getUsuario());
  if (userName) {
    if (cachedName !== userName) {
      localStorage.setItem("entrenadorName", userName);
    }
    return { id, displayName: userName };
  }

  // 2) si hay cache y no pudimos del user, devolvelo
  if (cachedName) return { id, displayName: cachedName };

  // 3) intento opcional al backend si tenemos id
  if (id) {
    try {
      const r = await fetch(`${API}/entrenadores/${id}`);
      if (r.ok) {
        const ent = await r.json();
        const nombre = [ent?.nombre, ent?.apellido].filter(Boolean).join(" ").trim();
        const displayName =
          nombre || ent?.username || (ent?.email ? ent.email.split("@")[0] : null) || null;
        if (displayName) {
          localStorage.setItem("entrenadorName", displayName);
          return { id, displayName };
        }
      }
    } catch {
      // silencioso
    }
  }

  return { id, displayName: null };
}

export function clearSessionCache() {
  localStorage.removeItem("entrenadorId");
  localStorage.removeItem("entrenadorName");
}

/* ======================
 * Hook mínimo de auth
 * ====================== */
export default function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);
  return { isLoggedIn, setIsLoggedIn };
}
