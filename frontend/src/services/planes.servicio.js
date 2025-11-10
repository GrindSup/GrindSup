import api from "../config/axios.config";

/* =============== Adaptador de entidad Plan =============== */
function adaptPlan(raw) {
  if (!raw || typeof raw !== "object") return null;

  // Usa id_plan (Entidad JPA) o idPlan (Variable interna DTO) o id (Fallback)
  const id = raw.id_plan ?? raw.idPlan ?? raw.id ?? null;

  // normalizo fechas (acepta fecha_inicio/fechaInicio y fecha_fin/fechaFin)
  const fecha_inicio =
    raw.fecha_inicio ?? raw.fechaInicio ?? raw.fecha_inicio?.slice?.(0, 10) ?? null;
  const fecha_fin =
    raw.fecha_fin ?? raw.fechaFin ?? raw.fecha_fin?.slice?.(0, 10) ?? null;

  // 🎯 CORRECCIÓN CLAVE: Priorizar los campos planos del DTO (nombreAlumno, apellidoAlumno)
  const alumnoNombre = raw.nombreAlumno ?? raw.alumno?.nombre ?? "";
  const alumnoApellido = raw.apellidoAlumno ?? raw.alumno?.apellido ?? "";
  const alumnoId = raw.idAlumno ?? raw.alumno?.id_alumno ?? raw.alumno?.id ?? null;


  const alumno = alumnoNombre || alumnoApellido
    ? {
        id_alumno: alumnoId,
        nombre: alumnoNombre,
        apellido: alumnoApellido,
      }
    : null; // Si no hay nombre, el objeto alumno es nulo.

  return {
    id,              
    id_plan: id,      
    objetivo: raw.objetivo ?? "",
    fecha_inicio,
    fecha_fin,
    alumno, // <-- Esto ahora contiene los datos del alumno de forma correcta.
    // ids auxiliares si vinieran “sueltos”
    id_alumno: alumnoId,
    id_entrenador: raw.id_entrenador ?? null,
    _raw: raw,
  };
}

async function tryGet(url, config) {
  try {
    const r = await api.get(url, config);
    return { ok: true, data: r.data };
  } catch (e) {
    return { ok: false, data: null, error: e };
  }
}

/* ===================== Listado / Lectura ===================== */
async function getAll(entrenadorId) {
  const cfg = entrenadorId ? { params: { entrenadorId } } : undefined;
  const res = await tryGet(`/api/planes`, cfg);
  
  // Si la respuesta es OK y es un array, lo adaptamos. 
  // Si es OK pero no array (ej: 200 OK con body vacío), devolvemos [].
  if (res.ok && Array.isArray(res.data)) {
    return res.data.map(adaptPlan).filter(Boolean);
  }

  // Si no fue OK o el formato fue inesperado (pero la llamada salió), logueamos el error.
  if (!res.ok) {
     console.error("getAll /api/planes → Falló la llamada a la API", res.error);
  } else {
     console.error("getAll /api/planes → Formato inesperado (no es un array)", res.data);
  }
  return [];
}
const listAll = getAll;

async function getById(idPlan, entrenadorId) {
  // 1) Algunos backs exponen /api/planes?id=...
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

  // 2) Si existe /api/planes/:id
  res = await tryGet(`/api/planes/${idPlan}`);
  if (res.ok && res.data) return adaptPlan(res.data);

  // 3) Fallback: barrido en memoria
  if (entrenadorId) {
    const lista = await getAll(entrenadorId);
    const f = lista.find((p) => String(p.id_plan ?? p.id) === String(idPlan));
    if (f) return f;
  }
  const all = await getAll();
  return all.find((p) => String(p.id_plan ?? p.id) === String(idPlan)) ?? null;
}

/* ========================= CRUD básico ========================= */
async function create(payload) {
  const r = await api.post(`/api/planes`, payload);
  return adaptPlan(r.data?.plan ?? r.data);
}

async function update(idPlan, payload) {
  const r = await api.put(`/api/planes/${idPlan}`, payload);
  return adaptPlan(r.data?.plan ?? r.data);
}

async function remove(idPlan) {
  await api.delete(`/api/planes/${idPlan}`);
}

/* ========== Evaluaciones (plan_evaluacion) y Finalización ========== */

/** Estado de evaluación: intenta primero /evaluacion/count y luego /evaluacion */
async function getEvaluationStatus(idPlan) {
  // A) GET /api/planes/:id/evaluacion/count -> { count: N }
  let r = await tryGet(`/api/planes/${idPlan}/evaluacion/count`);
  if (r.ok && r.data && typeof r.data.count === "number") {
    return { exists: r.data.count > 0, data: null };
  }

  // B) GET /api/planes/:id/evaluacion -> [...]
  r = await tryGet(`/api/planes/${idPlan}/evaluacion`);
  if (r.ok && Array.isArray(r.data)) {
    return { exists: r.data.length > 0, data: r.data[0] ?? null };
  }

  return { exists: false, data: null };
}

/** Crear evaluación (score 1..5, comentario opcional). 
 * Si tu back resuelve ids por contexto, basta con {score, comentario}.
 */
async function createEvaluation({ id_plan, id_alumno, id_entrenador, score, comentario }) {
  const body = { score, comentario };

  // Si tu backend los necesita, los incluimos (no molestan si se ignoran)
  if (id_plan) body.id_plan = id_plan;
  if (id_alumno) body.id_alumno = id_alumno;
  if (id_entrenador) body.id_entrenador = id_entrenador;

  const r = await api.post(`/api/planes/${id_plan}/evaluacion`, body);
  return r.data?.evaluacion ?? r.data ?? true;
}

/** Finalizar un plan. 
 * 1) Intenta POST /finalizar {fechaFin}; 
 * 2) fallback PUT /api/planes/:id {fechaFin} 
 */
async function finalizePlan(id_plan, fechaFinISO) {
  const fechaFin = (fechaFinISO || new Date().toISOString().slice(0, 10));

  // 1) endpoint dedicado (si existe en tu back)
  try {
    const r = await api.post(`/api/planes/${id_plan}/finalizar`, { fechaFin });
    return adaptPlan(r.data?.plan ?? r.data);
  } catch {
    // 2) fallback: actualizar por PUT
    const updated = await update(id_plan, { fechaFin, fecha_fin: fechaFin });
    return updated;
  }
}

/** Flujo completo: finaliza si hace falta + crea evaluación */
async function finalizeAndRate({ plan, score, comentario }) {
  const id_plan = plan.id_plan ?? plan.id;
  const id_alumno = plan.id_alumno ?? plan.alumno?.id_alumno ?? null;
  const id_entrenador = plan.id_entrenador ?? plan._raw?.id_entrenador ?? null;

  if (!id_plan) throw new Error("finalizeAndRate: falta id_plan");

  if (!plan.fecha_fin) {
    await finalizePlan(id_plan); // usa hoy por defecto
  }
  await createEvaluation({ id_plan, id_alumno, id_entrenador, score, comentario });
  return true;
}

/* ============================= Exports ============================= */
export const planesService = {
  getAll,
  listAll,
  getById,
  create,
  update,
  remove,
  getEvaluationStatus,
  createEvaluation,
  finalizePlan,
  finalizeAndRate,
};

export default planesService;