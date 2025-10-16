import React, { useEffect, useState } from "react";
import {
  Box, Button, Card, CardBody, CardHeader, Container,
  Heading, Text, Stack, Badge, Divider, HStack, Tag,
  Spinner, Center, Alert, AlertIcon
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../config/axios.config";

export default function FichaEjercicio() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [ejercicio, setEjercicio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEjercicio = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/ejercicios/${id}`);
        setEjercicio(response.data);
      } catch (err) {
        setError("Error al cargar el ejercicio. " + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    fetchEjercicio();
  }, [id]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'principiante': return 'green';
      case 'intermedio': return 'orange';
      case 'avanzado': return 'red';
      default: return 'gray';
    }
  };

  if (loading) {
    return <Center py={10}><Spinner size="xl" /></Center>;
  }

  if (error) {
    return <Alert status="error"><AlertIcon />{error}</Alert>;
  }
  
  if (!ejercicio) {
    return <Center py={10}><Text>No se encontró el ejercicio.</Text></Center>;
  }

  return (
    <Container maxW="container.md" py={8}>
      <Card>
        <CardHeader>
          <Heading size="lg" mb={2}>{ejercicio.nombre}</Heading>
          <HStack spacing={4}>
            <Badge px={3} py={1} borderRadius="full" colorScheme={getDifficultyColor(ejercicio.dificultad)}>
              {ejercicio.dificultad}
            </Badge>
            {ejercicio.equipamiento?.map(item => (
              <Tag key={item} size="md" variant="subtle" colorScheme="cyan">
                {item}
              </Tag>
            ))}
          </HStack>
        </CardHeader>

        <CardBody>
          <Stack spacing={6}>
            <Box>
              <Text fontSize="lg" color="gray.700">{ejercicio.descripcion}</Text>
            </Box>

            <Divider />

            <Box>
              <Heading size="sm" mb={3} textTransform="uppercase" color="gray.500">
                Músculos Trabajados
              </Heading>
              <HStack spacing={2} wrap="wrap">
                {ejercicio.grupoMuscularPrincipal?.map((musculo, index) => (
                  <Tag key={index} size="lg" colorScheme="blue" variant="solid">
                    {musculo}
                  </Tag>
                ))}
                {ejercicio.grupoMuscularSecundario?.map((musculo, index) => (
                  <Tag key={index} size="lg" colorScheme="blue" variant="outline">
                    {musculo}
                  </Tag>
                ))}
              </HStack>
            </Box>
            
            <Divider />

            <Stack direction="row" spacing={4} justify="flex-end" mt={4}>
              <Button onClick={() => navigate(`/ejercicio/editar/${ejercicio.id_ejercicio}`)} colorScheme="teal" bg="#0f4d11ff">
                Editar
              </Button>
              <Button variant="ghost" onClick={() => navigate("/ejercicios")}>
                Volver
              </Button>
            </Stack>
          </Stack>
        </CardBody>
      </Card>
    </Container>
  );
}