// src/pages/Admin/AdminReportsGlobal.jsx
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
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import api from "../../config/axios.config";

export default function AdminReportsGlobal() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/reportes/admin/entrenadores/uso-global");
        setData(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <Container maxW="container.xl" py={10}>
        <Flex justify="center" align="center" gap={3} minH="50vh">
          <Spinner size="xl" color="#258d19" />
          <Text color="white">Cargando reportes...</Text>
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
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Heading size="lg" color="white" mb={1}>
              Reportes globales de uso
            </Heading>
            <Text color="whiteAlpha.900" fontWeight="bold">
              Actividad de los entrenadores dentro de GrindSup.
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
                  Sesiones totales (histórico)
                </Text>
                <Heading size="lg" color="gray.900">
                  {data.totalSesiones}
                </Heading>
              </Stack>
            </CardBody>
          </Card>

          <Card borderRadius="2xl" bg="whiteAlpha.900">
            <CardBody>
              <Stack spacing={1}>
                <Text fontSize="sm" color="gray.500">
                  Promedio sesiones por entrenador
                </Text>
                <Heading size="lg" color="gray.900">
                  {data.promedioSesionesPorEntrenador?.toFixed(1) ?? "0.0"}
                </Heading>
              </Stack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Sesiones últimos 30 días */}
        <Card borderRadius="2xl" bg="whiteAlpha.900" mb={8}>
          <CardBody>
            <Stack spacing={2}>
              <Text fontSize="sm" color="gray.500">
                Sesiones en los últimos 30 días
              </Text>
              <Heading size="lg" color="gray.900">
                {data.totalSesionesUltimos30Dias}
              </Heading>
              {data.desdeUltimos30Dias && (
                <Text fontSize="xs" color="gray.500">
                  Desde: {new Date(data.desdeUltimos30Dias).toLocaleString()}
                </Text>
              )}
            </Stack>
          </CardBody>
        </Card>

        {/* Top entrenadores más activos */}
        <Box>
          <Heading size="md" color="white" mb={4}>
            Entrenadores más activos
          </Heading>

          {(!data.entrenadoresMasActivos ||
            data.entrenadoresMasActivos.length === 0) && (
            <Text color="whiteAlpha.800">
              No hay datos suficientes de sesiones.
            </Text>
          )}

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {data.entrenadoresMasActivos?.map((e) => (
              <Card key={e.idEntrenador} borderRadius="2xl" bg="whiteAlpha.900">
                <CardBody>
                  <Stack spacing={2}>
                    <Flex justify="space-between" align="center">
                      <Text fontWeight="bold" color="gray.900">
                        {e.nombre} {e.apellido}
                      </Text>
                      <Badge colorScheme="green">
                        {e.totalSesiones} sesiones
                      </Badge>
                    </Flex>
                    <Text fontSize="sm" color="gray.700">
                      Último acceso:{" "}
                      {e.ultimoAcceso
                        ? new Date(e.ultimoAcceso).toLocaleString()
                        : "Sin registros"}
                    </Text>
                  </Stack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </Box>
      </Container>
    </Box>
  );
}
