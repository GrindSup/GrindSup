import axiosInstance from "../config/axios.config";

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

async function getAll(entrenadorId) {
  if (entrenadorId) {
    let res = await tryGet(`/api/planes?entrenadorId=${entrenadorId}`);
    if (res.ok && Array.isArray(res.data)) return res.data.map(adaptPlan).filter(Boolean);

    res = await tryGet(`/api/entrenadores/${entrenadorId}/planes`);
    if (res.ok && Array.isArray(res.data)) return res.data.map(adaptPlan).filter(Boolean);
  }

  const res = await tryGet(`/api/planes`);
  if (res.ok && Array.isArray(res.data)) return res.data.map(adaptPlan).filter(Boolean);
  return [];
}

const listAll = getAll;

/**
 * getById con fallbacks:
 *  - /api/planes/:id
 *  - /api/planes?id=:id (por si tu backend filtra por query)
 *  - /api/planes (y filtra en el front si todo lo anterior falla)
 */
async function getById(idPlan) {
  // 1) directo
  let res = await tryGet(`/api/planes/${idPlan}`);
  if (res.ok && res.data) {
    const raw = res.data?.plan ?? res.data;
    return adaptPlan(raw);
  }

  // 2) query ?id=
  res = await tryGet(`/api/planes`, { params: { id: idPlan } });
  if (res.ok && res.data) {
    const arr =
      Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.planes)
        ? res.data.planes
        : [];
    const found = arr.find((p) => String(p?.id_plan ?? p?.id) === String(idPlan));
    if (found) return adaptPlan(found);
  }

  // 3) traer todo y buscar
  const all = await getAll();
  const f = all.find((p) => String(p.id_plan ?? p.id) === String(idPlan));
  return f || null;
}

// ✅ Editar plan
async function update(idPlan, payload) {
  // payload: { objetivo, fechaInicio, fechaFin }
  try {
    const r = await axiosInstance.put(`/api/planes/${idPlan}`, payload);
    const raw = r.data?.plan ?? r.data;
    return adaptPlan(raw);
  } catch (e) {
    throw e;
  }
}

// ✅ Eliminar plan (opcional)
async function remove(idPlan) {
  await axiosInstance.delete(`/api/planes/${idPlan}`);
}

async function create(payload) {
  try {
    const r = await axiosInstance.post(`/api/planes`, payload);
    const raw = r.data?.plan ?? r.data;
    return adaptPlan(raw);
  } catch (e) {
    throw e;
  }
}

export const planesService = {
  getAll,
  listAll,
  getById,
  create,
  update,
  remove,
};
export default planesService;
