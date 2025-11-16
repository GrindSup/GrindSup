// frontend/src/pages/Reportes/ReportesAlumnosPage.jsx

import { useEffect, useMemo, useState } from "react";
import { getAltasBajasPorMes, getActivosFinDeMes } from "../../services/reportes.servicio.js";
import {
  Box, Button, SimpleGrid, Heading, HStack, Input, InputGroup, InputLeftElement,
  FormLabel, Text, Container, Card, CardHeader, CardBody, useToast, Center, Spinner,
  Alert, AlertIcon, Spacer, Tag
} from "@chakra-ui/react";
import { CalendarIcon } from "@chakra-ui/icons";
import {
  BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import BotonVolver from "../../components/BotonVolver";
import { ensureEntrenadorInfo } from "../../context/auth";

// 👇 NUEVO: axios para descargar el PDF
import axiosInstance from "../../config/axios.config.js";

const RATING_COLORS = ["#48BB78", "#E53E3E"]; // Verde para Altas, Rojo para Bajas

function ym(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export default function ReportesAlumnosPage() {
  const toast = useToast();
  const [entrenadorId, setEntrenadorId] = useState(null);
  const [entrenadorName, setEntrenadorName] = useState(null);
  const [alumnoData, setAlumnoData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      const { id, displayName } = await ensureEntrenadorInfo();
      if (id) setEntrenadorId(id);
      if (displayName) setEntrenadorName(displayName);
    })();
  }, []);

  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const [from, setFrom] = useState(ym(lastMonth));
  const [to, setTo] = useState(ym(today));

  async function load() {
    if (!entrenadorId) return;
    setLoading(true);
    setErr("");
    try {
      const [ab, afm] = await Promise.all([
        getAltasBajasPorMes({ entrenadorId, fromYYYYMM: from, toYYYYMM: to }),
        getActivosFinDeMes({ entrenadorId, fromYYYYMM: from, toYYYYMM: to }),
      ]);

      const map = new Map();
      ab.forEach((r) => map.set(r.month, { ...r }));
      afm.forEach((r) => {
        const prev = map.get(r.month) || { month: r.month, altas: 0, bajas: 0 };
        map.set(r.month, { ...prev, activos: r.activos });
      });
      setAlumnoData(
        Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month))
      );
    } catch (e) {
      console.error(e);
      setErr("No pude cargar los datos de reportes de alumnos.");
      toast({
        title: "Error",
        description: "No pude cargar reportes de alumnos.",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (entrenadorId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entrenadorId]);

  const totals = useMemo(() => {
    const altas = alumnoData.reduce((acc, r) => acc + (r.altas || 0), 0);
    const bajas = alumnoData.reduce((acc, r) => acc + (r.bajas || 0), 0);
    return [
      { name: "Altas", value: altas, color: RATING_COLORS[0] },
      { name: "Bajas", value: bajas, color: RATING_COLORS[1] },
    ];
  }, [alumnoData]);

  // 👇 NUEVO: exportar PDF (usa el endpoint /api/reportes/alumnos/entrenador/{id}/pdf)
  const exportPdf = async () => {
    if (!entrenadorId) return;
    try {
      const resp = await axiosInstance.get(
        `/api/reportes/alumnos/entrenador/${entrenadorId}/pdf`,
        {
          params: { from, to },
          responseType: "blob",
        }
      );

      const blob = new Blob([resp.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const safe = `reporte_alumnos_${entrenadorId}_${from}_${to}`.replace(
        /\W+/g,
        "_"
      );
      a.href = url;
      a.download = `${safe}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast({ title: "Reporte de alumnos exportado", status: "success" });
    } catch (err) {
      console.error(err);
      toast({
        title: "No pude exportar el PDF",
        description: err?.message || "Error desconocido",
        status: "error",
      });
    }
  };

  return (
    <Container maxW="7xl" py={8}>
      <HStack align="center" mb={4} gap={3} wrap="wrap">
        <BotonVolver />
        <Heading size="lg" color="white">
          Reportes — Estadísticas de Alumnos
        </Heading>
        <Spacer />
      </HStack>

      <Card mb={6}>
        <CardBody>
          <HStack spacing={4} align="end" wrap="wrap">
            <Box>
              <FormLabel>Entrenador</FormLabel>
              <Tag colorScheme="green" size="lg" borderRadius="full">
                {entrenadorName
                  ? entrenadorName
                  : entrenadorId
                  ? `Entrenador #${entrenadorId}`
                  : "Sin sesión"}
              </Tag>
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

            <Button
              onClick={load}
              isLoading={loading}
              bg="#258d19"
              color="white"
              isDisabled={!entrenadorId}
            >
              Aplicar filtros
            </Button>

            {/* 👇 NUEVO BOTÓN EXPORTAR PDF */}
            <Button
              variant="outline"
              onClick={exportPdf}
              isDisabled={!entrenadorId || loading}
            >
              Exportar PDF
            </Button>
          </HStack>
        </CardBody>
      </Card>

      {loading && (
        <Center py={10}>
          <Spinner size="xl" />
        </Center>
      )}

      {!loading && err && (
        <Alert status="warning" mb={6} borderRadius="lg">
          <AlertIcon />
          {err}
        </Alert>
      )}

      {!loading && !err && (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <Card>
            <CardHeader pb={2}>
              <Heading size="md">Altas vs Bajas por mes + Activos</Heading>
            </CardHeader>
            <CardBody pt={0} minH="360px">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={alumnoData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="altas" name="Altas" fill="#48BB78" />
                  <Bar dataKey="bajas" name="Bajas" fill="#E53E3E" />
                  <Line
                    type="monotone"
                    dataKey="activos"
                    name="Activos fin de mes"
                    stroke="#4299E1"
                  />
                </BarChart>
              </ResponsiveContainer>
              {alumnoData.length === 0 && (
                <Text mt={2}>No hay datos en el período seleccionado.</Text>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader pb={2}>
              <Heading size="md">Distribución (torta) — Altas vs Bajas</Heading>
            </CardHeader>
            <CardBody pt={0} minH="360px">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={totals}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {totals.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <Text mt={2}>
                Total Altas: <b>{totals[0]?.value || 0}</b> — Total Bajas:{" "}
                <b>{totals[1]?.value || 0}</b>
              </Text>
            </CardBody>
          </Card>
        </SimpleGrid>
      )}
    </Container>
  );
}
