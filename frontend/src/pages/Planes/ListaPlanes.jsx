// frontend/src/pages/Planes/ListaPlanes.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Box, Container, Heading, HStack, Input, InputGroup, InputLeftElement,
  Button, SimpleGrid, Card, CardHeader, CardBody, CardFooter, Text, Tag,
  Center, Spinner, Alert, AlertIcon, useToast, Spacer, Badge, useDisclosure,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter, VStack, Textarea
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { ensureEntrenadorId } from "../../context/auth";
import { planesService } from "../../services/planes.servicio";
import BotonVolver from "../../components/BotonVolver.jsx";

function Star({ filled, onClick }) {
  return (
    <Button
      variant={filled ? "solid" : "outline"}
      onClick={onClick}
      size="sm"
      borderRadius="full"
      aria-label={filled ? "star-filled" : "star-empty"}
    >
      ★
    </Button>
  );
}

export default function ListaPlanes() {
  const navigate = useNavigate();
  const toast = useToast();

  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

  // estado de evaluaciones (planId -> {exists:boolean, data?:any})
  const [evalStatus, setEvalStatus] = useState({});

  // modal calificación
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [score, setScore] = useState(0);
  const [comentario, setComentario] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const entId = await ensureEntrenadorId();
        const data = await planesService.getAll(entId);
        console.log("Planes recibidos por el servicio:", data);
        if (!Array.isArray(data)) {
          setPlanes([]);
          setErr("Formato inesperado del backend en /api/planes.");
        } else {
          setPlanes(data);
        }
      } catch (e) {
        console.error("Error cargando planes:", e);
        setErr("No pude cargar los planes.");
        setPlanes([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Al tener planes finalizados, pregunto si están calificados usando .../evaluacion/count
  useEffect(() => {
    (async () => {
      const entries = {};
      const finalizados = planes.filter((p) => !!p.fecha_fin);
      for (const p of finalizados) {
        try {
          const st = await planesService.getEvaluationStatus(p.id_plan ?? p.id);
          entries[p.id_plan ?? p.id] = { exists: st.exists, data: st.data ?? null };
        } catch {
          entries[p.id_plan ?? p.id] = { exists: false, data: null };
        }
      }
      setEvalStatus(entries);
    })();
  }, [planes]);

  const filtrados = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return planes;
    return planes.filter((p) => {
      const id = String(p?.id_plan ?? p?.id ?? "").toLowerCase();
      const objetivo = (p?.objetivo ?? "").toLowerCase();
      const alumno = [p?.alumno?.nombre ?? "", p?.alumno?.apellido ?? ""]
        .join(" ")
        .toLowerCase();
      return id.includes(term) || objetivo.includes(term) || alumno.includes(term);
    });
  }, [planes, q]);

  const goNuevo = () => navigate("/planes/nuevo");
  const goDetalle = (id) => navigate(`/planes/${id}`);

  const abrirModalFinalizar = (plan) => {
    setSelectedPlan(plan);
    setScore(0);
    setComentario("");
    onOpen();
  };

  const confirmarFinalizar = async () => {
    if (!selectedPlan || score < 1 || score > 5) {
      toast({ status: "warning", title: "Elegí una calificación de 1 a 5." });
      return;
    }
    try {
      await planesService.finalizeAndRate({ plan: selectedPlan, score, comentario });
      toast({ status: "success", title: "Plan finalizado y calificado." });

      // refresco UI local:
      setPlanes((prev) =>
        prev.map((p) =>
          (p.id_plan ?? p.id) === (selectedPlan.id_plan ?? selectedPlan.id)
            ? { ...p, fecha_fin: p.fecha_fin ?? new Date().toISOString().slice(0, 10) }
            : p
        )
      );
      setEvalStatus((prev) => ({
        ...prev,
        [selectedPlan.id_plan ?? selectedPlan.id]: { exists: true, data: { score } },
      }));
      onClose();
    } catch (e) {
      console.error(e);
      toast({ status: "error", title: "No pude finalizar/calificar el plan." });
    }
  };

  return (
    <Container maxW="7xl" py={8}>
      <HStack align="center" mb={4} gap={3} wrap="wrap">
        <BotonVolver />
        <Heading size="lg" color="white">Planes</Heading>
        <Spacer />
        <InputGroup maxW="360px">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.500" />
          </InputLeftElement>
          <Input
            placeholder="Buscar (alumno, objetivo, ID)…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            bg="white"
            borderRadius="full"
          />
        </InputGroup>
        <Button onClick={goNuevo} bg="#258d19" color="white">
          Agregar nuevo plan
        </Button>
      </HStack>

      {loading && (
        <Center py={10}>
          <Spinner size="xl" />
        </Center>
      )}

      {!loading && err && (
        <Alert status="warning" mb={6} borderRadius="lg">
          <AlertIcon />
          {err}
        </Alert>
      )}

      {!loading && !err && filtrados.length === 0 && (
        <Center py={10}>
          <Box textAlign="center" bg="white" p={8} borderRadius="2xl" boxShadow="md" maxW="lg">
            <Heading size="md" mb={2} color="gray.800">No hay planes</Heading>
            <Text color="gray.600" mb={4}>
              Todavía no cargaste planes o no coinciden con el filtro.
            </Text>
            <Button onClick={goNuevo} bg="#258d19" color="white">
              Agregar nuevo plan
            </Button>
          </Box>
        </Center>
      )}

      {!loading && !err && filtrados.length > 0 && (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {filtrados.map((p) => {
            const id = p.id_plan ?? p.id;
            const alumnoNombre = [p?.alumno?.nombre, p?.alumno?.apellido].filter(Boolean).join(" ");
            const finalizado = !!p.fecha_fin;
            const evaluado = finalizado && (evalStatus[id]?.exists === true);

            return (
              <Card key={id} h="100%">
                <CardHeader pb={2}>
                  <HStack justify="space-between" align="center">
                    <Heading size="md" noOfLines={1}>Plan de {alumnoNombre}</Heading>
                    {finalizado ? (
                      evaluado ? (
                        <Badge colorScheme="green">Calificado</Badge>
                      ) : (
                        <Badge colorScheme="yellow">Pendiente de calificación</Badge>
                      )
                    ) : (
                      <Badge colorScheme="purple">En curso</Badge>
                    )}
                  </HStack>
                </CardHeader>

                <CardBody pt={0}>
                  <HStack spacing={2} mb={2} wrap="wrap">
                    {!!alumnoNombre && <Tag colorScheme="teal">{alumnoNombre}</Tag>}
                    {!!p.fecha_inicio && <Tag colorScheme="green">Inicio: {p.fecha_inicio}</Tag>}
                    {!!p.fecha_fin && <Tag colorScheme="gray">Fin: {p.fecha_fin}</Tag>}
                  </HStack>
                  <Text color="gray.700" noOfLines={3}>
                    {p.objetivo ?? "Sin objetivo especificado."}
                  </Text>
                </CardBody>

                <CardFooter justify="space-between">
                  <Button size="sm" variant="outline" onClick={() => goDetalle(id)}>
                    Ver detalle
                  </Button>

                  {finalizado ? (
                    evaluado ? (
                      <Button size="sm" isDisabled>
                        Calificado ★{evalStatus[id]?.data?.score ?? ""}
                      </Button>
                    ) : (
                      <Button size="sm" bg="#258d19" color="white" onClick={() => abrirModalFinalizar(p)}>
                        Calificar ahora
                      </Button>
                    )
                  ) : (
                    <Button size="sm" bg="#258d19" color="white" onClick={() => abrirModalFinalizar(p)}>
                      Finalizar plan
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </SimpleGrid>
      )}

      {/* Modal Calificación */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedPlan?.fecha_fin ? "Calificar plan" : "Finalizar y calificar plan"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <Box>
                <Text mb={2}>Rendimiento del alumno (1 a 5):</Text>
                <HStack>
                  {[1,2,3,4,5].map((n) => (
                    <Star key={n} filled={score >= n} onClick={() => setScore(n)} />
                  ))}
                </HStack>
              </Box>
              <Box>
                <Text mb={2}>Comentario (opcional):</Text>
                <Textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Observaciones del desempeño…"
                />
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose}>Cancelar</Button>
            <Button bg="#258d19" color="white" onClick={confirmarFinalizar}>
              Guardar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}
