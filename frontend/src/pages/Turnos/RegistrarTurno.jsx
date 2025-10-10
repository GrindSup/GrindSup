import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  Select,
  Heading,
  VStack,
  Alert,
  AlertIcon,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  Text,
  Divider,
} from "@chakra-ui/react";

// Asegurate que tu servicio tenga estas funciones y que
// listarTiposTurno llame a /api/tipos-turno (con guion)
import {
  crearTurno,          // (payload) => POST /api/turnos
  asignarAlumnos,      // (turnoId, idsArray) => POST /api/turnos/{id}/alumnos
  listarAlumnos,       // GET /api/alumnos
  listarTiposTurno,    // GET /api/tipos-turno
} from "/src/services/turnos.servicio.js";

export default function RegistrarTurno() {
  const [alumnos, setAlumnos] = useState([]);
  const [tipos, setTipos] = useState([]);

  // selección actual (para el selector + botón “Agregar”)
  const [alumnoAAgregar, setAlumnoAAgregar] = useState("");

  // lista local de alumnos seleccionados para este turno
  const [seleccionados, setSeleccionados] = useState([]); // array de ids (number)

  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [tipo, setTipo] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  // cargar combos
  useEffect(() => {
    (async () => {
      try {
        const [alRes, ttRes] = await Promise.all([listarAlumnos(), listarTiposTurno()]);
        setAlumnos(alRes.data || []);
        setTipos(ttRes.data || []);
      } catch (e) {
        console.error(e);
        setError("No se pudieron cargar alumnos/tipos de turno");
      }
    })();
  }, []);

  const tipoSel = useMemo(
    () => tipos.find((t) => t.id_tipoturno === Number(tipo)),
    [tipo, tipos]
  );
  const esGrupal = (tipoSel?.nombre || "").toLowerCase() === "grupal";
  const esIndividual = (tipoSel?.nombre || "").toLowerCase() === "individual";

  // si cambia a individual, asegurá máximo 1 alumno
  useEffect(() => {
    if (esIndividual && seleccionados.length > 1) {
      setSeleccionados((prev) => (prev.length ? [prev[0]] : []));
    }
  }, [esIndividual]); // eslint-disable-line

  // utilidades
  const nombreCompleto = (a) => `${a.nombre ?? ""} ${a.apellido ?? ""}`.trim();
  const findAlumno = (id) => alumnos.find((x) => x.id_alumno === id);

  const handleAgregarAlumno = () => {
    if (!alumnoAAgregar) return;

    const idNum = Number(alumnoAAgregar);
    if (Number.isNaN(idNum)) return;

    // evitar duplicados
    if (seleccionados.includes(idNum)) {
      setError("Ese alumno ya está en la lista");
      return;
    }

    if (esIndividual) {
      // para individual, dejá solo ese
      setSeleccionados([idNum]);
    } else {
      // grupal, sin tope
      setSeleccionados((prev) => [...prev, idNum]);
    }
    setAlumnoAAgregar("");
    setError("");
  };

  const handleQuitarAlumno = (id) => {
    setSeleccionados((prev) => prev.filter((x) => x !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");

    if (!tipo || !fecha || !hora) {
      setError("Fecha, hora y tipo son obligatorios");
      return;
    }

    const fechaHora = new Date(`${fecha}T${hora}:00`);
    if (Number.isNaN(fechaHora.getTime())) {
      setError("Fecha u hora inválida");
      return;
    }
    if (fechaHora < new Date()) {
      setError("No se permiten turnos en fechas anteriores");
      return;
    }

    // validaciones por tipo
    if (esIndividual) {
      if (seleccionados.length !== 1) {
        setError("En turno individual debés seleccionar 1 alumno");
        return;
      }
    } else if (esGrupal) {
      if (seleccionados.length < 2) {
        setError("En turno grupal debés seleccionar al menos 2 alumnos");
        return;
      }
    } else {
      setError("Tipo de turno inválido");
      return;
    }

    // payload de creación (sin alumnos)
    const payload = {
      entrenadorId: 1, // TODO: reemplazar con id real si tenés auth
      tipoTurnoId: Number(tipo),
      fecha: fechaHora.toISOString(),
      estadoId: 3, // pendiente
    };

    try {
      setLoading(true);

      // 1) crear el turno vacío
      const { data: turnoCreado } = await crearTurno(payload);
      const turnoId = turnoCreado?.id_turno;
      if (!turnoId) throw new Error("El backend no devolvió id_turno");

      // 2) asignar alumnos (si hay)
      if (seleccionados.length > 0) {
        await asignarAlumnos(turnoId, seleccionados);
      }

      setMsg("Turno registrado con éxito ✅");
      // reset
      setAlumnoAAgregar("");
      setSeleccionados([]);
      setFecha("");
      setHora("");
      setTipo("");
    } catch (err) {
      console.error(err);
      setError("Error al registrar turno ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="lg" py={10}>
      <Box p={8} borderWidth="1px" borderRadius="2xl" boxShadow="lg" bg="white">
        <Heading size="lg" textAlign="center" mb={6} color="brand.600">
          Registrar Turno
        </Heading>

        <form onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">
            <FormControl isRequired>
              <FormLabel>Fecha</FormLabel>
              <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Hora</FormLabel>
              <Input type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Tipo de turno</FormLabel>
              <Select
                placeholder="Seleccione tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
              >
                {tipos.map((t) => (
                  <option key={t.id_tipoturno} value={t.id_tipoturno}>
                    {t.nombre}
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* Sección de alumnos */}
            {!!tipo && (
              <Box>
                <Text fontWeight="semibold" mb={2}>
                  {esIndividual ? "Alumno" : "Alumnos suscriptos al turno"}
                </Text>

                {/* Selector + botón Agregar */}
                <HStack spacing={3} mb={3}>
                  <Select
                    placeholder={esIndividual ? "Seleccione un alumno" : "Buscar/seleccionar alumno"}
                    value={alumnoAAgregar}
                    onChange={(e) => setAlumnoAAgregar(e.target.value)}
                  >
                    {alumnos.map((a) => (
                      <option key={a.id_alumno} value={a.id_alumno}>
                        {nombreCompleto(a)} {/* podés sumar DNI si querés */}
                      </option>
                    ))}
                  </Select>
                  <Button onClick={handleAgregarAlumno} variant="solid">
                    + Agregar
                  </Button>
                </HStack>

                {/* Chips de seleccionados */}
                {seleccionados.length > 0 ? (
                  <HStack spacing={2} wrap="wrap">
                    {seleccionados.map((id) => {
                      const a = findAlumno(id);
                      return (
                        <Tag key={id} size="md" borderRadius="full" variant="subtle" colorScheme="teal">
                          <TagLabel>{a ? nombreCompleto(a) : `ID ${id}`}</TagLabel>
                          <TagCloseButton onClick={() => handleQuitarAlumno(id)} />
                        </Tag>
                      );
                    })}
                  </HStack>
                ) : (
                  <Text fontSize="sm" color="gray.500">
                    {esIndividual
                      ? "Seleccioná 1 alumno."
                      : "Aún no hay alumnos agregados. Agregá al menos 2."}
                  </Text>
                )}

                {esGrupal && (
                  <>
                    <Divider my={4} />
                    <Text fontSize="sm" color="gray.600">
                      Podés crear el turno con algunos alumnos y sumar más luego desde el detalle.
                    </Text>
                  </>
                )}
              </Box>
            )}

            {error && (
              <Alert status="error">
                <AlertIcon />
                {error}
              </Alert>
            )}
            {msg && (
              <Alert status="success">
                <AlertIcon />
                {msg}
              </Alert>
            )}

            <Button
              type="submit"
              colorScheme="brand"
              width="full"
              isLoading={loading}
              loadingText="Guardando..."
            >
              Guardar turno
            </Button>
          </VStack>
        </form>
      </Box>
    </Container>
  );
}
