// ListaRutinas.jsx

import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Text,
  Tag,
  Spacer,
  Icon,
  Center,
  Spinner,
  Alert,
  AlertIcon,
  Select,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  // <-- CAMBIO 1: Importar Collapse para el "Ver más"
  Collapse,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useNavigate, useParams } from "react-router-dom";
// <-- CAMBIO 1: Importar ícono para el spinner
import { MdFitnessCenter } from "react-icons/md";

import rutinasService from "../../services/rutinas.servicio";
import planesService from "../../services/planes.servicio";
import axiosInstance from "../../config/axios.config";
import { ensureEntrenadorId } from "../../context/auth";
import BotonVolver from "../../components/BotonVolver.jsx";

// <-- CAMBIO 1: Componente de Card separado para manejar su propio estado de expansión
function RutinaCard({
  rutina,
  esVistaGlobal,
  onCopiar,
  onEditar,
  onExportar,
  onEliminar,
  onGoDetalle,
  onIrAlPlan,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const idRutina = rutina.id_rutina ?? rutina.id;
  const planId = rutina.__planId ?? null;

  const descripcionLarga = (rutina.descripcion?.length || 0) > 120; // Límite para mostrar "Ver más"

  const handleToggleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <Card
      key={idRutina}
      h="100%"
      bg="white"
      borderRadius="2xl"
      boxShadow="md"
      _hover={{ boxShadow: "xl", transform: "translateY(-2px)" }}
      transition="all .18s ease"
      onClick={() => onGoDetalle(planId, idRutina)}
      cursor="pointer"
      size="sm" // Hacemos la card un poco más compacta
    >
      <CardHeader pb={2}>
        <Heading size="md" noOfLines={1} color="gray.900">
          {rutina.nombre ?? "Sin título"}
        </Heading>
      </CardHeader>

      <CardBody pt={0}>
        <HStack spacing={2} mb={3} wrap="wrap">
          {/* La dificultad se muestra siempre */}
          {!!rutina.dificultad && (
            <Tag colorScheme="purple" borderRadius="full">
              {rutina.dificultad}
            </Tag>
          )}

          {/* Si es vista de plan, mostrar el alumno si lo tiene */}
          {!esVistaGlobal && !!rutina.__alumno && (
            <Tag colorScheme="green" borderRadius="full">
              {rutina.__alumno}
            </Tag>
          )}
        </HStack>

        {/* --- Lógica de "Ver más" --- */}
        <Collapse startingHeight={50} in={isExpanded}>
          <Text color="gray.700" whiteSpace="pre-wrap">
            {rutina.descripcion || (esVistaGlobal ? "Sin descripción." : "")}
          </Text>
        </Collapse>
        {descripcionLarga && (
          <Button
            size="sm"
            variant="link"
            colorScheme="blue"
            onClick={handleToggleExpand}
            mt={1}
          >
            {isExpanded ? "Ver menos" : "Ver más..."}
          </Button>
        )}
        {/* --- Fin Lógica de "Ver más" --- */}
      </CardBody>

      <Spacer />

      <CardFooter>
        <HStack spacing={3} wrap="wrap">
          <Button
            size="sm"
            variant="outline"
            borderRadius="full"
            onClick={(e) => {
              e.stopPropagation();
              onEditar(planId, idRutina);
            }}
          >
            Editar
          </Button>

          <Button
            size="sm"
            variant="outline"
            borderRadius="full"
            onClick={(e) => {
              e.stopPropagation();
              onExportar(idRutina, rutina.nombre);
            }}
          >
            Exportar PDF
          </Button>

          <Button
            size="sm"
            bg="#258d19"
            color="white"
            borderRadius="full"
            onClick={(e) => {
              e.stopPropagation();
              onEliminar(planId, idRutina, rutina.nombre);
            }}
          >
            Eliminar
          </Button>

          {/* Botón "Ir al plan" SOLO si NO es vista global */}
          {!esVistaGlobal && planId && (
            <Button
              size="sm"
              variant="outline"
              borderRadius="full"
              onClick={(e) => {
                e.stopPropagation();
                onIrAlPlan(planId);
              }}
            >
              Ir al plan
            </Button>
          )}

          {/* Botón "Agregar a plan" SOLO si ES vista global */}
          {esVistaGlobal && (
            <Button
              size="sm"
              bg="blue.500"
              color="white"
              _hover={{ bg: "blue.600" }}
              borderRadius="full"
              onClick={(e) => {
                e.stopPropagation();
                onCopiar(rutina);
              }}
            >
              Agregar a plan
            </Button>
          )}
        </HStack>
      </CardFooter>
    </Card>
  );
}

export default function ListaRutinas() {
  const navigate = useNavigate();
  const toast = useToast();
  const { idPlan: idPlanFromUrl } = useParams();

  const [rutinas, setRutinas] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [planSel, setPlanSel] = useState("");
  const [entrenadorId, setEntrenadorId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [rutinaParaCopiar, setRutinaParaCopiar] = useState(null);
  const [planDestino, setPlanDestino] = useState("");

  useEffect(() => {
    (async () => {
      const id = await ensureEntrenadorId();
      if (id) setEntrenadorId(id);
    })();
  }, []);

  useEffect(() => {
    // <-- CAMBIO: Se saca la condición !idPlanFromUrl
    // Ahora necesitamos el entrenadorId incluso si estamos en la vista de un plan,
    // para poder cargar la lista de planes en el modal.
    if (!entrenadorId) return;

    (async () => {
      try {
        setLoading(true);

        const ps = await planesService.listAll(entrenadorId);
        setPlanes(ps);

        let data = [];
        if (idPlanFromUrl) {
          const r = await axiosInstance.get(`/api/planes/${idPlanFromUrl}/rutinas`);
          data = Array.isArray(r.data) ? r.data : [];
        } else {
          const r = await axiosInstance.get("/api/rutinas", {
            params: { entrenadorId, all: 1 },
          });
          data = Array.isArray(r.data) ? r.data : [];
        }

        const enrich = data.map((r) => {
          const planId = r.planId ?? r.plan?.id_plan ?? r.id_plan ?? null;
          const plan = (ps || []).find(
            (p) => String(p.id_plan ?? p.id) === String(planId)
          );
          const alumno = plan?.alumno
            ? [plan.alumno?.nombre, plan.alumno?.apellido].filter(Boolean).join(" ")
            : null;
          return { ...r, __planId: planId, __alumno: alumno };
        });

        setRutinas(enrich);
        setPlanSel(idPlanFromUrl ? String(idPlanFromUrl) : "");
        setError("");
      } catch (err) {
        console.error(err);
        setError("No pude cargar las rutinas.");
        setRutinas([]);
      } finally {
        setLoading(false);
      }
    })();
    // <-- CAMBIO: idPlanFromUrl sigue como dependencia
  }, [entrenadorId, idPlanFromUrl]);

  /* ---------- FILTROS ---------- */
  const filtradas = useMemo(() => {
    const term = q.trim().toLowerCase();
    const wantPlan = String(planSel || "").trim();

    return rutinas.filter((r) => {
      const planId = String(r.__planId ?? "");
      if (wantPlan && wantPlan !== "SIN_PLAN" && planId !== wantPlan) return false;
      if (wantPlan === "SIN_PLAN" && planId) return false;

      if (!term) return true;
      const nom = (r?.nombre ?? "").toLowerCase();
      const desc = (r?.descripcion ?? "").toLowerCase();
      const alumno = (r?.__alumno ?? "").toLowerCase();
      return nom.includes(term) || desc.includes(term) || alumno.includes(term);
    });
  }, [rutinas, q, planSel]);

  /* ---------- ACCIONES ---------- */

  const handleNuevaRutina = () => {
    if (!planSel || planSel === "SIN_PLAN") {
      navigate("/rutinas/nueva");
      return;
    }
    navigate(`/planes/${planSel}/rutinas/nueva`);
  };

  const goDetalle = (planId, idRutina) => {
    if (!planId || planId === "SIN_PLAN") navigate(`/rutinas/${idRutina}`);
    else navigate(`/planes/${planId}/rutinas/${idRutina}`);
  };

  const goEditar = (planId, idRutina) => {
    if (!planId || planId === "SIN_PLAN") navigate(`/rutinas/${idRutina}/editar`);
    else navigate(`/planes/${planId}/rutinas/${idRutina}/editar`);
  };

  const exportPdf = async (idRutina, nombre) => {
    // ... (Tu lógica de exportar) ...
    toast({ title: "PDF exportado (simulado)", status: "success" });
  };

  const handleEliminar = async (planId, idRutina, nombre) => {
    // ... (Tu lógica de eliminar) ...
    toast({ title: "Rutina eliminada (simulado)", status: "success" });
  };

  const handleOpenCopiarModal = (rutina) => {
    setRutinaParaCopiar(rutina);
    setPlanDestino("");
    onOpen();
  };

  const handleConfirmarCopia = async () => {
    if (!rutinaParaCopiar || !planDestino) {
      toast({ title: "Por favor, seleccioná un plan", status: "warning" });
      return;
    }

    const idRutinaBase = rutinaParaCopiar.id_rutina ?? rutinaParaCopiar.id;

    try {
      await rutinasService.copiarEnPlan(planDestino, idRutinaBase);
      toast({ title: "Rutina copiada al plan", status: "success" });
      onClose();
      setRutinaParaCopiar(null);
    } catch (err) {
      console.error(err);
      toast({
        title: "No se pudo copiar la rutina",
        description: "Es posible que la rutina ya exista en ese plan.",
        status: "error",
      });
    }
  };

  const esVistaGlobal = !idPlanFromUrl;

  /* ---------- UI ---------- */
  return (
    <Container maxW="7xl" py={10}>
      {/* Header */}
      <HStack justify="space-between" align="center" mb={6} wrap="wrap" gap={4}>
        <HStack spacing={3}>
          <BotonVolver />
          <Heading size="lg" color="white">
            Rutinas
          </Heading>
        </HStack>

        <HStack spacing={3}>
          <Select
            value={planSel}
            onChange={(e) => setPlanSel(e.target.value)}
            bg="white"
            minW="260px"
            borderRadius="full"
            placeholder={planes.length ? "Seleccioná plan…" : "No hay planes"}
          >
            <option value="">Todas las rutinas</option>
            <option value="SIN_PLAN">Sin plan (Plantilla)</option>
            {planes.map((p) => (
              <option key={p.id_plan ?? p.id} value={p.id_plan ?? p.id}>
                {/* <-- CAMBIO 3: Mostrar objetivo en lugar de alumno */}
                {p.objetivo || `Plan #${p.id_plan ?? p.id}`}
              </option>
            ))}
          </Select>

          <InputGroup w={{ base: "100%", md: "360px" }}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.500" />
            </InputLeftElement>
            <Input
              placeholder="Buscar por nombre, descripción..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              borderRadius="full"
              bg="white"
            />
          </InputGroup>

          <Button
            onClick={handleNuevaRutina}
            bg="#258d19"
            color="white"
            borderRadius="full"
            minWidth="150px"
          >
            + Nueva rutina
          </Button>
        </HStack>
      </HStack>

      {/* Estado de carga / error */}
      {loading && (
        <Center py={10}>
          <Spinner size="xl" />
        </Center>
      )}

      {!loading && error && (
        <Alert status="warning" borderRadius="lg">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {/* Sin resultados */}
      {!loading && !error && filtradas.length === 0 && (
        <Center py={10}>
          <Box
            textAlign="center"
            bg="white"
            p={10}
            borderRadius="2xl"
            boxShadow="lg"
            maxW="lg"
          >
            <Icon as={MdFitnessCenter} boxSize={12} color="gray.400" mb={3} />
            <Heading size="md" mb={2} color="gray.800">
              No hay rutinas
            </Heading>
            <Text color="gray.600" mb={5}>
              No existen rutinas o no coinciden con el filtro.
            </Text>
            <Button
              onClick={handleNuevaRutina}
              bg="#258d19"
              color="white"
              borderRadius="full"
            >
              Cargar nueva
            </Button>
          </Box>
        </Center>
      )}

      {/* Listado */}
      {!loading && !error && filtradas.length > 0 && (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={7}>
          {filtradas.map((r) => (
            // <-- CAMBIO 1: Usar el nuevo componente de Card
            <RutinaCard
              key={r.id_rutina ?? r.id}
              rutina={r}
              esVistaGlobal={esVistaGlobal}
              onCopiar={handleOpenCopiarModal}
              onEditar={goEditar}
              onExportar={exportPdf}
              onEliminar={handleEliminar}
              onGoDetalle={goDetalle}
              onIrAlPlan={(pid) => navigate(`/planes/${pid}`)}
            />
          ))}
        </SimpleGrid>
      )}

      {/* Modal para copiar rutina a un plan */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent bg="white">
          <ModalHeader>Copiar Rutina a un Plan</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={2}>
              Vas a copiar la rutina:{" "}
              <strong>{rutinaParaCopiar?.nombre}</strong>
            </Text>
            <Text mb={4}>Por favor, seleccioná el plan de destino:</Text>
            <Select
              placeholder="Seleccioná un plan..."
              value={planDestino}
              onChange={(e) => setPlanDestino(e.target.value)}
            >
              {planes.map((p) => (
                // <-- CAMBIO 3: Mostrar el 'objetivo' del plan
                <option key={p.id_plan ?? p.id} value={p.id_plan ?? p.id}>
                  {p.objetivo || `Plan #${p.id_plan ?? p.id}`}
                </option>
              ))}
            </Select>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button
              bg="#258d19"
              color="white"
              _hover={{ bg: "#1e7214" }}
              onClick={handleConfirmarCopia}
              isDisabled={!planDestino}
            >
              Confirmar Copia
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}
