import { useEffect, useMemo, useState } from "react";
import {
  Box, Button, Container, Heading, HStack, Input, InputGroup, InputLeftElement,
  SimpleGrid, Card, CardHeader, CardBody, CardFooter, Text, Tag, Spacer,
  Center, Spinner, Alert, AlertIcon
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { planesService } from "../../services/planes.servicio";
import BotonVolver from "../../components/BotonVolver.jsx";

export default function ListaPlanes() {
  const navigate = useNavigate();
  const [planes, setPlanes] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await planesService.listAll(); // GET /api/planes (o [])
        setPlanes(Array.isArray(data) ? data : []);
        setError("");
      } catch (e) {
        setError("No pude cargar los planes.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtrados = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return planes;
    return planes.filter((p) => {
      const alumnoNom = (p?.alumno?.nombre || "") + " " + (p?.alumno?.apellido || "");
      const objetivo = p?.objetivo || "";
      return (
        alumnoNom.toLowerCase().includes(term) ||
        objetivo.toLowerCase().includes(term) ||
        String(p?.id_plan || "").includes(term)
      );
    });
  }, [planes, q]);

  return (
    <Container maxW="7xl" py={10}>
      <HStack justify="space-between" align="center" mb={6} wrap="wrap" gap={4}>
        <HStack spacing={3}>
          <BotonVolver />
          <Heading size="lg" color="gray.900">Planes</Heading>
        </HStack>

        <HStack spacing={3}>
          <InputGroup w={{ base: "100%", md: "320px" }}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.500" />
            </InputLeftElement>
            <Input
              placeholder="Buscar (alumno, objetivo, ID)…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              borderRadius="full"
              bg="white"
            />
          </InputGroup>

          <Button bg="#0f4d11ff" color="white" onClick={() => navigate("/planes/nuevo")}>
              Agregar nuevo plan
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

      {!loading && !error && filtrados.length === 0 && (
        <Center py={10}>
          <Box textAlign="center" bg="white" p={8} borderRadius="2xl" boxShadow="md">
            <Heading size="md" mb={2} color="gray.800">Sin planes</Heading>
            <Text color="gray.600" mb={4}>
              Todavía no hay planes o no coinciden con el filtro.
            </Text>
          </Box>
        </Center>
      )}

      {!loading && !error && filtrados.length > 0 && (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {filtrados.map((p) => {
            const alumnoNom = [p?.alumno?.nombre, p?.alumno?.apellido].filter(Boolean).join(" ");
            return (
              <Card key={p.id_plan} h="100%">
                <CardHeader pb={2}>
                  <Heading size="md" color="gray.900" noOfLines={1}>
                    Plan #{p.id_plan}
                  </Heading>
                </CardHeader>
                <CardBody pt={0}>
                  <HStack spacing={2} mb={3} wrap="wrap">
                    {alumnoNom && <Tag colorScheme="teal">{alumnoNom}</Tag>}
                    {p.fecha_inicio && <Tag colorScheme="gray">Inicio: {p.fecha_inicio}</Tag>}
                    {p.fecha_fin && <Tag colorScheme="gray">Fin: {p.fecha_fin}</Tag>}
                  </HStack>
                  <Text noOfLines={3} color="gray.700">
                    {p.objetivo || "Sin objetivo definido."}
                  </Text>
                </CardBody>
                <Spacer />
                <CardFooter>
                  <HStack spacing={3}>
                    <Button
                      size="sm"
                      bg="#0f4d11ff"
                      color="white"
                      onClick={() => navigate(`/planes/${p.id_plan}`)}
                    >
                      Ver detalle
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/planes/${p.id_plan}/rutinas`)}
                    >
                      Ver rutinas
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
