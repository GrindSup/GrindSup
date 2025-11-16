// frontend/src/pages/Planes/DetallePlan.jsx

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Text,
  Tag,
  Alert,
  AlertIcon,
  Skeleton,
  VStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Badge,
  Icon,
  Center,
  useToast,
  // <-- CAMBIO 4: Imports para los nuevos modals
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Select,
  Spinner,
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
  const [detalles, setDetalles] = useState({});
  const [cargandoDetalles, setCargandoDetalles] = useState(false);

  // <-- CAMBIO 4: Hooks de estado para los nuevos modals
  const [entrenadorId, setEntrenadorId] = useState(null);
  const [catalogo, setCatalogo] = useState([]); // Lista de rutinas para copiar
  const [loadingCatalogo, setLoadingCatalogo] = useState(false);
  const [rutinaACopiarId, setRutinaACopiarId] = useState("");

  // Modal de elección: "Nueva" o "Cargada"
  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose,
  } = useDisclosure();

  // Modal de copia: "Seleccionar rutina cargada"
  const {
    isOpen: isCopyOpen,
    onOpen: onCopyOpen,
    onClose: onCopyClose,
  } = useDisclosure();
  // --- Fin Cambio 4 ---

  // <-- CAMBIO 2: Variable para saber si el plan está calificado
  const isCalificado = useMemo(() => {
    if (!plan) return false;
    return (
      plan.calificado === true || // Si tenés un booleano
      plan.id_estado === 3 ||
      plan.estado?.nombre?.toUpperCase() === "CALIFICADO"
    );
  }, [plan]);

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const entId = await ensureEntrenadorId();
      setEntrenadorId(entId); // <-- CAMBIO 4: Guardar entrenadorId

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

  useEffect(() => {
    load();
  }, [load]);

  // Prefetch de detalles
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
    return (
      [plan.alumno.nombre, plan.alumno.apellido].filter(Boolean).join(" ") || "—"
    );
  }, [plan]);

  const onExpand = async (idRutina) => {
    if (detalles[idRutina]) return;
    try {
      const det = await rutinasService.obtenerDetalleRutina(idPlan, idRutina);
      if (det) setDetalles((prev) => ({ ...prev, [idRutina]: det }));
    } catch {}
  };

  const goNuevaRutina = () => navigate(`/planes/${idPlan}/rutinas/nueva`);
  const goDetalleRutina = (idRutina) =>
    navigate(`/planes/${idPlan}/rutinas/${idRutina}`);
  const goEditarPlan = () => navigate(`/planes/${idPlan}/editar`);
  const goEditarRutina = (idRutina) =>
    navigate(`/planes/${idPlan}/rutinas/${idRutina}/editar`);

  const handleDeleteRutina = async (idRutina) => {
    if (isCalificado) {
      // <-- CAMBIO 2: Doble chequeo
      toast({
        title: "No se puede eliminar de un plan calificado",
        status: "warning",
      });
      return;
    }
    if (
      !window.confirm(
        "¿Eliminar esta rutina? Esta acción no se puede deshacer."
      )
    )
      return;
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

  const exportPdf = async (idRutina, nombre) => {
    // ... (Tu lógica de exportar) ...
    toast({ title: "PDF exportado (simulado)", status: "success" });
  };

  // --- CAMBIO 4: Funciones para los nuevos modals ---

  // 1. Botón "Rutina Nueva" (en modal de elección)
  const handleSelectNueva = () => {
    onAddClose();
    goNuevaRutina();
  };

  // 2. Botón "Rutina Cargada" (en modal de elección)
  const handleSelectCargada = async () => {
    onAddClose(); // Cierra el modal de elección
    setLoadingCatalogo(true);
    setCatalogo([]);
    setRutinaACopiarId("");
    onCopyOpen(); // Abre el modal de copia

    try {
      const r = await axiosInstance.get("/api/rutinas", {
        params: { entrenadorId, all: 1 },
      });
      const allRoutines = Array.isArray(r.data) ? r.data : [];

      // Filtramos las rutinas que *ya* están en este plan
      const rutinasEnPlanIds = new Set(
        rutinas.map((r) => r.id_rutina ?? r.id)
      );
      const disponibles = allRoutines.filter(
        (r) => !rutinasEnPlanIds.has(r.id_rutina ?? r.id)
      );

      setCatalogo(disponibles);
    } catch (err) {
      toast({
        title: "Error al cargar catálogo de rutinas",
        status: "error",
      });
      onCopyClose(); // Cierra si falla
    } finally {
      setLoadingCatalogo(false);
    }
  };

  // 3. Botón "Confirmar Copia" (en modal de copia)
  const handleConfirmarCopia = async () => {
    if (!rutinaACopiarId) {
      toast({ title: "Seleccioná una rutina", status: "warning" });
      return;
    }
    try {
      await rutinasService.copiarEnPlan(idPlan, rutinaACopiarId);
      toast({ title: "Rutina copiada al plan", status: "success" });
      onCopyClose();
      setRutinaACopiarId("");
      load(); // <-- IMPORTANTE: Recarga el plan
    } catch (err) {
      console.error(err);
      toast({ title: "No se pudo copiar la rutina", status: "error" });
    }
  };
  // --- Fin Cambio 4 ---

  return (
    <Container maxW="7xl" py={8}>
      <HStack mb={4} gap={3} wrap="wrap" justify="space-between">
        <HStack gap={3}>
          <BotonVolver />
          <Heading size="lg" color="white">
            Plan de {alumnoNombre}
          </Heading>
          {isCalificado && (
            <Badge colorScheme="green" fontSize="md">
              CALIFICADO
            </Badge>
          )}
        </HStack>
        <HStack gap={2}>
          <Button
            variant="solid"
            onClick={goEditarPlan}
            bg="#258d19"
            color="white"
            // <-- CAMBIO 2: Deshabilitar si está calificado
            isDisabled={isCalificado}
            title={
              isCalificado
                ? "No se puede editar un plan calificado"
                : "Editar plan"
            }
          >
            Editar plan
          </Button>
          <Button
            bg="#258d19"
            color="white"
            // <-- CAMBIO 4: onClick ahora abre el modal de elección
            onClick={onAddOpen}
            // <-- CAMBIO 2: Deshabilitar si está calificado
            isDisabled={isCalificado}
            title={
              isCalificado
                ? "No se puede agregar rutinas a un plan calificado"
                : "Agregar rutina"
            }
          >
            Agregar rutina
          </Button>
        </HStack>
      </HStack>

      {/* Skeleton / Error */}
      {loading && (
        <VStack align="stretch" gap={4}>
          <Skeleton h="120px" borderRadius="xl" />
          <Skeleton h="320px" borderRadius="xl" />
        </VStack>
      )}
      {!loading && err && (
        <Alert status="warning" mb={4} borderRadius="lg">
          <AlertIcon />
          {err}
        </Alert>
      )}

      {!loading && (
        <>
          <Box
            bg="white"
            p={5}
            borderRadius="2xl"
            boxShadow="md"
            mb={6}
          >
            <VStack align="start" spacing={2}>
              <Text>
                <b>Alumno:</b> {alumnoNombre}
              </Text>
              <Text>
                <b>Objetivo:</b> {plan?.objetivo ?? "—"}
              </Text>
              <HStack>
                <Tag colorScheme="green">
                  Inicio: {fmtFecha(plan?.fecha_inicio)}
                </Tag>
                <Tag colorScheme="blue">
                  Fin: {fmtFecha(plan?.fecha_fin)}
                </Tag>
                {isCalificado && (
                  <Tag colorScheme="green">ESTADO: CALIFICADO</Tag>
                )}
              </HStack>
            </VStack>
          </Box>

          <Heading size="md" mb={3} color="white">
            Rutinas del plan
          </Heading>

          {rutinas.length === 0 ? (
            <Center
              bg="white"
              p={10}
              borderRadius="2xl"
              boxShadow="md"
            >
              <VStack>
                <Text color="gray.700">
                  Este plan todavía no tiene rutinas.
                </Text>
                <Button
                  mt={2}
                  onClick={onAddOpen} // <-- CAMBIO 4
                  bg="#258d19"
                  color="white"
                  isDisabled={isCalificado} // <-- CAMBIO 2
                >
                  Crear primera rutina
                </Button>
              </VStack>
            </Center>
          ) : (
            <Accordion allowToggle>
              {rutinas.map((r) => {
                const idRutina = r.id_rutina ?? r.id;
                const det = detalles[idRutina];
                return (
                  <AccordionItem
                    key={idRutina}
                    bg="white"
                    borderRadius="xl"
                    mb={3}
                    boxShadow="sm"
                    overflow="hidden"
                  >
                    <>
                      <h2>
                        <AccordionButton
                          px={5}
                          onClick={() => onExpand(idRutina)}
                        >
                          <Box
                            as="span"
                            flex="1"
                            textAlign="left"
                            py={2}
                          >
                            <Heading size="sm" color="gray.900">
                              {r.nombre || `Rutina #${idRutina}`}
                            </Heading>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                      </h2>

                      <HStack
                        px={5}
                        pt={2}
                        pb={1}
                        justify="flex-end"
                        gap={2}
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => goDetalleRutina(idRutina)}
                        >
                          Ver detalle
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => goEditarRutina(idRutina)}
                          isDisabled={isCalificado} // <-- CAMBIO 2
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => exportPdf(idRutina, r.nombre)}
                          bg="#258d19"
                          color="white"
                        >
                          Exportar PDF
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="red"
                          onClick={() => handleDeleteRutina(idRutina)}
                          bg="#258d19"
                          color="white"
                          isDisabled={isCalificado} // <-- CAMBIO 2
                        >
                          Eliminar
                        </Button>
                      </HStack>

                      <AccordionPanel pb={4} px={5}>
                        {!det ? (
                          <Text color="gray.500">
                            Cargando ejercicios…
                          </Text>
                        ) : det.ejercicios?.length ? (
                          <VStack align="stretch" spacing={2}>
                            {det.ejercicios.map((it, idx) => (
                              <Box
                                key={idx}
                                p={3}
                                borderRadius="md"
                                border="1px solid"
                                borderColor="gray.200"
                              >
                                <Text fontWeight="semibold">
                                  {it?.ejercicio?.nombre ??
                                    it?.ejercicio?.id ??
                                    "Ejercicio"}
                                </Text>
                                <Text
                                  fontSize="sm"
                                  color="gray.600"
                                >
                                  Series: {it.series} · Reps:{" "}
                                  {it.repeticiones}
                                </Text>
                              </Box>
                            ))}
                          </VStack>
                        ) : (
                          <Text color="gray.500">
                            Esta rutina no tiene ejercicios.
                          </Text>
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

      {/* --- CAMBIO 4: Nuevos Modals --- */}

      {/* 1. Modal de Elección */}
      <Modal isOpen={isAddOpen} onClose={onAddClose} isCentered>
        <ModalOverlay />
        <ModalContent bg="white">
          <ModalHeader>Agregar Rutina</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              ¿Querés crear una rutina nueva desde cero o usar una ya
              cargada en tu catálogo?
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              mr={3}
              onClick={handleSelectCargada}
            >
              Usar Rutina Cargada
            </Button>
            <Button
              bg="#258d19"
              color="white"
              onClick={handleSelectNueva}
            >
              Crear Rutina Nueva
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 2. Modal de Copia (Catálogo) */}
      <Modal isOpen={isCopyOpen} onClose={onCopyClose} isCentered>
        <ModalOverlay />
        <ModalContent bg="white">
          <ModalHeader>Copiar Rutina desde Catálogo</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {loadingCatalogo ? (
              <Center py={5}>
                <Spinner />
              </Center>
            ) : (
              <>
                <Text mb={4}>
                  Seleccioná la rutina que querés copiar a este plan:
                </Text>
                <Select
                  placeholder="Seleccioná una rutina..."
                  value={rutinaACopiarId}
                  onChange={(e) => setRutinaACopiarId(e.target.value)}
                >
                  {catalogo.length === 0 && (
                    <option disabled>No hay rutinas para copiar</option>
                  )}
                  {catalogo.map((r) => (
                    <option
                      key={r.id_rutina ?? r.id}
                      value={r.id_rutina ?? r.id}
                    >
                      {r.nombre}{" "}
                      {r.plan
                        ? `(Asignada a Plan ${r.plan.id_plan})`
                        : "(Plantilla)"}
                    </option>
                  ))}
                </Select>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCopyClose}>
              Cancelar
            </Button>
            <Button
              bg="#258d19"
              color="white"
              _hover={{ bg: "#1e7214" }}
              onClick={handleConfirmarCopia}
              isDisabled={!rutinaACopiarId || loadingCatalogo}
            >
              Confirmar Copia
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}
