// frontend/src/services/planes.servicio.js
import axiosInstance from "../config/axios.config";

/* ---------- Adaptador ---------- */
function adaptPlan(raw) {
  if (!raw || typeof raw !== "object") return null;

  const id = raw.id_plan ?? raw.id ?? null;
  const objetivo = raw.objetivo ?? "";
  const fecha_inicio = raw.fecha_inicio ?? raw.fechaInicio ?? null;
  const fecha_fin = raw.fecha_fin ?? raw.fechaFin ?? null;

  const alumno = raw.alumno
    ? {
        id_alumno: raw.alumno.id_alumno ?? raw.alumno.id ?? null,
        nombre: raw.alumno.nombre ?? "",
        apellido: raw.alumno.apellido ?? "",
      }
    : null;

  return {
    id,
    id_plan: id,
    objetivo,
    fecha_inicio,
    fecha_fin,
    alumno,
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

/* ---------- Listado ---------- */
async function getAll(entrenadorId) {
  if (entrenadorId) {
    let res = await tryGet(`/api/planes`, { params: { entrenadorId } });
    if (res.ok && Array.isArray(res.data)) return res.data.map(adaptPlan).filter(Boolean);

    res = await tryGet(`/api/entrenadores/${entrenadorId}/planes`);
    if (res.ok && Array.isArray(res.data)) return res.data.map(adaptPlan).filter(Boolean);
  }

  const res = await tryGet(`/api/planes`);
  if (res.ok && Array.isArray(res.data)) return res.data.map(adaptPlan).filter(Boolean);
  return [];
}
const listAll = getAll;

/* ---------- Obtener por ID (evitando /api/planes/:id) ---------- */
async function getById(idPlan, entrenadorId) {
  // 1) Query ?id= (evita el endpoint ambiguo /api/planes/:id)
  let res = await tryGet(`/api/planes`, { params: { id: idPlan } });
  if (res.ok && res.data) {
    const arr = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.planes)
      ? res.data.planes
      : [];
    const found = arr.find((p) => String(p?.id_plan ?? p?.id) === String(idPlan));
    if (found) return adaptPlan(found);
  }

  // 2) Buscar dentro de los planes del entrenador (si viene)
  if (entrenadorId) {
    const lista = await getAll(entrenadorId);
    const f = lista.find((p) => String(p.id_plan ?? p.id) === String(idPlan));
    if (f) return f;
  }

  // 3) Buscar en todos los planes (última opción)
  const all = await getAll();
  const f = all.find((p) => String(p.id_plan ?? p.id) === String(idPlan));
  if (f) return f;

  // ⚠️ NO llamamos /api/planes/:id porque tu backend tira 500 (Ambiguous mapping)
  return null;
}

/* ---------- Crear / Actualizar / Eliminar ---------- */
async function create(payload) {
  const r = await axiosInstance.post(`/api/planes`, payload);
  const raw = r.data?.plan ?? r.data;
  return adaptPlan(raw);
}

async function update(idPlan, payload) {
  // payload: { objetivo, fechaInicio, fechaFin } — ajustá si tu backend usa otros nombres
  const r = await axiosInstance.put(`/api/planes/${idPlan}`, payload);
  const raw = r.data?.plan ?? r.data;
  return adaptPlan(raw);
}

async function remove(idPlan) {
  await axiosInstance.delete(`/api/planes/${idPlan}`);
}

/* ---------- Exports ---------- */
export const planesService = {
  getAll,
  listAll,
  getById,
  create,
  update,
  remove,
};
export default planesService;
