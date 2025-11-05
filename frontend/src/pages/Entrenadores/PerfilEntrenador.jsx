import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Heading,
  Text,
  Spinner,
  Stack,
  Divider,
  Button,
  Card,
  CardBody,
  Badge,
} from "@chakra-ui/react";
import axiosInstance from "../../config/axios.config";

export default function PerfilEntrenador() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entrenador, setEntrenador] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntrenador = async () => {
      try {
        const response = await axiosInstance.get(`/api/entrenadores/${id}`);
        setEntrenador(response.data);
      } catch (error) {
        console.error("Error al obtener entrenador:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEntrenador();
  }, [id]);

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" color="green.500" />
      </Box>
    );
  }

  if (!entrenador) {
    return (
      <Box textAlign="center" py={10}>
        <Text fontSize="lg" color="gray.600">
          No se encontró el entrenador solicitado.
        </Text>
        <Button mt={4} colorScheme="green" onClick={() => navigate("/entrenadores")}>
          Volver al listado
        </Button>
      </Box>
    );
  }

  const { usuario, experiencia, telefono, estado } = entrenador;

  return (
    <Box maxW="800px" mx="auto" bg="white" borderRadius="2xl" shadow="md" p={8}>
      <Stack spacing={6}>
        <Heading color="green.700">Perfil del Entrenador</Heading>
        <Divider />

        <Card borderRadius="2xl" shadow="sm">
          <CardBody>
            <Stack spacing={4}>
              <Box>
                <Text fontWeight="bold" color="gray.700">
                  Nombre:
                </Text>
                <Text>{usuario?.nombre || "—"}</Text>
              </Box>

              <Box>
                <Text fontWeight="bold" color="gray.700">
                  Correo electrónico:
                </Text>
                <Text>{usuario?.email || "—"}</Text>
              </Box>

              <Box>
                <Text fontWeight="bold" color="gray.700">
                  Teléfono:
                </Text>
                <Text>{telefono || "—"}</Text>
              </Box>

              <Box>
                <Text fontWeight="bold" color="gray.700">
                  Experiencia:
                </Text>
                <Text whiteSpace="pre-line">{experiencia || "—"}</Text>
              </Box>

              <Box>
                <Text fontWeight="bold" color="gray.700">
                  Estado:
                </Text>
                <Badge
                  colorScheme={
                    estado?.nombre?.toLowerCase() === "activo"
                      ? "green"
                      : estado?.nombre?.toLowerCase() === "inactivo"
                      ? "red"
                      : "gray"
                  }
                >
                  {estado?.nombre || "Sin estado"}
                </Badge>
              </Box>
            </Stack>
          </CardBody>
        </Card>

        <Stack direction="row" spacing={4} justify="flex-end">
          <Button variant="outline" onClick={() => navigate("/entrenadores")}>
            Volver
          </Button>
          <Button
            colorScheme="green"
            onClick={() => navigate(`/entrenador/editar/${entrenador.id_entrenador}`)}
          >
            Editar perfil
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
