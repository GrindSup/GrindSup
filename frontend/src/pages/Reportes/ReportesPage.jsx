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

function ym(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export default function ReportesPage() {
  const toast = useToast();

  // datos del entrenador desde la sesión (solo lectura)
  const [entrenadorId, setEntrenadorId] = useState(null);
  const [entrenadorName, setEntrenadorName] = useState(null);

  useEffect(() => {
    (async () => {
      const { id, displayName } = await ensureEntrenadorInfo();
      if (id) setEntrenadorId(id);
      if (displayName) setEntrenadorName(displayName);
    })();
  }, []);

  // rango default: últimos 2 meses
  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const [from, setFrom] = useState(ym(lastMonth));
  const [to, setTo] = useState(ym(today));

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

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
      ab.forEach(r => map.set(r.month, { ...r }));
      afm.forEach(r => {
        const prev = map.get(r.month) || { month: r.month, altas: 0, bajas: 0 };
        map.set(r.month, { ...prev, activos: r.activos });
      });
      setData(Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month)));
    } catch (e) {
      console.error(e);
      setErr("No pude cargar los datos de reportes.");
      toast({ title: "Error", description: "No pude cargar reportes.", status: "error" });
    } finally {
      setLoading(false);
    }
  }

  // carga inicial cuando ya tenemos el id
  useEffect(() => {
    if (entrenadorId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entrenadorId]);

  const totals = useMemo(() => {
    const altas = data.reduce((acc, r) => acc + (r.altas || 0), 0);
    const bajas = data.reduce((acc, r) => acc + (r.bajas || 0), 0);
    return [
      { name: "Altas", value: altas },
      { name: "Bajas", value: bajas },
    ];
  }, [data]);

  return (
    <Container maxW="7xl" py={8}>
      <HStack align="center" mb={4} gap={3} wrap="wrap">
        <BotonVolver />
        <Heading size="lg" color="white">Reportes y Estadísticas — Alumnos</Heading>
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
                  : (entrenadorId ? `Entrenador #${entrenadorId}` : "Sin sesión")}
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

            <Button onClick={load} isLoading={loading} bg="#258d19" color="white" isDisabled={!entrenadorId}>
              Aplicar filtros
            </Button>
          </HStack>
        </CardBody>
      </Card>

      {loading && <Center py={10}><Spinner size="xl" /></Center>}

      {!loading && err && (
        <Alert status="warning" mb={6} borderRadius="lg">
          <AlertIcon />
          {err}
        </Alert>
      )}

      {!loading && !err && (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <Card>
            <CardHeader pb={2}><Heading size="md">Altas vs Bajas por mes + Activos</Heading></CardHeader>
            <CardBody pt={0} minH="360px">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="altas" name="Altas" />
                  <Bar dataKey="bajas" name="Bajas" />
                  <Line type="monotone" dataKey="activos" name="Activos fin de mes" />
                </BarChart>
              </ResponsiveContainer>
              {data.length === 0 && <Text mt={2}>No hay datos en el período seleccionado.</Text>}
            </CardBody>
          </Card>

          <Card>
            <CardHeader pb={2}><Heading size="md">Distribución (torta) — Altas vs Bajas</Heading></CardHeader>
            <CardBody pt={0} minH="360px">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={totals} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {totals.map((_, i) => <Cell key={i} />)}
                  </Pie>
                  <Tooltip /><Legend />
                </PieChart>
              </ResponsiveContainer>
              <Text mt={2}>
                Total Altas: <b>{totals[0]?.value || 0}</b> — Total Bajas: <b>{totals[1]?.value || 0}</b>
              </Text>
            </CardBody>
          </Card>
        </SimpleGrid>
      )}
    </Container>
  );
}
