import { useEffect, useMemo, useState } from "react";
import {
  Box, Container, Heading, HStack, Input, InputGroup, InputLeftElement,
  Button, SimpleGrid, Card, CardHeader, CardBody, CardFooter, Text, Tag,
  Center, Spinner, Alert, AlertIcon, useToast, Spacer
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { ensureEntrenadorId } from "../../context/auth";
import { planesService } from "../../services/planes.servicio";
import BotonVolver from "../../components/BotonVolver.jsx";

export default function ListaPlanes() {
  const navigate = useNavigate();
  const toast = useToast();

  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const entId = await ensureEntrenadorId();
        // Probamos en cascada dentro del service (getAll ya hace el fallback)
        const data = await planesService.getAll(entId);
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

  const filtrados = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return planes;
    return planes.filter((p) => {
      const id = String(p?.id_plan ?? p?.id ?? "").toLowerCase();
      const objetivo = (p?.objetivo ?? "").toLowerCase();
      const alumno = [
        p?.alumno?.nombre ?? "",
        p?.alumno?.apellido ?? "",
      ].join(" ").toLowerCase();
      return (
        id.includes(term) ||
        objetivo.includes(term) ||
        alumno.includes(term)
      );
    });
  }, [planes, q]);

  const goNuevo = () => navigate("/planes/nuevo");
  const goDetalle = (id) => navigate(`/planes/${id}`);

  return (
    <Container maxW="7xl" py={8}>
      <HStack align="center" mb={4} gap={3} wrap="wrap">
        <BotonVolver />
        <Heading size="lg" color="gray.900">Planes</Heading>
        <Spacer />
        <InputGroup maxW="360px">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.500" />
          </InputLeftElement>
          <Input
            placeholder="Buscar (alumno, objetivo, ID)..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            bg="white"
            borderRadius="full"
          />
        </InputGroup>
        <Button onClick={goNuevo} bg="#0f4d11ff" color="white">
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
            <Button onClick={goNuevo} bg="#0f4d11ff" color="white">
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
            return (
              <Card key={id} h="100%">
                <CardHeader pb={2}>
                  <Heading size="md" noOfLines={1}>Plan N°{id}</Heading>
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
                <CardFooter>
                  <Button size="sm" bg="#0f4d11ff" color="white" onClick={() => goDetalle(id)}>
                    Ver detalle
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </SimpleGrid>
      )}
    </Container>
  );
}
