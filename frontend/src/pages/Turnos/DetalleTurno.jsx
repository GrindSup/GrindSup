import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Select,
  Tag,
  TagLabel,
  TagCloseButton,
  Alert,
  AlertIcon,
  Text,
  VStack,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Stack,
  useToast,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import {
  obtenerTurno,
  actualizarFechaTurno,
  quitarAlumnoDeTurno,
  asignarAlumnos,
  listarAlumnos,
} from "../../services/turnos.servicio.js";
import { ensureEntrenadorId } from "../../context/auth.js";

function toYMD(d) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function toHM(d) {
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}`;
}

// Normalizador de campos para soportar ambas formas del backend
const getTipoStr = (t) =>
  (t?.tipoTurno ?? t?.tipo_turno ?? t ?? "").toString().trim();
const getEntrenadorNombre = (t) =>
  // puede venir como string ("Juan") o como objeto/alias
  t?.entrenador?.nombre ??
  t?.entrenadorNombre ??
  (typeof t?.entrenador === "string" ? t.entrenador : "") ??
  "";

export default function DetalleTurno() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [turno, setTurno] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [sel, setSel] = useState(""); // id alumno a agregar (string)
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [savingFecha, setSavingFecha] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const load = async () => {
    const entrenadorId = await ensureEntrenadorId();

    // Cargo el turno siempre
    const [{ data: t }, alumnosResp] = await Promise.all([
      obtenerTurno(id),
      // Si no hay entrenadorId, no intento filtrar alumnos
      entrenadorId ? listarAlumnos(entrenadorId) : Promise.resolve({ data: [] }),
    ]);

    setTurno(t);
    setAlumnos(alumnosResp?.data || []);

    const d = new Date(t.fecha);
    setFecha(toYMD(d));
    setHora(toHM(d));
  };

  useEffect(() => {
    (async () => {
      try {
        await load();
      } catch (e) {
        console.error(e);
        setError("No se pudo cargar el turno");
      }
    })();
  }, [id]);

  const handleAgregar = async () => {
    setError("");
    setMsg("");

    const aid = Number(sel);
    if (!aid) return;

    // ya existe?
    const yaEsta = (turno.alumnos || []).some((x) => x.id_alumno === aid);
    if (yaEsta) {
      setError("Ese alumno ya está agregado a este turno");
      return;
    }

    // si es individual, máximo 1 (validación de UX, el backend también valida)
    const esIndividual = getTipoStr(turno).toLowerCase() === "individual";
    if (esIndividual && (turno.alumnos?.length ?? 0) >= 1) {
      setError("Los turnos individuales solo admiten un alumno");
      return;
    }

    try {
      await asignarAlumnos(id, [aid]);
      await load();
      setSel("");
      setMsg("Alumno agregado");
    } catch (e) {
      console.error(e);
      setError("No se pudo agregar el alumno. " + (e.response?.data || ""));
    }
  };

  const handleQuitar = async (aid) => {
    setError("");
    setMsg("");
    try {
      await quitarAlumnoDeTurno(id, aid);
      await load();
      setMsg("Alumno quitado");
    } catch (e) {
      console.error(e);
      setError("No se pudo quitar el alumno. " + (e.response?.data || ""));
    }
  };

  const handleGuardarFecha = async () => {
    setError("");
    setMsg("");

    try {
      if (!fecha || !hora) {
        setError("Fecha y hora son obligatorias");
        return;
      }

      // Construyo un Date con la hora local seleccionada
      const local = new Date(`${fecha}T${hora}:00`);
      if (Number.isNaN(local.getTime())) {
        setError("Fecha u hora inválida");
        return;
      }

      // Envío al backend en ISO UTC (Z). OffsetDateTime lo acepta perfecto.
      const isoUTC = local.toISOString();

      setSavingFecha(true);
      await actualizarFechaTurno(id, isoUTC); // backend espera un ISO string
      await load();
      toast({ title: "Fecha actualizada", status: "success", duration: 2000 });
    } catch (e) {
      console.error(e);
      setError("No se pudo actualizar la fecha. " + (e.response?.data || ""));
    } finally {
      setSavingFecha(false);
    }
  };

  if (!turno) return null;

  const d = new Date(turno.fecha);
  const entrenadorNombre = getEntrenadorNombre(turno);
  const tipoStr = getTipoStr(turno);

  return (
    <Container maxW="3xl" py={8}>
      <HStack justify="space-between" mb={4}>
        <Heading size="lg" color="gray.900">
          Detalle del turno
        </Heading>
        <Button
          variant="solid"
          onClick={() => navigate("/turnos")}
          bg="#38A169"
          color="white"
        >
          Volver
        </Button>
      </HStack>

      <Box p={5} borderWidth="1px" borderRadius="lg" bg="white" mb={5}>
        <VStack align="start" spacing={2} mb={4}>
          <Text>
            <b>Tipo:</b> {tipoStr || "—"}
          </Text>
          <Text>
            <b>Entrenador:</b> {entrenadorNombre || "—"}
          </Text>
          <Text>
            <b>Fecha actual:</b>{" "}
            {d.toLocaleDateString()}{" "}
            {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>
        </VStack>

        <Stack direction={{ base: "column", md: "row" }} spacing={4} mb={4}>
          <FormControl>
            <FormLabel>Nueva fecha</FormLabel>
            <Input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Nueva hora</FormLabel>
            <Input
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
            />
          </FormControl>
          <FormControl alignSelf="end">
            <Button onClick={handleGuardarFecha} isLoading={savingFecha}>
              Guardar fecha
            </Button>
          </FormControl>
        </Stack>

        <Divider my={4} />

        <Text fontWeight="semibold" mb={2}>
          Alumnos
        </Text>
        <HStack spacing={2} wrap="wrap" mb={3}>
          {(turno.alumnos || []).map((a) => (
            <Tag key={a.id_alumno} size="md" borderRadius="full" colorScheme="teal">
              <TagLabel>
                {`${a.nombre ?? ""}${a.apellido ? " " + a.apellido : ""}`}
              </TagLabel>
              <TagCloseButton onClick={() => handleQuitar(a.id_alumno)} />
            </Tag>
          ))}
        </HStack>

        <HStack>
          <Select
            placeholder="Agregar alumno…"
            value={sel}
            onChange={(e) => setSel(e.target.value)}
            w="280px"
          >
            {alumnos.map((a) => (
              <option key={a.id_alumno} value={a.id_alumno}>
                {`${a.nombre ?? ""} ${a.apellido ?? ""}`.trim()}
              </option>
            ))}
          </Select>
          <Button onClick={handleAgregar}>Agregar</Button>
        </HStack>

        {error && (
          <Alert status="error" mt={4}>
            <AlertIcon />
            {error}
          </Alert>
        )}
        {msg && (
          <Alert status="success" mt={4}>
            <AlertIcon />
            {msg}
          </Alert>
        )}
      </Box>
    </Container>
  );
}
