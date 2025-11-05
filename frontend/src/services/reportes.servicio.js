// frontend/src/services/reportes.servicio.js
import axios from "../config/axios.config.js";

/* =======================
 * Reportes — Alumnos
 * ======================= */

// Altas/Bajas por mes
export async function getAltasBajasPorMes({ entrenadorId, fromYYYYMM, toYYYYMM }) {
  const params = new URLSearchParams({ entrenadorId, from: fromYYYYMM, to: toYYYYMM });
  const { data } = await axios.get(`/api/stats/alumnos/altas-bajas?${params.toString()}`);
  return (data || []).map(d => ({
    month: d.month,
    altas: Number(d.altas || 0),
    bajas: Number(d.bajas || 0),
  }));
}

// Activos al fin de mes (serie acumulada)
export async function getActivosFinDeMes({ entrenadorId, fromYYYYMM, toYYYYMM }) {
  const params = new URLSearchParams({ entrenadorId, from: fromYYYYMM, to: toYYYYMM });
  const { data } = await axios.get(`/api/stats/alumnos/activos-fin-de-mes?${params.toString()}`);
  return (data || []).map(d => ({
    month: d.month,
    activos: Number(d.altas || 0), // backend usa 'altas' como acumulado
  }));
}

/* =======================
 * Reportes — Planes (ratings)
 * ======================= */

// --- Nombres “largos” canónicos ---
export async function getPlanesRatingPromedioMensual({ entrenadorId, fromYYYYMM, toYYYYMM }) {
  const params = new URLSearchParams({ entrenadorId, from: fromYYYYMM, to: toYYYYMM });
  const { data } = await axios.get(`/api/stats/planes/rating-mensual?${params.toString()}`);
  // backend: [{ month: "YYYY-MM", avg: number, count: number }]
  return (data || []).map(r => ({
    month: r.month,
    avg: Number(r.avg ?? r.promedio ?? 0),
    count: Number(r.count ?? r.cnt ?? 0),
  }));
}

export async function getPlanesRatingDistribucion({ entrenadorId, fromYYYYMM, toYYYYMM }) {
  const params = new URLSearchParams({ entrenadorId, from: fromYYYYMM, to: toYYYYMM });
  const { data } = await axios.get(`/api/stats/planes/rating-distribucion?${params.toString()}`);
  // backend: [{ score: 0..5, count/cnt }]
  // normalizo a buckets 0..5
  const buckets = Array.from({ length: 6 }, (_, s) => ({ score: s, cnt: 0 }));
  (data || []).forEach(r => {
    const s = Number(r.score);
    const c = Number(r.count ?? r.cnt ?? 0);
    if (s >= 0 && s <= 5) buckets[s].cnt = c;
  });
  return buckets;
}

export async function getPlanesRatingGlobal({ entrenadorId, fromYYYYMM, toYYYYMM }) {
  const mensual = await getPlanesRatingPromedioMensual({ entrenadorId, fromYYYYMM, toYYYYMM });
  let sum = 0, n = 0;
  mensual.forEach(m => { sum += (m.avg || 0) * (m.count || 0); n += (m.count || 0); });
  return n > 0 ? sum / n : 0;
}

// --- Aliases cortos para compat con JSX existente ---
// (Así podés importar getPlanesRatingMensual y getPlanesRatingDistribucion sin romper)
export const getPlanesRatingMensual = getPlanesRatingPromedioMensual;
// (getPlanesRatingDistribucion ya existe con ese nombre)
