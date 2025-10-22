// frontend/src/services/rutinas.servicio.js
import axiosInstance from "../config/axios.config";

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

async function tryGet(url, config) {
  try {
    const r = await axiosInstance.get(url, config);
    return { ok: true, data: r.data };
  } catch {
    return { ok: false, data: null };
  }
}

// ---------- Listas ----------
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

// ---------- Detalle ----------
async function obtenerDetalleRutina(idPlan, idRutina) {
  // 1) /api/planes/{idPlan}/rutinas/{idRutina}/detalle
  let res = await tryGet(`/api/planes/${idPlan}/rutinas/${idRutina}/detalle`);
  if (res.ok && res.data) return res.data;

  // 2) fallback simple
  res = await tryGet(`/api/rutinas/${idRutina}`);
  if (res.ok && res.data) return res.data;

  return null;
}

// ---------- Crear ----------
async function crear(idPlan, payload) {
  // payload: { nombre, descripcion, ejercicios:[{idEjercicio, series, repeticiones, descansoSegundos}] }
  const r = await axiosInstance.post(`/api/planes/${idPlan}/rutinas`, payload);
  return r.data;
}

// ---------- Eliminar (con muchos fallbacks típicos de Spring) ----------
async function remove(idPlan, idRutina) {
  const attempts = [
    // RESTful directos
    { method: "delete", url: `/api/planes/${idPlan}/rutinas/${idRutina}` },
    { method: "delete", url: `/api/rutinas/${idRutina}` },

    // DELETE con query
    { method: "delete", url: `/api/rutinas`, config: { params: { planId: idPlan, rutinaId: idRutina } } },
    { method: "delete", url: `/api/rutinas`, config: { params: { planId: idPlan, idRutina } } },

    // DELETE con body (Spring a veces lo espera así)
    { method: "delete", url: `/api/planes/${idPlan}/rutinas`, config: { data: { idRutina } } },
    { method: "delete", url: `/api/rutinas`, config: { data: { planId: idPlan, idRutina } } },

    // Endpoints estilo acción
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
    } catch (e) {
      // seguimos probando
      // console.debug("delete attempt failed:", att, e?.response?.status);
    }
  }
  return false;
}

export const rutinasService = {
  listByPlan,
  obtenerDetalleRutina,
  crear,
  remove,
};

export default rutinasService;
export { listByPlan, obtenerDetalleRutina, crear, remove };
