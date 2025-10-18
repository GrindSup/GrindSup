// src/pages/Rutinas/ListaRutinas.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Box, Button, Container, Heading, HStack, Input, InputGroup, InputLeftElement,
  SimpleGrid, Card, CardHeader, CardBody, CardFooter, Text, Tag, Spacer, Icon,
  Center, Spinner, Alert, AlertIcon, Select
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { MdFitnessCenter } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import { ensureEntrenadorId } from "../../context/auth";
import axiosInstance from "../../config/axios.config";
import { planesService } from "../../services/planes.servicio";
import BotonVolver from "../../components/BotonVolver.jsx";

export default function ListaRutinas() {
  const navigate = useNavigate();
  const { idPlan: idPlanFromUrl } = useParams();

  const [rutinas, setRutinas] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [planSel, setPlanSel] = useState(""); // para "Nueva rutina"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [entrenadorId, setEntrenadorId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        // Selector de planes (para botón "Nueva rutina")
        const allPlans = await planesService.listAll();
        setPlanes(Array.isArray(allPlans) ? allPlans : []);

        // Si hay plan por URL, lo usamos como seleccionado por defecto; sino tomamos el last o el primero
        if (idPlanFromUrl) {
          setPlanSel(String(idPlanFromUrl));
          localStorage.setItem("lastPlanId", String(idPlanFromUrl));
        } else {
          const last = localStorage.getItem("lastPlanId");
          const fallback =
            last && Number(last) > 0
              ? String(last)
              : (allPlans[0]?.id_plan ?? allPlans[0]?.id ?? "");
          if (fallback) setPlanSel(String(fallback));
        }

        // ID entrenador (para endpoints por entrenador)
        const idEnt = await ensureEntrenadorId();
        setEntrenadorId(idEnt);

        // Intentos de endpoints para listar rutinas
        let res = await tryGet(`/api/rutinas?entrenadorId=${idEnt}`);
        if (!res.ok && idEnt) res = await tryGet(`/api/entrenadores/${idEnt}/rutinas`);
        if (!res.ok && idPlanFromUrl) res = await tryGet(`/api/planes/${idPlanFromUrl}/rutinas`);

        if (res.ok) {
          const data = Array.isArray(res.data) ? res.data : [];
          setRutinas(data);
          setError("");
        } else {
          setRutinas([]);
          setError("No encontré un endpoint para listar rutinas del entrenador/plan.");
        }
      } catch (e) {
        setRutinas([]);
        setError(e?.message || "Error al cargar rutinas.");
      } finally {
        setLoading(false);
      }
    })();
  }, [idPlanFromUrl]);

  async function tryGet(url) {
    try {
      const r = await axiosInstance.get(url);
      return { ok: true, data: r.data };
    } catch {
      return { ok: false, data: [] };
    }
  }

  const filtradas = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rutinas;
    return rutinas.filter((r) => {
      const nom = (r?.nombre ?? "").toLowerCase();
      const obj = (r?.objetivo ?? "").toLowerCase();
      const dif = (r?.dificultad ?? "").toLowerCase();
      return nom.includes(term) || obj.includes(term) || dif.includes(term);
    });
  }, [rutinas, q]);

  const handleNuevaRutina = () => {
    if (!planSel) {
      // si no hay planes aún
      setError("No hay planes disponibles para asociar la nueva rutina.");
      return;
    }
    localStorage.setItem("lastPlanId", String(planSel));
    navigate(`/planes/${planSel}/rutinas/nueva`);
  };

  return (
    <Container maxW="7xl" py={10}>
      <HStack justify="space-between" align="center" mb={6} wrap="wrap" gap={4}>
        <HStack spacing={3}>
          <BotonVolver />
          <Heading size="lg" color="gray.900">Rutinas</Heading>
        </HStack>

        <HStack spacing={3}>
          {/* Selector de Plan para "Nueva rutina" */}
          <Select
            value={planSel}
            onChange={(e) => setPlanSel(e.target.value)}
            bg="white"
            minW="220px"
            placeholder={planes.length ? "Seleccioná plan…" : "No hay planes"}
          >
            {planes.map((p) => (
              <option key={p.id_plan ?? p.id} value={p.id_plan ?? p.id}>
                #{p.id_plan ?? p.id} — {(p.objetivo ?? "Sin objetivo").slice(0, 60)}
              </option>
            ))}
          </Select>

          {/* Buscador */}
          <InputGroup w={{ base: "100%", md: "320px" }}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.500" />
            </InputLeftElement>
            <Input
              placeholder="Buscar por nombre, objetivo o dificultad…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              borderRadius="full"
              bg="white"
            />
          </InputGroup>

          <Button onClick={handleNuevaRutina} bg="#0f4d11ff" color="white">
            Nueva rutina
          </Button>
        </HStack>
      </HStack>

      {loading && (
        <Center py={10}>
          <Spinner size="xl" />
        </Center>
      )}

      {!loading && error && (
        <Alert status="warning">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {!loading && !error && filtradas.length === 0 && (
        <Center py={10}>
          <Box textAlign="center" bg="white" p={8} borderRadius="2xl" boxShadow="md">
            <Icon as={MdFitnessCenter} boxSize={10} color="gray.400" mb={2} />
            <Heading size="md" mb={2} color="gray.800">No hay rutinas</Heading>
            <Text color="gray.600" mb={4}>
              Todavía no cargaste rutinas o no coinciden con el filtro.
            </Text>
            <Button onClick={handleNuevaRutina} bg="#0f4d11ff" color="white">
              Cargar nueva
            </Button>
          </Box>
        </Center>
      )}

      {!loading && !error && filtradas.length > 0 && (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {filtradas.map((r) => {
            const idRutina = r.id_rutina ?? r.id;
            const planId = r.planId ?? r.plan?.id_plan ?? idPlanFromUrl ?? localStorage.getItem("lastPlanId");
            return (
              <Card key={idRutina} h="100%">
                <CardHeader pb={2}>
                  <Heading size="md" color="gray.900" noOfLines={1}>
                    {r.nombre ?? "Sin título"}
                  </Heading>
                </CardHeader>
                <CardBody pt={0}>
                  <HStack spacing={2} mb={3} wrap="wrap">
                    {!!r.dificultad && <Tag colorScheme="teal">{r.dificultad}</Tag>}
                    {!!r.objetivo && <Tag colorScheme="purple">{r.objetivo}</Tag>}
                    {!!planId && <Tag colorScheme="gray">Plan #{planId}</Tag>}
                  </HStack>
                  <Text noOfLines={3} color="gray.700">
                    {r.descripcion ?? "Sin descripción."}
                  </Text>
                </CardBody>
                <Spacer />
                <CardFooter>
                  <HStack spacing={3}>
                    <Button
                      size="sm"
                      bg="#0f4d11ff"
                      color="white"
                      onClick={() => navigate(`/planes/${planId}/rutinas/${idRutina}`)}
                    >
                      Ver detalle
                    </Button>
                  </HStack>
                </CardFooter>
              </Card>
            );
          })}
        </SimpleGrid>
      )}
    </Container>
  );
}
