// src/pages/Turnos/RegistrarTurno.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Box, Button, Container, FormControl, FormLabel, Input, Select, Heading,
  VStack, Alert, AlertIcon, HStack, Tag, TagLabel, TagCloseButton, Text, Divider,
} from "@chakra-ui/react";
import { crearTurno, asignarAlumnos, listarAlumnos, listarTiposTurno } from "../../services/turnos.servicio.js";
import { getUsuario, ensureEntrenadorId } from "../../context/auth.js";

export default function RegistrarTurno() {
  const [entrenadorId, setEntrenadorId] = useState(null);

  const [alumnos, setAlumnos] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [alumnoAAgregar, setAlumnoAAgregar] = useState("");
  const [seleccionados, setSeleccionados] = useState([]);
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [tipo, setTipo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      const id = await ensureEntrenadorId();
      setEntrenadorId(id);
      if (!id) return; // sin entrenador -> mostramos cartel abajo

      try {
        const [alRes, ttRes] = await Promise.all([listarAlumnos(id), listarTiposTurno()]);
        setAlumnos(alRes.data || []);
        setTipos(ttRes.data || []);
      } catch (e) {
        setError("No se pudieron cargar alumnos/tipos de turno");
      }
    })();
  }, []);

  const tipoSel = useMemo(() => tipos.find(t => t.id_tipoturno === Number(tipo)), [tipo, tipos]);
  const esGrupal = (tipoSel?.nombre || "").toLowerCase() === "grupal";
  const esIndividual = (tipoSel?.nombre || "").toLowerCase() === "individual";

  useEffect(() => {
    if (esIndividual && seleccionados.length > 1) {
      setSeleccionados(prev => (prev.length ? [prev[0]] : []));
    }
  }, [esIndividual]);

  const nombreCompleto = (a) => `${a.nombre ?? ""} ${a.apellido ?? ""}`.trim();
  const findAlumno = (id) => alumnos.find(x => x.id_alumno === id);

  const handleAgregarAlumno = () => {
    if (!alumnoAAgregar) return;
    const idNum = Number(alumnoAAgregar);
    if (Number.isNaN(idNum)) return;
    if (seleccionados.includes(idNum)) return setError("Ese alumno ya está en la lista");
    setError("");
    setSeleccionados(esIndividual ? [idNum] : [...seleccionados, idNum]);
    setAlumnoAAgregar("");
  };

  const handleQuitarAlumno = (id) => setSeleccionados(seleccionados.filter(x => x !== id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setMsg("");

    if (!entrenadorId) return setError("Tu usuario no está vinculado a un entrenador. Configuralo primero.");

    if (!tipo || !fecha || !hora) return setError("Fecha, hora y tipo son obligatorios");

    const fechaHora = new Date(`${fecha}T${hora}:00`);
    if (Number.isNaN(fechaHora.getTime())) return setError("Fecha u hora inválida");
    if (fechaHora < new Date()) return setError("No se permiten turnos en fechas anteriores");

    if (esIndividual && seleccionados.length !== 1) return setError("En turno individual seleccioná 1 alumno");
    if (esGrupal && seleccionados.length < 2) return setError("En turno grupal agregá al menos 2 alumnos");

    const payload = { entrenadorId, tipoTurnoId: Number(tipo), fecha: fechaHora.toISOString(), estadoId: 3 };

    try {
      setLoading(true);
      const { data: turnoCreado } = await crearTurno(payload);
      const turnoId = turnoCreado?.id_turno;
      if (!turnoId) throw new Error("El backend no devolvió id_turno");

      if (seleccionados.length) await asignarAlumnos(turnoId, seleccionados);

      setMsg("Turno registrado con éxito ✅");
      setAlumnoAAgregar(""); setSeleccionados([]); setFecha(""); setHora(""); setTipo("");
    } catch (err) {
      setError(err?.response?.data?.mensaje || err?.message || "Error al registrar turno");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="lg" py={10}>
      {!entrenadorId && (
        <Alert status="warning" mb={6}>
          <AlertIcon />
          Tu usuario no está vinculado a un entrenador. Elegí uno y guardalo en localStorage: <code>localStorage.setItem("entrenadorId","1")</code>
        </Alert>
      )}

      <Box p={8} borderWidth="1px" borderRadius="2xl" boxShadow="lg" bg="white" opacity={entrenadorId ? 1 : 0.6} pointerEvents={entrenadorId ? "auto" : "none"}>
        <Heading size="lg" textAlign="center" mb={6} color="gray.900">Registrar Turno</Heading>

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
              <Select placeholder="Seleccione tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                {tipos.map(t => <option key={t.id_tipoturno} value={t.id_tipoturno}>{t.nombre}</option>)}
              </Select>
            </FormControl>

            {!!tipo && (
              <Box>
                <Text fontWeight="semibold" mb={2}>{esIndividual ? "Alumno" : "Alumnos suscriptos al turno"}</Text>
                <HStack spacing={3} mb={3}>
                  <Select placeholder={esIndividual ? "Seleccione un alumno" : "Buscar/seleccionar alumno"} value={alumnoAAgregar} onChange={(e)=>setAlumnoAAgregar(e.target.value)}>
                    {alumnos.map(a => <option key={a.id_alumno} value={a.id_alumno}>{nombreCompleto(a)}</option>)}
                  </Select>
                  <Button onClick={handleAgregarAlumno} variant="solid" bg="#0f4d11ff" color="white">+ Agregar</Button>
                </HStack>

                {seleccionados.length
                  ? <HStack spacing={2} wrap="wrap">{seleccionados.map(id => {
                      const a = findAlumno(id);
                      return (
                        <Tag key={id} size="md" borderRadius="full" variant="subtle" colorScheme="teal">
                          <TagLabel>{a ? nombreCompleto(a) : `ID ${id}`}</TagLabel>
                          <TagCloseButton onClick={() => handleQuitarAlumno(id)} />
                        </Tag>
                      );
                    })}</HStack>
                  : <Text fontSize="sm" color="gray.500">{esIndividual ? "Seleccioná 1 alumno." : "Agregá al menos 2."}</Text>}
                {esGrupal && (<><Divider my={4} /><Text fontSize="sm" color="gray.600">Podés sumar más luego desde el detalle.</Text></>)}
              </Box>
            )}

            {error && <Alert status="error"><AlertIcon/>{error}</Alert>}
            {msg && <Alert status="success"><AlertIcon/>{msg}</Alert>}

            <Button type="submit" colorScheme="brand" width="full" isLoading={loading} bg="#0f4d11ff" loadingText="Guardando...">Guardar turno</Button>
          </VStack>
        </form>
      </Box>
    </Container>
  );
}