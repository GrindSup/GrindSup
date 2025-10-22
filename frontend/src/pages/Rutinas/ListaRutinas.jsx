// frontend/src/pages/Rutinas/ListaRutinas.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Box, Button, Container, Heading, HStack, Input, InputGroup, InputLeftElement,
  SimpleGrid, Card, CardHeader, CardBody, CardFooter, Text, Tag, Spacer, Icon,
  Center, Spinner, Alert, AlertIcon, Select, useToast
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { MdFitnessCenter } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../config/axios.config";
import { planesService } from "../../services/planes.servicio";
import { rutinasService } from "../../services/rutinas.servicio";
import BotonVolver from "../../components/BotonVolver.jsx";

export default function ListaRutinas() {
  const navigate = useNavigate();
  const toast = useToast();
  const { idPlan: idPlanFromUrl } = useParams();

  const [rutinas, setRutinas] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [planSel, setPlanSel] = useState("");        // ← vacío = TODOS
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        // 1) planes para enriquecer etiquetas
        const ps = await planesService.listAll();
        setPlanes(ps);

        // 2) rutinas (global o por plan si viene por URL)
        let data = [];
        try {
          if (idPlanFromUrl) {
            const r = await axiosInstance.get(`/api/planes/${idPlanFromUrl}/rutinas`);
            data = Array.isArray(r.data) ? r.data : [];
          } else {
            try {
              const r = await axiosInstance.get("/api/rutinas");
              data = Array.isArray(r.data) ? r.data : [];
            } catch {
              const r = await axiosInstance.get("/api/rutinas?all=1");
              data = Array.isArray(r.data) ? r.data : [];
            }
          }
        } catch {
          data = [];
        }

        // 3) enriquecer con planId y nombre alumno
        const enrich = data.map((r) => {
          const planId = r.planId ?? r.plan?.id_plan ?? r.id_plan ?? null;
          const plan = (ps || []).find((p) => String(p.id_plan ?? p.id) === String(planId));
          const alumno = plan?.alumno
            ? [plan.alumno?.nombre, plan.alumno?.apellido].filter(Boolean).join(" ")
            : null;
          return { ...r, __planId: planId, __alumno: alumno };
        });

        setRutinas(enrich);

        // 4) planSel por URL únicamente (no auto-filtrar por “último plan”)
        if (idPlanFromUrl) {
          setPlanSel(String(idPlanFromUrl));
          localStorage.setItem("lastPlanId", String(idPlanFromUrl));
        } else {
          setPlanSel(""); // ← mostrar TODAS
        }

        setError("");
      } catch {
        setError("No pude cargar las rutinas.");
        setRutinas([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [idPlanFromUrl]);

  // Filtro combinado: por plan seleccionado + texto de búsqueda
  const filtradas = useMemo(() => {
    const term = q.trim().toLowerCase();
    const wantPlan = String(planSel || "").trim();

    return rutinas.filter((r) => {
      const planIdDeLaRutina = String(r.__planId ?? r.plan?.id_plan ?? r.id_plan ?? "");
      if (wantPlan && planIdDeLaRutina !== wantPlan) return false;

      if (!term) return true;
      const nom = (r?.nombre ?? "").toLowerCase();
      const desc = (r?.descripcion ?? "").toLowerCase();
      const alumno = (r?.__alumno ?? "").toLowerCase();
      return nom.includes(term) || desc.includes(term) || alumno.includes(term);
    });
  }, [rutinas, q, planSel]);

  const handleNuevaRutina = () => {
    // si hay un plan elegido, se asocia ahí; si no, pedimos que elijan uno
    const destinoPlan = planSel || idPlanFromUrl;
    if (!destinoPlan) {
      setError("Seleccioná un plan en el selector para crear una rutina asociada.");
      return;
    }
    localStorage.setItem("lastPlanId", String(destinoPlan));
    navigate(`/planes/${destinoPlan}/rutinas/nueva`);
  };

  // ---- Exportar PDF (GET /api/rutinas/{id}/exportar) ----
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

  // ---- Editar / Eliminar ----
  const goEditar = (planId, idRutina) => {
    if (!planId) {
      toast({ title: "No se puede editar: rutina sin plan asociado.", status: "warning" });
      return;
    }
    navigate(`/planes/${planId}/rutinas/${idRutina}/editar`);
  };

  const handleEliminar = async (planId, idRutina, nombre) => {
    if (!idRutina) return;
    const ok = window.confirm(`¿Eliminar la rutina "${nombre || idRutina}"? Esta acción no se puede deshacer.`);
    if (!ok) return;

    // Optimista
    const prev = rutinas;
    setRutinas((rs) => rs.filter((r) => String(r.id_rutina ?? r.id) !== String(idRutina)));

    try {
      const removed = await rutinasService.remove(planId, idRutina);
      if (!removed) throw new Error("El backend no confirmó la eliminación");
      toast({ title: "Rutina eliminada", status: "success" });
    } catch (e) {
      console.error(e);
      setRutinas(prev); // revert
      toast({ title: "No se pudo eliminar", status: "error" });
    }
  };

  return (
    <Container maxW="7xl" py={10}>
      <HStack justify="space-between" align="center" mb={6} wrap="wrap" gap={4}>
        <HStack spacing={3}>
          <BotonVolver />
          <Heading size="lg" color="gray.900">Rutinas</Heading>
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
            <option value="">Todos los planes</option>
            {planes.map((p) => (
              <option key={p.id_plan ?? p.id} value={p.id_plan ?? p.id}>
                #{p.id_plan ?? p.id} — {(p.objetivo ?? "Sin objetivo").slice(0, 60)}
              </option>
            ))}
          </Select>

          <InputGroup w={{ base: "100%", md: "360px" }}>
            <InputLeftElement pointerEvents="none"><SearchIcon color="gray.500" /></InputLeftElement>
            <Input
              placeholder="Buscar por nombre, descripción o alumno…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              borderRadius="full"
              bg="white"
            />
          </InputGroup>

          <Button onClick={handleNuevaRutina} bg="#0f4d11ff" color="white" borderRadius="full" minWidth="150px">
            + Nueva rutina
          </Button>
        </HStack>
      </HStack>

      {loading && <Center py={10}><Spinner size="xl" /></Center>}

      {!loading && error && (
        <Alert status="warning" borderRadius="lg"><AlertIcon />{error}</Alert>
      )}

      {!loading && !error && filtradas.length === 0 && (
        <Center py={10}>
          <Box textAlign="center" bg="white" p={10} borderRadius="2xl" boxShadow="lg" maxW="lg">
            <Icon as={MdFitnessCenter} boxSize={12} color="gray.400" mb={3} />
            <Heading size="md" mb={2} color="gray.800">No hay rutinas</Heading>
            <Text color="gray.600" mb={5}>No existen rutinas o no coinciden con el filtro.</Text>
            <Button onClick={handleNuevaRutina} bg="#0f4d11ff" color="white" borderRadius="full">Cargar nueva</Button>
          </Box>
        </Center>
      )}

      {!loading && !error && filtradas.length > 0 && (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={7}>
          {filtradas.map((r) => {
            const idRutina = r.id_rutina ?? r.id;
            const planId = r.__planId ?? idPlanFromUrl ?? (localStorage.getItem("lastPlanId") || "");

            return (
              <Card
                key={idRutina}
                h="100%"
                bg="white"
                borderRadius="2xl"
                boxShadow="md"
                _hover={{ boxShadow: "xl", transform: "translateY(-2px)" }}
                transition="all .18s ease"
              >
                <CardHeader pb={2} borderTopRadius="2xl">
                  <Heading size="md" noOfLines={1} color="gray.900">{r.nombre ?? "Sin título"}</Heading>
                </CardHeader>
                <CardBody pt={0}>
                  <HStack spacing={2} mb={3} wrap="wrap">
                    {!!planId && <Tag colorScheme="gray" borderRadius="full">Plan #{planId}</Tag>}
                    {!!r.__alumno && <Tag colorScheme="green" borderRadius="full">{r.__alumno}</Tag>}
                    {!!r.dificultad && <Tag colorScheme="purple" borderRadius="full">{r.dificultad}</Tag>}
                  </HStack>
                  <Text noOfLines={3} color="gray.700">{r.descripcion ?? "Sin descripción."}</Text>
                </CardBody>
                <Spacer />
                <CardFooter>
                  <HStack spacing={3} wrap="wrap">
                    <Button
                      size="sm"
                      bg="#0f4d11ff"
                      color="white"
                      borderRadius="full"
                      onClick={() => navigate(`/planes/${planId}/rutinas/${idRutina}`)}
                      isDisabled={!planId}
                    >
                      Ver detalle
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      borderRadius="full"
                      onClick={() => goEditar(planId, idRutina)}
                      isDisabled={!planId}
                    >
                      Editar
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      borderRadius="full"
                      onClick={() => exportPdf(idRutina, r.nombre)}
                    >
                      Exportar PDF
                    </Button>

                    <Button
                      size="sm"
                      colorScheme="red"
                      borderRadius="full"
                      onClick={() => handleEliminar(planId, idRutina, r.nombre)}
                    >
                      Eliminar
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      borderRadius="full"
                      onClick={() => navigate(`/planes/${planId}`)}
                      isDisabled={!planId}
                    >
                      Ir al plan
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
