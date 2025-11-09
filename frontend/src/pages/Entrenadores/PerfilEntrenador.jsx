//src\pages\Entrenadores\PerfilEntrenador.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Button, Card, CardHeader, CardBody, Heading, Text, Stack, Badge, Spinner, Flex } from "@chakra-ui/react";
import { ArrowBackIcon, EditIcon } from "@chakra-ui/icons";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export default function PerfilEntrenador() {
  const { idEntrenador } = useParams();
  const [entrenador, setEntrenador] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEntrenador = async () => {
      try {
        const { data } = await axios.get(`${API}/entrenadores/${idEntrenador}`);
        setEntrenador({
          idEntrenador: data.idEntrenador,
          usuario: data.usuario || {},
          experiencia: data.experiencia || "",
          telefono: data.telefono || "",
          estado: data.estado || { nombre: "Activo" },
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEntrenador();
  }, [idEntrenador]);

  if (loading) return <Spinner size="xl" color="teal.400" />;

  if (!entrenador) return <Text color="red.500">Entrenador no encontrado.</Text>;

  return (
    <Box py={8}>
      <Flex mb={6} align="center" gap={4}>
        <Button leftIcon={<ArrowBackIcon />} bg="#258d19" color="white" onClick={() => navigate(-1)}>Volver</Button>
        <Heading size="lg" color="white">Perfil del Entrenador</Heading>
      </Flex>

      <Card borderRadius="2xl" boxShadow="lg" bgGradient="linear(to-b, teal.50, white)">
        <CardHeader>
          <Heading size="md">{entrenador.usuario.nombre} {entrenador.usuario.apellido}</Heading>
          <Badge mt={2} colorScheme="purple">{entrenador.estado.nombre}</Badge>
        </CardHeader>
        <CardBody>
          <Stack spacing={3} fontSize="sm" color="gray.700">
            <Text><strong>Email:</strong> {entrenador.usuario.correo || entrenador.usuario.email || "—"}</Text>
            <Text><strong>Teléfono:</strong> {entrenador.telefono || "—"}</Text>
            <Text><strong>Experiencia:</strong> {entrenador.experiencia || "Sin especificar"}</Text>
          </Stack>
          <Button mt={6} leftIcon={<EditIcon />} bg="#258d19" color="white" _hover={{ bg: "green.500" }} onClick={() => navigate(`/entrenadores/editar/${entrenador.idEntrenador}`)}>Editar</Button>
        </CardBody>
      </Card>
    </Box>
  );
}