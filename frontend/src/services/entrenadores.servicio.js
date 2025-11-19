//src\services\entrenadores.servicio.js
import axiosInstance from "../config/axios.config";

/* =================================================================================
 * ADAPTADOR
 * ================================================================================= */
function adaptEntrenador(raw) {
  if (!raw || typeof raw !== "object") return null;

  const id = raw.idEntrenador ?? raw.id ?? null;

  const usuario = raw.usuario
    ? {
        id_usuario: raw.usuario.id_usuario ?? raw.usuario.id ?? null,
        nombre: raw.usuario.nombre ?? "",
        apellido: raw.usuario.apellido ?? "",
        email: raw.usuario.email ?? raw.usuario.correo ?? "",
        foto_perfil: raw.usuario.foto_perfil ?? "",   // 👈 NUEVO
      }
    : null;

  const estado = raw.estado
    ? {
        id_estado: raw.estado.idEstado ?? raw.estado.id ?? null,
        nombre: raw.estado.nombre ?? "",
      }
    : null;

  return {
    id,
    idEntrenador: id,
    experiencia: raw.experiencia ?? "",
    telefono: raw.telefono ?? "",
    usuario,
    estado,
    _raw: raw,
  };
}

/* =================================================================================
 * UTILS
 * ================================================================================= */
async function tryGet(url, config) {
  try {
    const r = await axiosInstance.get(url, config);
    return { ok: true, data: r.data };
  } catch {
    return { ok: false, data: null };
  }
}

/* =================================================================================
 * LISTADOS
 * ================================================================================= */
async function listAll({ estadoId } = {}) {
  const params = {};
  if (estadoId) params.estadoId = estadoId;

  let res = await tryGet(`/api/entrenadores`, { params });
  if (res.ok && Array.isArray(res.data)) {
    return res.data.map(adaptEntrenador).filter(Boolean);
  }

  res = await tryGet(`/api/usuarios`, { params: { rol: "ENTRENADOR" } });
  if (res.ok && Array.isArray(res.data)) {
    return res.data.map((u) => adaptEntrenador({ usuario: u })).filter(Boolean);
  }

  return [];
}

async function getById(idEntrenador) {
  let res = await tryGet(`/api/entrenadores/${idEntrenador}`);
  if (res.ok && res.data) return adaptEntrenador(res.data);

  res = await tryGet(`/api/entrenadores`, { params: { id: idEntrenador } });
  if (res.ok && Array.isArray(res.data)) {
    const found = res.data.find(
      (e) => String(e.id_entrenador ?? e.id) === String(idEntrenador)
    );
    if (found) return adaptEntrenador(found);
  }

  return null;
}

/* =================================================================================
 * CREAR / ACTUALIZAR / ELIMINAR
 * ================================================================================= */
async function create(payload) {
  const r = await axiosInstance.post(`/api/entrenadores`, payload);
  const raw = r.data?.entrenador ?? r.data;
  return adaptEntrenador(raw);
}

async function update(idEntrenador, payload) {
  const r = await axiosInstance.put(`/api/entrenadores/${idEntrenador}`, payload);
  const raw = r.data?.entrenador ?? r.data;
  return adaptEntrenador(raw);
}

async function updateEstado(idEntrenador, estadoId) {
  const attempts = [
    { method: "put", url: `/api/entrenadores/${idEntrenador}/estado`, data: { id_estado: estadoId } },
    { method: "put", url: `/api/entrenadores/${idEntrenador}`, data: { estado: { id_estado: estadoId } } },
    { method: "patch", url: `/api/entrenadores/${idEntrenador}`, data: { estadoId } },
  ];

  for (const att of attempts) {
    try {
      if (att.method === "put") {
        const r = await axiosInstance.put(att.url, att.data);
        return r.data ?? true;
      } else {
        const r = await axiosInstance.patch(att.url, att.data);
        return r.data ?? true;
      }
    } catch (_) {}
  }
  return false;
}

async function remove(idEntrenador) {
  const attempts = [
    { method: "delete", url: `/api/entrenadores/${idEntrenador}` },
    { method: "delete", url: `/api/entrenadores`, config: { params: { id: idEntrenador } } },
    { method: "post",   url: `/api/entrenadores/${idEntrenador}/delete` },
  ];

  for (const att of attempts) {
    try {
      if (att.method === "delete") {
        await axiosInstance.delete(att.url, att.config);
      } else {
        await axiosInstance.post(att.url);
      }
      return true;
    } catch {}
  }
  return false;
}

/* =================================================================================
 * EXPORTS
 * ================================================================================= */
export const entrenadoresService = {
  listAll,
  getById,
  create,
  update,
  updateEstado,
  remove,
};

export default entrenadoresService;
export { listAll, getById, create, update, updateEstado, remove };
