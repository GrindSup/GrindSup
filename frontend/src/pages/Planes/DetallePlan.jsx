// frontend/src/pages/Planes/DetallePlan.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Box, Button, Container, Heading, HStack, Text, Tag, Alert, AlertIcon,
  Skeleton, VStack, Accordion, AccordionItem, AccordionButton, AccordionPanel,
  AccordionIcon, Badge, Icon, Center, useToast, Spacer
} from "@chakra-ui/react";
import { MdTimer } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import { planesService } from "../../services/planes.servicio";
import { rutinasService } from "../../services/rutinas.servicio";
import { ensureEntrenadorId } from "../../context/auth";
import axiosInstance from "../../config/axios.config";
import BotonVolver from "../../components/BotonVolver";

function fmtFecha(d) {
  if (!d) return "—";
  return String(d).slice(0, 10);
}
function calcRutinaDurationSecs(detalle) {
  if (!detalle?.ejercicios || !Array.isArray(detalle.ejercicios)) return 0;
  let total = 0;
  for (const it of detalle.ejercicios) {
    const series = Number(it.series ?? 0);
    const reps = Number(it.repeticiones ?? 0);
    const rest = Number(it.descanso_segundos ?? 0);
    total += series * (reps * 2 + rest);
  }
  return total;
}
function humanizeSecs(s) {
  if (!s || s <= 0) return "—";
  const m = Math.floor(s / 60), r = s % 60;
  if (m >= 60) return `≈ ${Math.floor(m / 60)}h ${m % 60}m`;
  return `≈ ${m}m ${r}s`;
}

export default function DetallePlan() {
  const { idPlan } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [plan, setPlan] = useState(null);
  const [rutinas, setRutinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [detalles, setDetalles] = useState({}); // { [idRutina]: detalle }

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const entId = await ensureEntrenadorId();
      const [p, rs] = await Promise.all([
        planesService.getById(idPlan, entId),
        rutinasService.listByPlan(idPlan),
      ]);
      if (!p) setErr("No se pudo cargar el plan.");
      setPlan(p);
      setRutinas(Array.isArray(rs) ? rs : []);
    } catch {
      setErr("No se pudo cargar el plan.");
      setPlan(null);
      setRutinas([]);
    } finally {
      setLoading(false);
    }
  }, [idPlan]);

  useEffect(() => { load(); }, [load]);

  const alumnoNombre = useMemo(() => {
    if (!plan?.alumno) return "—";
    return [plan.alumno.nombre, plan.alumno.apellido].filter(Boolean).join(" ") || "—";
  }, [plan]);

  const onExpand = async (idRutina) => {
    if (detalles[idRutina]) return;
    try {
      const det = await rutinasService.obtenerDetalleRutina(idPlan, idRutina);
      if (det) setDetalles((prev) => ({ ...prev, [idRutina]: det }));
    } catch {}
  };

  const goNuevaRutina = () => navigate(`/planes/${idPlan}/rutinas/nueva`);
  const goDetalleRutina = (idRutina) => navigate(`/planes/${idPlan}/rutinas/${idRutina}`);

  const handleDeleteRutina = async (idRutina) => {
    if (!confirm("¿Eliminar esta rutina? Esta acción no se puede deshacer.")) return;

    const prev = rutinas;
    setRutinas((r) => r.filter((x) => (x.id_rutina ?? x.id) !== idRutina));

    const ok = await rutinasService.remove(idPlan, idRutina);
    if (ok) {
      toast({ title: "Rutina eliminada", status: "success" });
      setDetalles((d) => {
        const cp = { ...d };
        delete cp[idRutina];
        return cp;
      });
    } else {
      setRutinas(prev);
      toast({ title: "No se pudo eliminar", status: "error" });
    }
  };

  // ---- Exportar PDF (usa endpoint backend GET /api/rutinas/{id}/exportar) ----
  const exportPdf = async (idRutina, nombre) => {
    try {
      const resp = await axiosInstance.get(`/api/rutinas/${idRutina}/exportar`, {
        responseType: "blob",
      });
      const blob = new Blob([resp.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const safe = String(nombre || `rutina_${idRutina}`).replace(/\s+/g, "_");
      a.href = url;
      a.download = `${safe}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast({ title: "PDF exportado", status: "success" });
    } catch (e) {
      console.error(e);
      toast({ title: "No se pudo exportar el PDF", status: "error" });
    }
  };

  return (
    <Container maxW="7xl" py={8}>
      <HStack mb={4} gap={3} wrap="wrap" justify="space-between">
        <HStack gap={3}>
          <BotonVolver />
          <Heading size="lg" color="gray.900">Plan #{idPlan}</Heading>
        </HStack>
        <HStack gap={2}>
          <Button variant="outline" onClick={() => navigate(`/planes/${idPlan}/editar`)}>Editar plan</Button>
          <Button bg="#0f4d11ff" color="white" onClick={goNuevaRutina}>Agregar rutina</Button>
        </HStack>
      </HStack>

      {loading && (
        <VStack align="stretch" gap={4}>
          <Skeleton h="120px" borderRadius="xl" />
          <Skeleton h="320px" borderRadius="xl" />
        </VStack>
      )}

      {!loading && err && (
        <Alert status="warning" mb={4} borderRadius="lg"><AlertIcon />{err}</Alert>
      )}

      {!loading && (
        <>
          <Box bg="white" p={5} borderRadius="2xl" boxShadow="md" mb={6}>
            <VStack align="start" spacing={2}>
              <Text><b>Alumno:</b> {alumnoNombre}</Text>
              <Text><b>Objetivo:</b> {plan?.objetivo ?? "—"}</Text>
              <HStack>
                <Tag colorScheme="green">Inicio: {fmtFecha(plan?.fecha_inicio)}</Tag>
                <Tag colorScheme="blue">Fin: {fmtFecha(plan?.fecha_fin)}</Tag>
              </HStack>
            </VStack>
          </Box>

          <Heading size="md" mb={3} color="gray.900">Rutinas del plan</Heading>

          {rutinas.length === 0 ? (
            <Center bg="white" p={10} borderRadius="2xl" boxShadow="md">
              <VStack>
                <Text color="gray.700">Este plan todavía no tiene rutinas.</Text>
                <Button mt={2} onClick={goNuevaRutina} bg="#0f4d11ff" color="white">Crear primera rutina</Button>
              </VStack>
            </Center>
          ) : (
            <Accordion allowToggle>
              {rutinas.map((r) => {
                const idRutina = r.id_rutina ?? r.id;
                const det = detalles[idRutina];
                const secs = det ? calcRutinaDurationSecs(det) : 0;
                return (
                  <AccordionItem key={idRutina} bg="white" borderRadius="xl" mb={3} boxShadow="sm" overflow="hidden">
                    <>
                      <h2>
                        <AccordionButton px={5} onClick={() => onExpand(idRutina)}>
                          <Box as="span" flex="1" textAlign="left" py={2}>
                            <Heading size="sm" color="gray.900">{r.nombre || `Rutina #${idRutina}`}</Heading>
                            <HStack mt={1} gap={3}>
                              {r.dificultad && <Badge colorScheme="purple">{r.dificultad}</Badge>}
                              <HStack><Icon as={MdTimer} /><Text fontSize="sm">{det ? humanizeSecs(secs) : "…"}</Text></HStack>
                            </HStack>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                      </h2>

                      <HStack px={5} pt={2} pb={1} justify="flex-end" gap={2}>
                        <Button size="sm" variant="outline" onClick={() => goDetalleRutina(idRutina)}>Ver detalle</Button>
                        <Button size="sm" variant="outline" onClick={() => navigate(`/planes/${idPlan}/rutinas/${idRutina}/editar`)}>Editar</Button>
                        <Button size="sm" onClick={() => exportPdf(idRutina, r.nombre)} colorScheme="green">Exportar PDF</Button>
                        <Button size="sm" colorScheme="red" onClick={() => handleDeleteRutina(idRutina)}>Eliminar</Button>
                      </HStack>

                      <AccordionPanel pb={4} px={5}>
                        {!det ? (
                          <Text color="gray.500">Cargando ejercicios…</Text>
                        ) : det.ejercicios?.length ? (
                          <VStack align="stretch" spacing={2}>
                            {det.ejercicios.map((it, idx) => (
                              <Box key={idx} p={3} borderRadius="md" border="1px solid" borderColor="gray.200">
                                <Text fontWeight="semibold">{it?.ejercicio?.nombre ?? it?.ejercicio?.id ?? "Ejercicio"}</Text>
                                <Text fontSize="sm" color="gray.600">Series: {it.series} · Reps: {it.repeticiones} · Descanso: {it.descanso_segundos}s</Text>
                              </Box>
                            ))}
                          </VStack>
                        ) : (
                          <Text color="gray.500">Esta rutina no tiene ejercicios.</Text>
                        )}
                      </AccordionPanel>
                    </>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </>
      )}
    </Container>
  );
}
