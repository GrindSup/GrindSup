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
  Stack,
  Checkbox,        // 🔹 NUEVO
} from "@chakra-ui/react";
import {
  crearTurno,
  asignarAlumnos,
  listarAlumnos,
  listarTiposTurno,
} from "../../services/turnos.servicio.js";
import { ensureEntrenadorId } from "../../context/auth.js";
import { useNavigate } from "react-router-dom";

export default function RegistrarTurno() {
  const navigate = useNavigate();
  const [entrenadorId, setEntrenadorId] = useState(null);

  const [alumnos, setAlumnos] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [alumnoAAgregar, setAlumnoAAgregar] = useState("");
  const [seleccionados, setSeleccionados] = useState([]);
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [tipo, setTipo] = useState("");

  // 🔹 NUEVO: turno fijo
  const [esFijo, setEsFijo] = useState(false);
  const [hastaFechaFija, setHastaFechaFija] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  // 🚀 NUEVO: Calcula la fecha de hoy en formato YYYY-MM-DD para usar como mínimo
  const minDate = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    // Los meses de JS van de 0 a 11, por eso sumamos 1
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  useEffect(() => {
    (async () => {
      const id = await ensureEntrenadorId();
      setEntrenadorId(id);
      if (!id) return;

      try {
        const [alRes, ttRes] = await Promise.all([
          listarAlumnos(id),
          listarTiposTurno(),
        ]);

        setAlumnos(alRes.data || []);
        setTipos(ttRes.data || []);
      } catch {
        setError("No se pudieron cargar alumnos o tipos de turno.");
      }
    })();
  }, []);

  const tipoSel = useMemo(
    () => tipos.find((t) => t.id_tipoturno === Number(tipo)),
    [tipo, tipos]
  );

  const esGrupal = (tipoSel?.nombre || "").toLowerCase() === "grupal";
  const esIndividual = (tipoSel?.nombre || "").toLowerCase() === "individual";

  useEffect(() => {
    if (esIndividual && seleccionados.length > 1) {
      setSeleccionados((prev) => (prev.length ? [prev[0]] : []));
    }
  }, [esIndividual]);

  const nombreCompleto = (a) =>
    `${a.nombre ?? ""} ${a.apellido ?? ""}`.trim();
  const findAlumno = (id) => alumnos.find((x) => x.id_alumno === id);

  const handleAgregarAlumno = () => {
    if (!alumnoAAgregar) return;
    const idNum = Number(alumnoAAgregar);
    if (Number.isNaN(idNum)) return;
    if (seleccionados.includes(idNum)) {
      return setError("Ese alumno ya está en la lista");
    }

    setError("");
    setSeleccionados(
      esIndividual ? [idNum] : [...seleccionados, idNum]
    );
    setAlumnoAAgregar("");
  };

  const handleQuitarAlumno = (id) =>
    setSeleccionados(seleccionados.filter((x) => x !== id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");

    if (!entrenadorId)
      return setError("Tu usuario no está vinculado a un entrenador.");

    if (!tipo || !fecha || !hora)
      return setError("Fecha, hora y tipo son obligatorios.");

    const fechaHora = new Date(`${fecha}T${hora}:00`);
    if (Number.isNaN(fechaHora.getTime()))
      return setError("Fecha u hora inválida.");
    if (fechaHora < new Date())
      return setError("No se permiten turnos en fechas anteriores.");

    if (esIndividual && seleccionados.length !== 1)
      return setError("En turno individual seleccioná 1 alumno.");

    if (esGrupal && seleccionados.length < 2)
      return setError("En turno grupal agregá al menos 2 alumnos.");

    // 🔹 Validaciones extra para turno fijo
    let fechas = [fechaHora];
    if (esFijo) {
      if (!hastaFechaFija)
        return setError("Indicá hasta qué fecha se repetirá el turno fijo.");

      const fin = new Date(`${hastaFechaFija}T23:59:59`);
      if (Number.isNaN(fin.getTime()))
        return setError("Fecha fin de turno fijo inválida.");
      if (fin < fechaHora)
        return setError(
          "La fecha fin del turno fijo debe ser posterior a la fecha de inicio."
        );

      // Generar fechas semanales
      fechas = [];
      const actual = new Date(fechaHora);
      while (actual <= fin) {
        fechas.push(new Date(actual));
        actual.setDate(actual.getDate() + 7);
      }
    }

    try {
      setLoading(true);

      const userId =
        localStorage.getItem("gs_user_id") ||
        localStorage.getItem("userId") ||
        undefined;

      // función que crea un turno + asigna alumnos
      const crearUno = async (f) => {
        const payload = {
          entrenadorId,
          tipoTurnoId: Number(tipo),
          fecha: f.toISOString(),
          estadoId: 3,
        };

        const { data: turnoCreado } = await crearTurno(payload, { userId });
        const turnoId = turnoCreado?.id_turno;
        if (!turnoId) throw new Error("El backend no devolvió id_turno");

        if (seleccionados.length) {
          await asignarAlumnos(turnoId, seleccionados);
        }
      };

      // 🔹 Si es fijo, crea varios turnos; si no, sólo uno
      for (const f of fechas) {
        await crearUno(f);
      }

      setMsg(
        esFijo
          ? `Turno fijo creado con ${fechas.length} sesiones ✅`
          : "Turno registrado con éxito ✅"
      );
      setAlumnoAAgregar("");
      setSeleccionados([]);
      setFecha("");
      setHora("");
      setTipo("");
      setEsFijo(false);
      setHastaFechaFija("");
    } catch (err) {
      setError(
        err?.response?.data?.mensaje ||
          err?.message ||
          "Error al registrar turno"
      );
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate("/turnos");
  };

  return (
    <Container maxW="lg" py={10}>
      {!entrenadorId && (
        <Alert status="warning" mb={6}>
          <AlertIcon />
          Tu usuario no está vinculado a un entrenador.
        </Alert>
      )}

      <Box
        p={8}
        borderWidth="1px"
        borderRadius="2xl"
        boxShadow="lg"
        bg="white"
        opacity={entrenadorId ? 1 : 0.6}
        pointerEvents={entrenadorId ? "auto" : "none"}
      >
        <Heading size="lg" textAlign="center" mb={6} color="gray.900">
          Registrar Turno
        </Heading>

        <form onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">
            <FormControl isRequired>
              <FormLabel>Fecha</FormLabel>
              <Input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                min={minDate}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Hora</FormLabel>
              <Input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
              />
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

            {/* 🔹 Sección turno fijo */}
            <FormControl>
              <Checkbox
                isChecked={esFijo}
                onChange={(e) => setEsFijo(e.target.checked)}
              >
                Turno fijo semanal (misma hora y día)
              </Checkbox>

              {esFijo && (
                <Box mt={3}>
                  <FormLabel fontSize="sm">Repetir hasta</FormLabel>
                  <Input
                    type="date"
                    value={hastaFechaFija}
                    onChange={(e) => setHastaFechaFija(e.target.value)}
                    min={minDate}
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Se crearán turnos cada semana con la fecha y hora elegidas.
                  </Text>

                  {/* 🚨 TEXTO DE ADVERTENCIA AGREGADO AQUÍ */}
                  <Text fontSize="sm" color="orange.600" mt={2} fontWeight="medium">
                    ⚠️ La creación de múltiples sesiones puede tardar unos segundos.
                  </Text>
                  {/* 🚨 FIN TEXTO DE ADVERTENCIA */}
                </Box>
              )}
            </FormControl>

            {!!tipo && (
              <Box>
                <Text fontWeight="semibold" mb={2}>
                  {esIndividual ? "Alumno" : "Alumnos suscriptos al turno"}
                </Text>

                <HStack spacing={3} mb={3}>
                  <Select
                    placeholder={
                      esIndividual
                        ? "Seleccione un alumno"
                        : "Buscar alumno"
                    }
                    value={alumnoAAgregar}
                    onChange={(e) => setAlumnoAAgregar(e.target.value)}
                  >
                    {alumnos.map((a) => (
                      <option key={a.id_alumno} value={a.id_alumno}>
                        {nombreCompleto(a)}
                      </option>
                    ))}
                  </Select>

                  <Button
                    onClick={handleAgregarAlumno}
                    variant="solid"
                    bg="#258d19"
                    color="white"
                  >
                    + Agregar
                  </Button>
                </HStack>

                {seleccionados.length ? (
                  <HStack spacing={2} wrap="wrap">
                    {seleccionados.map((id) => {
                      const a = findAlumno(id);
                      return (
                        <Tag
                          key={id}
                          size="md"
                          borderRadius="full"
                          variant="subtle"
                          colorScheme="teal"
                        >
                          <TagLabel>
                            {a ? nombreCompleto(a) : `ID ${id}`}
                          </TagLabel>
                          <TagCloseButton
                            onClick={() => handleQuitarAlumno(id)}
                          />
                        </Tag>
                      );
                    })}
                  </HStack>
                ) : (
                  <Text fontSize="sm" color="gray.500">
                    {esIndividual
                      ? "Seleccioná 1 alumno."
                      : "Agregá al menos 2."}
                  </Text>
                )}

                {esGrupal && (
                  <>
                    <Divider my={4} />
                    <Text fontSize="sm" color="gray.600">
                      Podés sumar más luego desde el detalle.
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
                <Alert status="success" flexDirection="column" alignItems="flex-start">
                    <HStack w="full">
                        <AlertIcon />
                        {/* El mensaje de éxito ahora se muestra dentro de un Text */}
                        <Text flex="1">{msg}</Text>
                    </HStack>
                    {/* Nuevo Botón */}
                    <Button
                        mt={3} // Margen superior para separarlo del mensaje
                        onClick={() => navigate("/turnos/calendario")}
                        colorScheme="teal"
                        size="sm"
                        alignSelf="flex-end" // Alinea el botón a la derecha dentro del Alert
                    >
                        Ir al calendario
                    </Button>
                </Alert>
            )}

            <Stack
              direction={{ base: "column", md: "row" }}
              spacing={4}
              mt={4}
              justify="center"
            >
              <Button
                type="submit"
                isLoading={loading}
                loadingText="Guardando..."
                px={10}
                bg="#258d19"
                color="white"
              >
                Guardar turno
              </Button>

              <Button variant="ghost" onClick={goBack}>
                Cancelar
              </Button>
            </Stack>
          </VStack>
        </form>
      </Box>
    </Container>
  );
}
