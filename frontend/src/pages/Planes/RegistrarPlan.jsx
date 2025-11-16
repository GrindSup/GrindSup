import { useEffect, useState } from "react";
import { 
  Box, Button, Container, Heading, VStack, HStack, FormControl, FormLabel,
  Select, Textarea, Input, useToast, Alert, AlertIcon, Text, RadioGroup, Radio, Stack
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { planesService } from "../../services/planes.servicio";
import { alumnosService } from "../../services/alumno.js";
import rutinasService from "../../services/rutinas.servicio";
import { ensureEntrenadorId } from "../../context/auth";
import axiosInstance from "../../config/axios.config.js";
import BotonVolver from "../../components/BotonVolver.jsx";

export default function RegistrarPlan() {
  const navigate = useNavigate();
  const toast = useToast();

  const [alumnos, setAlumnos] = useState([]);
  const [idAlumno, setIdAlumno] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingAlumnos, setLoadingAlumnos] = useState(true);
  const [errorAlumnos, setErrorAlumnos] = useState("");
  const [entrenadorId, setEntrenadorId] = useState(null);
  const [rutinasDisponibles, setRutinasDisponibles] = useState([]);
  const [loadingRutinas, setLoadingRutinas] = useState(true);
  const [errorRutinas, setErrorRutinas] = useState("");
  const [rutinaModo, setRutinaModo] = useState("ninguna");
  const [rutinaSeleccionada, setRutinaSeleccionada] = useState("");

  const cargarRutinas = async (entId) => {
    try {
      setLoadingRutinas(true);
      const r = await axiosInstance.get("/api/rutinas", { params: { entrenadorId: entId } });
      setRutinasDisponibles(Array.isArray(r.data) ? r.data : []);
      setErrorRutinas("");
    } catch (err) {
      setRutinasDisponibles([]);
      setErrorRutinas("No pude cargar las rutinas disponibles.");
    } finally {
      setLoadingRutinas(false);
    }
  };

  // ✅ Cargar alumnos del entrenador de la sesión
  useEffect(() => {
    (async () => {
      try {
        setLoadingAlumnos(true);
        const entId = await ensureEntrenadorId();
        if (!entId) {
          setAlumnos([]);
          setErrorAlumnos("No pude identificar al entrenador en la sesión.");
          return;
        }
        setEntrenadorId(entId);
        // Intenta endpoints comunes y hace fallback en el servicio
        const data = await alumnosService.listarPorEntrenador(entId);
        setAlumnos(Array.isArray(data) ? data : []);
        setErrorAlumnos("");
        cargarRutinas(entId);
      } catch {
        setErrorAlumnos("No pude cargar alumnos del entrenador. Verificá el backend.");
      } finally {
        setLoadingAlumnos(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (rutinaModo !== "existente") {
      setRutinaSeleccionada("");
    }
  }, [rutinaModo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!idAlumno) {
      toast({ title: "Seleccioná un alumno", status: "warning" });
      return;
    }
    if (!fechaInicio) {
      toast({ title: "Ingresá fecha de inicio", status: "warning" });
      return;
    }
    if (fechaFin && fechaFin < fechaInicio) {
      toast({ title: "La fecha fin no puede ser anterior a la fecha inicio", status: "warning" });
      return;
    }
    if (rutinaModo === "existente" && !rutinaSeleccionada) {
      toast({ title: "Elegí la rutina a copiar", status: "warning" });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        idAlumno: Number(idAlumno),
        objetivo: objetivo?.trim() || "",
        fechaInicio,          // yyyy-mm-dd
        fechaFin: fechaFin || null,
      };
      const nuevo = await planesService.create(payload); // POST /api/planes
      const planId = nuevo?.id_plan ?? nuevo?.id;

      if (rutinaModo === "nueva" && planId) {
        toast({ title: "Plan creado", description: "Ahora podés cargar la primera rutina", status: "success" });
        navigate(`/planes/${planId}/rutinas/nueva`);
        return;
      }

      if (rutinaModo === "existente" && planId && rutinaSeleccionada) {
        try {
          await rutinasService.copiarEnPlan(planId, Number(rutinaSeleccionada));
          toast({ title: "Plan y rutina listos", status: "success" });
        } catch (err) {
          toast({
            title: "Plan creado, pero no pude copiar la rutina",
            description: err?.response?.data?.message || err.message,
            status: "warning"
          });
        }
        navigate(`/planes/${planId}`);
        return;
      }

      toast({ title: "Plan creado", status: "success" });
      navigate(`/planes/${planId ?? ""}`);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.mensaje ||
        "No se pudo crear el plan.";
      toast({ title: "Error", description: msg, status: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <HStack mb={4} spacing={3}>
        <BotonVolver />
        <Heading size="lg" color="white">Agregar nuevo plan</Heading>
      </HStack>

      <Box as="form" onSubmit={handleSubmit} bg="white" p={6} borderRadius="2xl" boxShadow="lg">
        {errorAlumnos && (
          <Alert status="warning" mb={4}>
            <AlertIcon />
            {errorAlumnos}
          </Alert>
        )}

        <VStack align="stretch" spacing={5}>
          <FormControl isRequired isDisabled={loadingAlumnos}>
            <FormLabel>Alumno</FormLabel>
            <Select
              placeholder={loadingAlumnos ? "Cargando..." : "Seleccioná un alumno"}
              value={idAlumno}
              onChange={(e) => setIdAlumno(e.target.value)}
            >
              {alumnos.map(a => (
                <option key={a.id_alumno ?? a.id} value={a.id_alumno ?? a.id}>
                  {[a?.nombre, a?.apellido].filter(Boolean).join(" ") || `Alumno #${a.id_alumno ?? a.id}`}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Objetivo</FormLabel>
            <Textarea
              placeholder="Ej: Hipertrofia, mejorar resistencia, etc."
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
            />
          </FormControl>

          <HStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Fecha inicio</FormLabel>
              <Input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
            </FormControl>
            <FormControl>
              <FormLabel>Fecha fin</FormLabel>
              <Input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
            </FormControl>
          </HStack>

          <Box w="100%" borderTop="1px" borderColor="gray.100" pt={4}>
            <Heading size="sm" mb={3}>Rutinas iniciales</Heading>
            <RadioGroup value={rutinaModo} onChange={setRutinaModo}>
              <Stack direction={{ base: "column", md: "row" }} spacing={4}>
                <Radio value="ninguna">Solo crear el plan</Radio>
                <Radio value="nueva" isDisabled={!entrenadorId}>Crear una nueva rutina después de guardar</Radio>
                <Radio
                  value="existente"
                  isDisabled={loadingRutinas || rutinasDisponibles.length === 0}
                >
                  Copiar una rutina existente
                </Radio>
              </Stack>
            </RadioGroup>
            {rutinaModo === "existente" && (
              <FormControl mt={3} isDisabled={loadingRutinas}>
                <FormLabel>Rutina guardada</FormLabel>
                <Select
                  placeholder={loadingRutinas ? "Cargando..." : (rutinasDisponibles.length ? "Seleccioná una rutina" : "No tenés rutinas guardadas")}
                  value={rutinaSeleccionada}
                  onChange={(e) => setRutinaSeleccionada(e.target.value)}
                >
                  {rutinasDisponibles.map((r) => (
                    <option key={r.id_rutina ?? r.id} value={r.id_rutina ?? r.id}>
                      {(r.nombre ?? "Rutina")} {r.plan?.alumno ? `— ${r.plan.alumno.nombre}` : ""}
                    </option>
                  ))}
                </Select>
                {errorRutinas && (
                  <Text mt={2} fontSize="sm" color="red.500">{errorRutinas}</Text>
                )}
              </FormControl>
            )}
          </Box>

          <HStack justify="flex-end" pt={2}>
            <Button variant="ghost" onClick={() => navigate(-1)}>Cancelar</Button>
            <Button type="submit" isLoading={loading} bg="#258d19" color="white">
              Guardar plan
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Container>
  );
}
