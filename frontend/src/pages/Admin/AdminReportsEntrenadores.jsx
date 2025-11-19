// src/pages/Admin/AdminReportsEntrenadores.jsx
import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  Stack,
  Spinner,
  Flex,
  Badge,
  Button,
  Select,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import api from "../../config/axios.config";

export default function AdminReportsEntrenadores() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inactividadDias, setInactividadDias] = useState(30);
  const navigate = useNavigate();

  const load = async (dias) => {
    setLoading(true);
    try {
      const res = await api.get(
        `/api/reportes/admin/entrenadores/estadisticas?inactividadDias=${dias}`
      );
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(inactividadDias);
  }, []);

  const handleChangeInactividad = (e) => {
    const dias = Number(e.target.value || 30);
    setInactividadDias(dias);
    load(dias);
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={10}>
        <Flex justify="center" align="center" gap={3} minH="50vh">
          <Spinner size="xl" color="#258d19" />
          <Text color="white">Cargando estadísticas...</Text>
        </Flex>
      </Container>
    );
  }

  if (!data) {
    return (
      <Container maxW="container.xl" py={10}>
        <Text color="white">No se pudieron cargar los datos.</Text>
      </Container>
    );
  }

  return (
    <Box py={{ base: 6, md: 10 }}>
      <Container maxW="container.xl">
        <Flex justify="space-between" align="center" mb={6} gap={4}>
          <Box>
            <Heading size="lg" color="white" mb={1}>
              Reportes y estadísticas de entrenadores
            </Heading>
            <Text color="whiteAlpha.800">
              Altas de entrenadores e inactividad dentro de GrindSup.
            </Text>
          </Box>
          <Button
            onClick={() => navigate("/dashboard")}
            bg="#258d19"
            color="white"
            _hover={{ bg: "green.600" }}
          >
            Volver
          </Button>
        </Flex>

        {/* Resumen numérico */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
          <Card borderRadius="2xl" bg="whiteAlpha.900">
            <CardBody>
              <Stack spacing={1}>
                <Text fontSize="sm" color="gray.500">
                  Total de entrenadores
                </Text>
                <Heading size="lg" color="gray.900">
                  {data.totalEntrenadores}
                </Heading>
              </Stack>
            </CardBody>
          </Card>

          <Card borderRadius="2xl" bg="whiteAlpha.900">
            <CardBody>
              <Stack spacing={1}>
                <Text fontSize="sm" color="gray.500">
                  Nuevos en los últimos 30 días
                </Text>
                <Heading size="lg" color="gray.900">
                  {data.nuevosUltimos30Dias}
                </Heading>
              </Stack>
            </CardBody>
          </Card>

          <Card borderRadius="2xl" bg="whiteAlpha.900">
            <CardBody>
              <Stack spacing={1}>
                <Text fontSize="sm" color="gray.500">
                  Último entrenador creado
                </Text>
                <Heading size="sm" color="gray.900">
                  {data.fechaUltimoEntrenadorCreado
                    ? new Date(
                        data.fechaUltimoEntrenadorCreado
                      ).toLocaleString()
                    : "Sin datos"}
                </Heading>
              </Stack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Filtro de inactividad */}
        <Flex align="center" mb={4} gap={3}>
          <Text color="whiteAlpha.900">
            Mostrar entrenadores que no entran hace más de:
          </Text>
          <Select
            bg="white"
            w="auto"
            value={inactividadDias}
            onChange={handleChangeInactividad}
          >
            <option value={15}>15 días</option>
            <option value={30}>30 días</option>
            <option value={60}>60 días</option>
            <option value={90}>90 días</option>
          </Select>
        </Flex>

        {/* Lista de entrenadores inactivos */}
        <Card borderRadius="2xl" bg="whiteAlpha.900">
          <CardBody>
            <Heading size="md" mb={4} color="gray.900">
              Entrenadores inactivos
            </Heading>

            {(!data.entrenadoresInactivos ||
              data.entrenadoresInactivos.length === 0) && (
              <Text color="gray.600">
                No hay entrenadores inactivos con el criterio seleccionado.
              </Text>
            )}

            <Stack spacing={3}>
              {data.entrenadoresInactivos?.map((e) => (
                <Flex
                  key={e.idEntrenador}
                  justify="space-between"
                  align="center"
                  p={3}
                  borderRadius="lg"
                  bg="gray.50"
                >
                  <Box>
                    <Text fontWeight="bold" color="gray.900">
                      {e.nombre} {e.apellido}
                    </Text>
                    <Text fontSize="sm" color="gray.700">
                      Último acceso:{" "}
                      {e.ultimoAcceso
                        ? new Date(e.ultimoAcceso).toLocaleString()
                        : "Nunca ingresó"}
                    </Text>
                  </Box>
                  <Badge colorScheme="red" fontSize="sm">
                    {e.diasSinEntrar} días sin entrar
                  </Badge>
                </Flex>
              ))}
            </Stack>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
}
