// src/services/rutinas.servicio.js
import axiosInstance from "../config/axios.config";

/* ---------- Adaptadores ---------- */
function adaptRutina(raw, planIdHint) {
  if (!raw || typeof raw !== "object") return null;

  const id = raw.id_rutina ?? raw.id ?? null;
  const planId =
    raw.id_plan ??
    raw.planId ??
    raw.plan?.id_plan ??
    raw.plan?.id ??
    planIdHint ??
    null;

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

/* Helper seguro para GET */
async function tryGet(url, config) {
  try {
    const r = await axiosInstance.get(url, config);
    return { ok: true, data: r.data };
  } catch {
    return { ok: false, data: null };
  }
}

/* ---------- Listar por plan ---------- */
async function listByPlan(idPlan) {
  // 1) Endpoint anidado
  let res = await tryGet(`/api/planes/${idPlan}/rutinas`);
  if (res.ok && Array.isArray(res.data)) {
    return res.data.map((x) => adaptRutina(x, idPlan)).filter(Boolean);
  }

  // 2) Fallback por query
  res = await tryGet(`/api/rutinas`, { params: { planId: idPlan } });
  if (res.ok && Array.isArray(res.data)) {
    return res.data.map((x) => adaptRutina(x, idPlan)).filter(Boolean);
  }

  return [];
}

/* ---------- Obtener detalle (CORREGIDO) ---------- */
async function obtenerDetalleRutina(idPlan, idRutina) {
  if (idPlan) {
    const res = await tryGet(`/api/planes/${idPlan}/rutinas/${idRutina}/detalle`);
    if (res.ok && res.data) return res.data;
  }

  // fallback correcto
  const resFallback = await tryGet(`/api/rutinas/${idRutina}/detalle`);
  if (resFallback.ok && resFallback.data) return resFallback.data;

  return null;
}

/* ---------- Crear rutina ---------- */
async function crear(idPlan, payload) {
  if (!idPlan || idPlan === "SIN_PLAN") {
    const r = await axiosInstance.post(`/api/rutinas`, payload);
    return r.data;
  }

  const r = await axiosInstance.post(`/api/planes/${idPlan}/rutinas`, payload);
  return r.data;
}

/* ---------- Actualizar rutina ---------- */
async function update(idPlan, idRutina, payload) {
  const body = {
    nombre: payload?.nombre ?? "",
    descripcion: payload?.descripcion ?? "",
    ejercicios: (payload?.ejercicios ?? []).map((e) => ({
      idEjercicio: e.idEjercicio ?? e.id ?? e.id_ejercicio,
      series: Number(e.series ?? 0),
      repeticiones: Number(e.repeticiones ?? 0),

      // NUEVO
      grupoMuscular: e.grupoMuscular ?? e.grupo_muscular ?? null,
      observaciones: e.observaciones?.trim() || null,
    })),
  };

  const r = await axiosInstance.put(`/api/rutinas/${idRutina}`, body, {
    headers: { "Content-Type": "application/json" },
  });

  return r.data ?? true;
}

/* ---------- Eliminar rutina ---------- */
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

/* ---------- Copiar rutina a un plan ---------- */
async function copiarEnPlan(idPlan, rutinaId) {
  const r = await axiosInstance.post(`/api/planes/${idPlan}/rutinas/copiar`, {
    rutinaId,
  });
  return r.data;
}

/* ---------- Export ---------- */
const rutinasService = {
  listByPlan,
  obtenerDetalleRutina,
  crear,
  update,
  remove,
  copiarEnPlan,
};

export default rutinasService;
