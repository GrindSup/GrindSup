// src/services/rutinas.servicio.js
import axiosInstance from "../config/axios.config";

/* ---------- Adaptadores ---------- */
function adaptRutina(raw, planIdHint) {
  if (!raw || typeof raw !== "object") return null;
  const id = raw.id_rutina ?? raw.id ?? null;
  const planId =
    raw.id_plan ?? raw.planId ?? raw.plan?.id_plan ?? raw.plan?.id ?? planIdHint ?? null;

  return {
    id,
    id_rutina: id,
    planId,
    nombre: raw.nombre ?? "",
    descripcion: raw.descripcion ?? "",
    dificultad: raw.dificultad ?? null,
    _raw: raw,
  };
}

/* ---------- Helper para GET seguro ---------- */
async function tryGet(url, config) {
  try {
    const r = await axiosInstance.get(url, config);
    return { ok: true, data: r.data };
  } catch {
    return { ok: false, data: null };
  }
}

/* ---------- Listas ---------- */
async function listByPlan(idPlan) {
  // 1) /api/planes/{id}/rutinas
  let res = await tryGet(`/api/planes/${idPlan}/rutinas`);
  if (res.ok && Array.isArray(res.data)) {
    return res.data.map((x) => adaptRutina(x, idPlan)).filter(Boolean);
  }

  // 2) /api/rutinas?planId=...
  res = await tryGet(`/api/rutinas`, { params: { planId: idPlan } });
  if (res.ok && Array.isArray(res.data)) {
    return res.data.map((x) => adaptRutina(x, idPlan)).filter(Boolean);
  }

  return [];
}

/* ---------- Detalle (¡CORREGIDO!) ---------- */
async function obtenerDetalleRutina(idPlan, idRutina) {
  // Si tenemos un plan, intentamos primero el endpoint anidado
  if (idPlan) {
    const res = await tryGet(`/api/planes/${idPlan}/rutinas/${idRutina}/detalle`);
    if (res.ok && res.data) return res.data;
  }

  // --- ESTA ES LA LÍNEA CORREGIDA ---
  // Fallback si falla o no hay idPlan: DEBE apuntar a /detalle
  const resFallback = await tryGet(`/api/rutinas/${idRutina}/detalle`);
  if (resFallback.ok && resFallback.data) return resFallback.data;

  return null;
}

/* ---------- Crear ---------- */
async function crear(idPlan, payload) {
  // Si el plan es “SIN_PLAN”, vacío o null, usar endpoint general
  if (!idPlan || idPlan === "SIN_PLAN") {
    const r = await axiosInstance.post(`/api/rutinas`, payload);
    return r.data;
  }

  // Si hay plan válido, usar el endpoint anidado
  const r = await axiosInstance.post(`/api/planes/${idPlan}/rutinas`, payload);
  return r.data;
}

/* ---------- Actualizar ---------- */
async function update(idPlan, idRutina, payload) {
  const body = {
    nombre: payload?.nombre ?? "",
    descripcion: payload?.descripcion ?? "",
    ejercicios: (payload?.ejercicios ?? []).map((e) => ({
      idEjercicio: e.idEjercicio ?? e.id ?? e.id_ejercicio,
      series: Number(e.series ?? 0),
      repeticiones: Number(e.repeticiones ?? 0),
      descansoSegundos: Number(e.descansoSegundos ?? e.descanso_segundos ?? 0),
    })),
  };

  const r = await axiosInstance.put(`/api/rutinas/${idRutina}`, body, {
    headers: { "Content-Type": "application/json" },
  });
  return r.data ?? true;
}

/* ---------- Eliminar ---------- */
async function remove(idPlan, idRutina) {
  const attempts = [
    { method: "delete", url: `/api/planes/${idPlan}/rutinas/${idRutina}` },
    { method: "delete", url: `/api/rutinas/${idRutina}` },
    { method: "post", url: `/api/planes/${idPlan}/rutinas/${idRutina}/delete` },
    { method: "post", url: `/api/rutinas/${idRutina}/delete` },
  ];

  for (const att of attempts) {
    try {
      if (att.method === "delete") {
        await axiosInstance.delete(att.url, att.config);
      } else {
        await axiosInstance.post(att.url, att.config?.data ?? {});
      }
      return true;
    } catch {}
  }
  return false;
}

/* ---------- Export único ---------- */
const rutinasService = {
  listByPlan,
  obtenerDetalleRutina,
  crear,
  update,
  remove,
};

export default rutinasService;