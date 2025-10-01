// src/pages/Turnos/RegistrarTurno.jsx
import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  Select,
  Heading,
  Text,
  VStack,
  Spinner,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";

import { crearTurno, listarAlumnos, listarTiposTurno } from "/src/services/turnos.servicio.js";

export default function RegistrarTurno() {
  const [alumno, setAlumno] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [tipo, setTipo] = useState("");
  const [cupo, setCupo] = useState(1);

  const [alumnos, setAlumnos] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [alRes, ttRes] = await Promise.all([
          listarAlumnos(),
          listarTiposTurno(),
        ]);
        setAlumnos(alRes.data || []);
        setTipos(ttRes.data || []);
      } catch (e) {
        console.error("Error inicial cargando combos:", e);
        setError("No se pudieron cargar alumnos/tipos de turno");
      }
    })();
  }, []);

  useEffect(() => {
    const sel = tipos.find((t) => t.id_tipoturno === Number(tipo));
    if (sel && sel.nombre?.toLowerCase() === "individual") setCupo(1);
  }, [tipo, tipos]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMsg("");

    if (!alumno || !tipo || !fecha || !hora) {
      setError("Todos los campos son obligatorios");
      return;
    }

    const fechaHora = new Date(`${fecha}T${hora}:00`);
    if (fechaHora < new Date()) {
      setError("No se permiten turnos en fechas anteriores");
      return;
    }

    const payload = {
      fecha: fechaHora.toISOString(),
      alumno: { id_alumno: Number(alumno) },
      entrenador: { id_entrenador: 1 },
      tipoTurno: { id_tipoturno: Number(tipo) },
      estado: { id_estado: 3 }, // Pendiente
      cupo: Number(cupo),
    };

    try {
      setLoading(true);
      await crearTurno(payload);
      setMsg("Turno registrado con éxito ✅");
    } catch (err) {
      console.error("Error al registrar turno:", err);
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
          <VStack spacing={5}>
            <FormControl isRequired>
              <FormLabel>Alumno</FormLabel>
              <Select
                placeholder="Seleccione un alumno"
                value={alumno}
                onChange={(e) => setAlumno(e.target.value)}
              >
                {alumnos.map((a) => (
                  <option key={a.id_alumno} value={a.id_alumno}>
                    {a.nombre} {a.apellido}
                  </option>
                ))}
              </Select>
            </FormControl>

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

            {tipo &&
              tipos.find((t) => t.id_tipoturno === Number(tipo))?.nombre?.toLowerCase() === "grupal" && (
                <FormControl isRequired>
                  <FormLabel>Cupo</FormLabel>
                  <Input
                    type="number"
                    min="2"
                    value={cupo}
                    onChange={(e) => setCupo(e.target.value)}
                  />
                </FormControl>
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
