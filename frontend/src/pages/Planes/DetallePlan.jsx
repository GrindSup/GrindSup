// frontend/src/pages/Planes/DetallePlan.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Box, Button, Container, Heading, HStack, Text, Tag, Alert, AlertIcon,
  Skeleton, VStack, Accordion, AccordionItem, AccordionButton, AccordionPanel,
  AccordionIcon, Badge, Icon, Center, useToast
} from "@chakra-ui/react";
import { MdTimer } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import { planesService } from "../../services/planes.servicio";
import rutinasService from "../../services/rutinas.servicio";
import { ensureEntrenadorId } from "../../context/auth";
import axiosInstance from "../../config/axios.config";
import BotonVolver from "../../components/BotonVolver";

const fmtFecha = (d) => (d ? String(d).slice(0, 10) : "—");

export default function DetallePlan() {
  const { idPlan } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [plan, setPlan] = useState(null);
  const [rutinas, setRutinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [detalles, setDetalles] = useState({}); // { [idRutina]: detalle }
  const [cargandoDetalles, setCargandoDetalles] = useState(false);

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

  // 👉 Prefetch de detalles para calcular duración SIN abrir acordeón
  useEffect(() => {
    if (!rutinas?.length) return;
    (async () => {
      try {
        setCargandoDetalles(true);
        const pares = await Promise.allSettled(
          rutinas.map(async (r) => {
            const idRutina = r.id_rutina ?? r.id;
            const det = await rutinasService.obtenerDetalleRutina(idPlan, idRutina);
            return [idRutina, det];
          })
        );
        const map = {};
        for (const r of pares) {
          if (r.status === "fulfilled") {
            const [id, det] = r.value;
            map[id] = det;
          }
        }
        setDetalles(map);
      } finally {
        setCargandoDetalles(false);
      }
    })();
  }, [rutinas, idPlan]);

  const alumnoNombre = useMemo(() => {
    if (!plan?.alumno) return "—";
    return [plan.alumno.nombre, plan.alumno.apellido].filter(Boolean).join(" ") || "—";
  }, [plan]);

  // mantiene lazy-load si querés abrir manualmente (ya tenemos prefetch igual)
  const onExpand = async (idRutina) => {
    if (detalles[idRutina]) return;
    try {
      const det = await rutinasService.obtenerDetalleRutina(idPlan, idRutina);
      if (det) setDetalles((prev) => ({ ...prev, [idRutina]: det }));
    } catch {}
  };

  const goNuevaRutina = () => navigate(`/planes/${idPlan}/rutinas/nueva`);
  const goDetalleRutina = (idRutina) => navigate(`/planes/${idPlan}/rutinas/${idRutina}`);
  const goEditarPlan = () => navigate(`/planes/${idPlan}/editar`);
  const goEditarRutina = (idRutina) => navigate(`/planes/${idPlan}/rutinas/${idRutina}/editar`);

  const handleDeleteRutina = async (idRutina) => {
    if (!confirm("¿Eliminar esta rutina? Esta acción no se puede deshacer.")) return;
    const prev = rutinas;
    setRutinas((r) => r.filter((x) => (x.id_rutina ?? x.id) !== idRutina));
    const ok = await rutinasService.remove(idPlan, idRutina);
    if (ok) {
      toast({ title: "Rutina eliminada", status: "success" });
      setDetalles((d) => {
        const cp = { ...d }; delete cp[idRutina]; return cp;
      });
    } else {
      setRutinas(prev);
      toast({ title: "No se pudo eliminar", status: "error" });
    }
  };

  const exportPdf = async (idRutina, nombre) => {
    try {
      const resp = await axiosInstance.get(`/api/rutinas/${idRutina}/exportar`, { responseType: "blob" });
      const blob = new Blob([resp.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const safe = String(nombre || `rutina_${idRutina}`).replace(/\s+/g, "_");
      a.href = url; a.download = `${safe}.pdf`; document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      toast({ title: "PDF exportado", status: "success" });
    } catch {
      toast({ title: "No se pudo exportar el PDF", status: "error" });
    }
  };

  return (
    <Container maxW="7xl" py={8}>
      <HStack mb={4} gap={3} wrap="wrap" justify="space-between">
        <HStack gap={3}>
          <BotonVolver />
          <Heading size="lg" color="white">Plan N°{idPlan}</Heading>
        </HStack>
        <HStack gap={2}>
          {/* ✅ Editar plan ahora navega a /planes/:idPlan/editar */}
          <Button variant="solid" onClick={goEditarPlan} bg="#258d19" color="white">Editar plan</Button>
          <Button bg="#258d19" color="white" onClick={goNuevaRutina}>Agregar rutina</Button>
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

          <Heading size="md" mb={3} color="white">Rutinas del plan</Heading>

          {rutinas.length === 0 ? (
            <Center bg="white" p={10} borderRadius="2xl" boxShadow="md">
              <VStack>
                <Text color="gray.700">Este plan todavía no tiene rutinas.</Text>
                <Button mt={2} onClick={goNuevaRutina} bg="#258d19" color="white">Crear primera rutina</Button>
              </VStack>
            </Center>
          ) : (
            <Accordion allowToggle>
              {rutinas.map((r) => {
                const idRutina = r.id_rutina ?? r.id;
                const det = detalles[idRutina];
                return (
                  <AccordionItem key={idRutina} bg="white" borderRadius="xl" mb={3} boxShadow="sm" overflow="hidden">
                    <>
                      <h2>
                        <AccordionButton px={5} onClick={() => onExpand(idRutina)}>
                          <Box as="span" flex="1" textAlign="left" py={2}>
                            <Heading size="sm" color="gray.900">{r.nombre || `Rutina #${idRutina}`}</Heading>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                      </h2>

                      <HStack px={5} pt={2} pb={1} justify="flex-end" gap={2}>
                        <Button size="sm" variant="outline" onClick={() => goDetalleRutina(idRutina)}>Ver detalle</Button>
                        {/* ✅ Editar rutina ahora navega a /planes/:idPlan/rutinas/:idRutina/editar */}
                        <Button size="sm" variant="outline" onClick={() => goEditarRutina(idRutina)}>Editar</Button>
                        <Button size="sm" onClick={() => exportPdf(idRutina, r.nombre)} bg="#258d19" color="white">Exportar PDF</Button>
                        <Button size="sm" colorScheme="red" onClick={() => handleDeleteRutina(idRutina)} bg="#258d19" color="white">Eliminar</Button>
                      </HStack>

                      <AccordionPanel pb={4} px={5}>
                        {!det ? (
                          <Text color="gray.500">Cargando ejercicios…</Text>
                        ) : det.ejercicios?.length ? (
                          <VStack align="stretch" spacing={2}>
                            {det.ejercicios.map((it, idx) => (
                              <Box key={idx} p={3} borderRadius="md" border="1px solid" borderColor="gray.200">
                                <Text fontWeight="semibold">{it?.ejercicio?.nombre ?? it?.ejercicio?.id ?? "Ejercicio"}</Text>
                                <Text fontSize="sm" color="gray.600">
                                  Series: {it.series} · Reps: {it.repeticiones}
                                </Text>
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
