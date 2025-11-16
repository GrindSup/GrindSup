// frontend/src/pages/Reportes/ReportesPlanes.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Box, Button, SimpleGrid, Heading, HStack, Input, InputGroup, InputLeftElement,
  FormLabel, Text, Container, Card, CardHeader, CardBody, useToast, Center, Spinner,
  Alert, AlertIcon, Spacer, Tag
} from "@chakra-ui/react";
import { CalendarIcon } from "@chakra-ui/icons";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar
} from "recharts";
import BotonVolver from "../../components/BotonVolver.jsx";
import { ensureEntrenadorId, getUsuario, getEntrenadorName } from "../../context/auth.js";
import axiosInstance from "../../config/axios.config.js";

// ⚠️ CORRECCIÓN CLAVE: Usamos los nombres que SÍ se exportan en reportes.servicio.js
import {
  getRatingMensual,         // ✅ Nombre CORTO
  getRatingDistribucion     // ✅ Nombre CORTO
} from "../../services/reportes.servicio.js";

// Colores para la torta de Ratings (Score 1 a 5)
const RATING_COLORS = ['#cccccc', '#FF6347', '#FFD700', '#32CD32', '#00BFFF', '#1E90FF']; 


function ym(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export default function ReportesPlanes() {
  const toast = useToast();

  const [entrenadorId, setEntrenadorId] = useState(null);
  const [entrenadorNombre, setEntrenadorNombre] = useState("—");

  // rango default: últimos 2 meses
  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const [from, setFrom] = useState(ym(lastMonth));
  const [to, setTo] = useState(ym(today));

  const [mensual, setMensual] = useState([]);       // [{month, avg}]
  const [buckets, setBuckets] = useState([]);       // [{score, cnt}]
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // ====== Entrenador desde sesión (nombre e id) ======
  useEffect(() => {
    (async () => {
      try {
        const id = await ensureEntrenadorId();
        if (id) setEntrenadorId(id);

        // 1) intentar del usuario guardado
        const u = getUsuario();
        const nombreLocal = getEntrenadorName(u);
        if (nombreLocal) {
          setEntrenadorNombre(nombreLocal);
          return;
        }

        // 2) último recurso: pedir al backend (sin romper si no existe)
        if (id) {
          try {
            const base = import.meta?.env?.VITE_API_BASE_URL || "http://localhost:8080/api";
            const r = await fetch(`${base}/entrenadores/${id}`);
            if (r.ok) {
              const data = await r.json();
              const n = [data?.nombre, data?.apellido].filter(Boolean).join(" ");
              if (n) setEntrenadorNombre(n);
            }
          } catch { /* noop */ }
        }
      } catch {
        // si no hay sesión, se manejará con el guard del router
      }
    })();
  }, []);

  async function load() {
    if (!entrenadorId) return;
    setLoading(true);
    setErr("");
    try {
      const [m, b] = await Promise.all([
        // ✅ USAR EL NOMBRE CORREGIDO: getRatingMensual
        getRatingMensual({ entrenadorId, fromYYYYMM: from, toYYYYMM: to }),
        getRatingDistribucion({ entrenadorId, fromYYYYMM: from, toYYYYMM: to }),
      ]);

      // normalizo mensual -> [{month, avg}]
      const mens = (m || []).map(x => ({
        month: x.month,
        avg: Number(x.avg ?? x.average ?? 0),
        count: Number(x.count ?? x.cnt ?? 0), // Aseguramos que tenemos count para el Bar
      })).sort((a, b) => a.month.localeCompare(b.month));

      // normalizo buckets -> scores 0..5 siempre
      const mapa = new Map((b || []).map(x => [Number(x.score), Number(x.cnt ?? x.count ?? 0)]));
      const buck = Array.from({ length: 6 }, (_, s) => ({ score: s, cnt: mapa.get(s) ?? 0 }));

      setMensual(mens);
      setBuckets(buck);
    } catch (e) {
      console.error(e);
      setErr("No pude cargar los reportes de planes.");
      toast({ title: "Error", description: "No pude cargar reportes de planes.", status: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [entrenadorId]);

  const exportPdf = async () => {
    if (!entrenadorId) return;
    try {
      const resp = await axiosInstance.get(`/api/reportes/planes/entrenador/${entrenadorId}/pdf`, {
        params: { from, to },
        responseType: "blob"
      });
      const blob = new Blob([resp.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const safe = `reporte_planes_${entrenadorId}_${from}_${to}`.replace(/\W+/g, "_");
      a.href = url;
      a.download = `${safe}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast({ title: "Reporte exportado", status: "success" });
    } catch (err) {
      toast({ title: "No pude exportar el PDF", status: "error", description: err?.message });
    }
  };

  const promedioGlobal = useMemo(() => {
    if (!mensual.length) return 0;
    const totalCount = mensual.reduce((sum, r) => sum + (r.count || 0), 0);
    const weightedSum = mensual.reduce((sum, r) => sum + (r.avg || 0) * (r.count || 0), 0);
    return totalCount > 0 ? (weightedSum / totalCount).toFixed(2) : 0;
  }, [mensual]);


  return (
    <Container maxW="7xl" py={8}>
      <HStack align="center" mb={4} gap={3} wrap="wrap">
        <BotonVolver />
        <Heading size="lg" color="white">Reportes — Evaluaciones de Planes</Heading>
        <Spacer />
      </HStack>

      {/* Filtros (entrenador SOLO visible, no editable) */}
      <Card mb={6}>
        <CardBody>
          <HStack spacing={4} align="end" wrap="wrap">
            <Box>
              <FormLabel>Entrenador</FormLabel>
              <Input
                value={entrenadorNombre}
                isReadOnly
                pointerEvents="none"
                bg="gray.100"
                borderRadius="full"
              />
              {!!entrenadorId && (
                <Tag mt={2} colorScheme="gray" variant="subtle">ID #{entrenadorId}</Tag>
              )}
            </Box>

            <Box>
              <FormLabel>Desde (YYYY-MM)</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <CalendarIcon color="gray.500" />
                </InputLeftElement>
                <Input
                  type="month"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  bg="white"
                  borderRadius="full"
                />
              </InputGroup>
            </Box>

            <Box>
              <FormLabel>Hasta (YYYY-MM)</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <CalendarIcon color="gray.500" />
                </InputLeftElement>
                <Input
                  type="month"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  bg="white"
                  borderRadius="full"
                />
              </InputGroup>
            </Box>

            <Button onClick={load} isLoading={loading} bg="#258d19" color="white">
              Aplicar filtros
            </Button>
            <Button
              variant="outline"
              onClick={exportPdf}
              isDisabled={!entrenadorId || loading}
            >
              Exportar PDF
            </Button>
          </HStack>

          <Text mt={3}>
            Promedio global del período: <b>{promedioGlobal}</b> / 5
          </Text>
        </CardBody>
      </Card>

      {loading && (
        <Center py={10}><Spinner size="xl" /></Center>
      )}

      {!loading && err && (
        <Alert status="warning" mb={6} borderRadius="lg">
          <AlertIcon />
          {err}
        </Alert>
      )}

      {!loading && !err && (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {/* Promedio mensual */}
          <Card>
            <CardHeader pb={2}><Heading size="md">Promedio mensual (0–5)</Heading></CardHeader>
            <CardBody pt={0} minH="360px">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mensual}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 5]} allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="avg" name="Promedio" stroke="#8884d8" />
                  <Bar dataKey="count" name="Total Evaluaciones" fill="#82ca9d" yAxisId="right" />
                </LineChart>
              </ResponsiveContainer>
              {mensual.length === 0 && <Text mt={2}>No hay datos en el período seleccionado.</Text>}
            </CardBody>
          </Card>

          {/* Distribución de ratings */}
          <Card>
            <CardHeader pb={2}><Heading size="md">Distribución de ratings</Heading></CardHeader>
            <CardBody pt={0} minH="360px">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={buckets}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="score" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="cnt" name="Cantidad" />
                </BarChart>
              </ResponsiveContainer>
              {buckets.every(b => (b.cnt || 0) === 0) && (
                <Text mt={2}>Aún no hay evaluaciones cargadas.</Text>
              )}
            </CardBody>
          </Card>
        </SimpleGrid>
      )}
    </Container>
  );
}