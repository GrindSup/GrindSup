// frontend/src/context/auth.js
import { useState, useEffect } from "react";

const API = import.meta?.env?.VITE_API_BASE_URL || "http://localhost:8080/api";

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
    user?.id_usuario ??        // a veces lo guardan así por error
    user?.id ??
    null
  );
}

/**
 * Obtiene el id del entrenador DE LA SESIÓN, sin tocar backend si es posible.
 * 1) Usa localStorage.entrenadorId si existe.
 * 2) Intenta deducirlo del usuario guardado.
 * 3) Como último recurso consulta al backend por el entrenador del usuario.
 *    Se prueban endpoints comunes SIN cambiar backend:
 *      - GET /api/entrenadores?usuarioId=...
 *      - GET /api/entrenadores/by-usuario/{usuarioId}
 * Si lo encuentra, lo guarda en localStorage para cachear.
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

export function clearSessionCache() {
  localStorage.removeItem("entrenadorId");
}

export default function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);
  return { isLoggedIn, setIsLoggedIn };
}
