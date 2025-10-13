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
import { SearchIcon, CalendarIcon, AddIcon } from "@chakra-ui/icons";
import { listarTurnos } from "../../services/turnos.servicio.js";
import { ensureEntrenadorId } from "../../context/auth.js";
import BotonVolver from "../../components/BotonVolver.jsx";

function getTurnoEntrenadorId(t) {
  return (
    t?.entrenador?.id_entrenador ??
    t?.entrenador?.id ??
    t?.id_entrenador ??
    t?.idEntrenador ??
    t?.entrenadorId ??
    t?.entrenador_id ??
    null
  );
}

export default function ListaTurnos() {
  const navigate = useNavigate();

  const [entrenadorId, setEntrenadorId] = useState(null);
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Inicializamos vacío para ver todos (pasados y futuros)
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [tipo, setTipo] = useState("");
  const [q, setQ] = useState("");

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
        // usa /api/turnos/entrenador/{id}
        const { data } = await listarTurnos(id, {
          desde: desde || undefined,
          hasta: hasta || undefined,
          tipo: tipo || undefined,
        });

        const rows = Array.isArray(data) ? data : [];
        setTurnos(rows);
      } catch {
        setTurnos([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [desde, hasta, tipo]);

  const normalizarTipo = (t) =>
    (t?.nombre ?? t?.tipo ?? t ?? "").toString().trim().toLowerCase();

  const view = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return turnos.filter((t) => {
      if (!needle) return true;

      const alumnos = Array.isArray(t.alumnos)
        ? t.alumnos.map((a) => `${a.nombre ?? ""} ${a.apellido ?? ""}`.trim()).join(" ")
        : t.alumnosNombres ?? "";

      // t.entrenador llega como string desde el backend
      const entrenadorNombre = t?.entrenador ?? "";

      const tipoStr = normalizarTipo(t.tipoTurno ?? t.tipo_turno);

      const hay = [
        alumnos,
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
        <BotonVolver />
        <Heading size="lg" color="gray.900">
          Turnos
        </Heading>
        <Spacer />
        <Button
          leftIcon={<CalendarIcon />}
          onClick={() => navigate("/turnos/calendario")}
          bg="#38A169"
          color="white"
          isDisabled={!entrenadorId}
        >
          Calendario
        </Button>
        <Button
          leftIcon={<AddIcon />}
          onClick={() => navigate("/turnos/registrar")}
          bg="#38A169"
          color="white"
          isDisabled={!entrenadorId}
        >
          + Nuevo turno
        </Button>
      </HStack>

      <HStack gap={3} mb={4} wrap="wrap">
        <Box>
          <Text fontSize="sm" mb={1}>
            Desde
          </Text>
          <Input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        </Box>

        <Box>
          <Text fontSize="sm" mb={1}>
            Hasta
          </Text>
          <Input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </Box>

        <Box>
          <Text fontSize="sm" mb={1}>
            Tipo
          </Text>
          <Select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="">Todos</option>
            <option value="individual">Individual</option>
            <option value="grupal">Grupal</option>
          </Select>
        </Box>

        <Spacer />

        <Box minW="280px" flex="1">
          <Text fontSize="sm" mb={1}>
            Buscar
          </Text>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Alumno, entrenador, tipo…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
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
              <Th isNumeric>Acciones</Th>
            </Tr>
          </Thead>

          <Tbody>
            {!loading &&
              view.map((t) => {
                const tipoStr = normalizarTipo(t.tipoTurno ?? t.tipo_turno);
                const color = tipoStr === "grupal" ? "purple" : "teal";

                const entrenadorNombre = t?.entrenador || "—";

                const alumnosNombres = Array.isArray(t.alumnos)
                  ? t.alumnos
                      .map((a) => `${a.nombre ?? ""} ${a.apellido ?? ""}`.trim())
                      .join(", ")
                  : t.alumnosNombres ?? "—";

                return (
                  <Tr key={t.id_turno}>
                    <Td>{fmtFecha(t.fecha)}</Td>
                    <Td>{fmtHora(t.fecha)}</Td>
                    <Td>
                      <Tag size="sm" colorScheme={color}>
                        {tipoStr || "—"}
                      </Tag>
                    </Td>
                    <Td>{entrenadorNombre}</Td>
                    <Td>{alumnosNombres || "—"}</Td>
                    <Td isNumeric>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/turnos/editar/${t.id_turno}`)}
                      >
                        Editar
                      </Button>
                    </Td>
                  </Tr>
                );
              })}

            {!loading && view.length === 0 && (
              <Tr>
                <Td colSpan={6}>
                  <Text p={4} color="gray.500">
                    No hay turnos con los filtros seleccionados.
                  </Text>
                </Td>
              </Tr>
            )}

            {loading && (
              <Tr>
                <Td colSpan={6}>
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
