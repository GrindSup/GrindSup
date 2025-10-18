import { useEffect, useState } from "react";
import {
  Box, Button, Container, Heading, VStack, HStack, FormControl, FormLabel,
  Select, Textarea, Input, useToast, Alert, AlertIcon
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { planesService } from "../../services/planes.servicio";
import { alumnosService } from "../../services/alumnos.servicio";
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

  useEffect(() => {
    (async () => {
      try {
        setLoadingAlumnos(true);
        const data = await alumnosService.listAll(); // GET /api/alumnos
        setAlumnos(Array.isArray(data) ? data : []);
        setErrorAlumnos("");
      } catch {
        setErrorAlumnos("No pude cargar alumnos. Verificá el backend /api/alumnos.");
      } finally {
        setLoadingAlumnos(false);
      }
    })();
  }, []);

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

    try {
      setLoading(true);
      const payload = {
        idAlumno: Number(idAlumno),
        objetivo: objetivo?.trim() || "",
        fechaInicio,      // yyyy-mm-dd
        fechaFin: fechaFin || null,
      };
      const nuevo = await planesService.create(payload); // POST /api/planes
      toast({ title: "Plan creado", status: "success" });
      navigate(`/planes/${nuevo?.id_plan ?? ""}`);
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
        <Heading size="lg" color="gray.900">Agregar nuevo plan</Heading>
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

          <HStack justify="flex-end" pt={2}>
            <Button variant="ghost" onClick={() => navigate(-1)}>Cancelar</Button>
            <Button type="submit" isLoading={loading} bg="#0f4d11ff" color="white">
              Guardar plan
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Container>
  );
}
