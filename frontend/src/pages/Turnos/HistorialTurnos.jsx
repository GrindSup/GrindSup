// frontend/src/pages/Turnos/HistorialTurnos.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Input,
  Select,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  Tag,
  Alert,
  AlertIcon,
  Spacer,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { SearchIcon, CalendarIcon, TimeIcon, ArrowBackIcon } from "@chakra-ui/icons";
import { listarTurnos } from "../../services/turnos.servicio.js";
import { ensureEntrenadorId } from "../../context/auth.js";

function alumnosToString(alumnos, fallback = "—") {
  if (!alumnos) return fallback;
  if (Array.isArray(alumnos)) {
    if (alumnos.length === 0) return fallback;
    if (typeof alumnos[0] === "string") return alumnos.join(", ");
    const s = alumnos
      .map((a) => `${a?.nombre ?? ""} ${a?.apellido ?? ""}`.trim())
      .filter(Boolean)
      .join(", ");
    return s || fallback;
  }
  if (typeof alumnos === "string") return alumnos || fallback;
  return fallback;
}

export default function HistorialTurnos() {
  const navigate = useNavigate();

  const [entrenadorId, setEntrenadorId] = useState(null);
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);

  // filtros
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [tipo, setTipo] = useState("");
  const [q, setQ] = useState("");

  const normalizarTipo = (t) =>
    (t?.nombre ?? t?.tipo ?? t ?? "").toString().trim().toLowerCase();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const id = await ensureEntrenadorId();
      setEntrenadorId(id);

      if (!id) {
        setTurnos([]);
        setLoading(false);
        return;
      }

      try {
        const { data } = await listarTurnos(id, {
          desde: desde || undefined,
          hasta: hasta || undefined,
          tipo: tipo || undefined,
        });

        const rows = Array.isArray(data) ? data : [];
        const ahora = new Date();

        // 🔹 Sólo turnos PASADOS (fecha/hora < ahora)
        const pasados = rows.filter((t) => {
          const f = new Date(t.fecha);
          return !Number.isNaN(f.getTime()) && f < ahora;
        });

        setTurnos(pasados);
      } catch {
        setTurnos([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [desde, hasta, tipo]);

  const view = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return turnos.filter((t) => {
      if (!needle) return true;

      const alumnosStr = alumnosToString(t.alumnos ?? t.alumnosNombres, "");
      const entrenadorNombre = t?.entrenador ?? "";
      const tipoStr = normalizarTipo(t.tipoTurno ?? t.tipo_turno);

      const hay = [
        alumnosStr,
        entrenadorNombre,
        tipoStr,
        new Date(t.fecha).toLocaleDateString(),
        new Date(t.fecha).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      ]
        .join(" ")
        .toLowerCase();

      return hay.includes(needle);
    });
  }, [turnos, q]);

  const fmtFecha = (iso) => new Date(iso).toLocaleDateString();
  const fmtHora = (iso) =>
    new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <Container maxW="7xl" py={8}>
      {!entrenadorId && (
        <Alert status="warning" mb={6} borderRadius="lg">
          <AlertIcon />
          Tu usuario no está vinculado a un entrenador. Por eso no se muestran turnos.
        </Alert>
      )}

      <HStack mb={6} gap={3} wrap="wrap">
        <Button leftIcon={<ArrowBackIcon />} onClick={() => navigate("/InicioDashboard")} bg="#258d19" color="white">
          Volver
        </Button>
        <Heading size="lg" color="white">
          Historial de turnos
        </Heading>
        <Spacer />
        <Button
          leftIcon={<TimeIcon />}
          onClick={() => navigate("/turnos")}
          bg="whiteAlpha.900"
          color="#258d19"
          variant="outline"
          _hover={{
            bg: "#87c987ff",   // color cuando pasás el mouse
            color: "white",    // opcional: texto blanco
          }}
          _active={{
            bg: "#87c987ff",   // color al hacer clic
            color: "white",
          }}
          _focus={{
            bg: "#87c987ff",   // por si lo seleccionás con teclado
            color: "white",
          }}
          isDisabled={!entrenadorId}
        >
          Turnos pendientes
        </Button>
        <Button
          leftIcon={<CalendarIcon />}
          onClick={() => navigate("/turnos/calendario")}
          bg="#258d19"
          color="white"
          isDisabled={!entrenadorId}
        >
          Calendario
        </Button>
      </HStack>

      <HStack gap={3} mb={4} wrap="wrap">
        <Box>
          <Text fontSize="xm" mb={1} fontWeight="bold" color="white">
            Desde
          </Text>
          <Input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} bg="white" />
        </Box>

        <Box>
          <Text fontSize="xm" mb={1} fontWeight="bold" color="white">
            Hasta
          </Text>
          <Input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} bg="white" />
        </Box>

        <Box>
          <Text fontSize="xm" mb={1} fontWeight="bold" color="white">
            Tipo
          </Text>
          <Select value={tipo} onChange={(e) => setTipo(e.target.value)} bg="white">
            <option value="">Todos</option>
            <option value="individual">Individual</option>
            <option value="grupal">Grupal</option>
          </Select>
        </Box>

        <Spacer />

        <Box minW="280px" flex="1">
          <Text fontSize="xm" mb={1} fontWeight="bold" color="white">
            Buscar
          </Text>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.500" />
            </InputLeftElement>
            <Input
              placeholder="Alumno, entrenador, tipo…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              bg="white"
            />
          </InputGroup>
        </Box>
      </HStack>

      <Box
        borderWidth="1px"
        borderRadius="lg"
        bg="white"
        overflow="hidden"
        opacity={entrenadorId ? 1 : 0.6}
      >
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>Fecha</Th>
              <Th>Hora</Th>
              <Th>Tipo</Th>
              <Th>Entrenador</Th>
              <Th>Alumnos</Th>
            </Tr>
          </Thead>

          <Tbody>
            {!loading &&
              view.map((t) => {
                const tipoStr = normalizarTipo(t.tipoTurno ?? t.tipo_turno);
                const color = tipoStr === "grupal" ? "purple" : "teal";
                const entrenadorNombre = t?.entrenador || "—";
                const alumnosNombres = alumnosToString(t.alumnos ?? t.alumnosNombres, "—");

                return (
                  <Tr key={t.id_turno} opacity={0.85}>
                    <Td>{fmtFecha(t.fecha)}</Td>
                    <Td>{fmtHora(t.fecha)}</Td>
                    <Td>
                      <Tag size="sm" colorScheme={color} variant="subtle">
                        {tipoStr || "—"}
                      </Tag>
                    </Td>
                    <Td>{entrenadorNombre}</Td>
                    <Td>{alumnosNombres}</Td>
                  </Tr>
                );
              })}

            {!loading && view.length === 0 && (
              <Tr>
                <Td colSpan={5}>
                  <Text p={4} color="gray.500">
                    No hay turnos pasados con los filtros seleccionados.
                  </Text>
                </Td>
              </Tr>
            )}

            {loading && (
              <Tr>
                <Td colSpan={5}>
                  <Text p={4}>Cargando…</Text>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    </Container>
  );
}
