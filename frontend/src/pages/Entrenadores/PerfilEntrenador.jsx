// src/pages/Entrenadores/PerfilEntrenador.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  Stack,
  Badge,
  Spinner,
  Flex,
  Avatar,
} from "@chakra-ui/react";
import { ArrowBackIcon, EditIcon } from "@chakra-ui/icons";
import api from "../../config/axios.config";

export default function PerfilEntrenador() {
  const { idEntrenador } = useParams();
  const [entrenador, setEntrenador] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEntrenador = async () => {
      try {
        // usamos tu axios configurado + /api
        const { data } = await api.get(`/api/entrenadores/${idEntrenador}`);

        const usuario = data.usuario ?? {};

        setEntrenador({
          idEntrenador:
            data.id_entrenador ?? data.idEntrenador ?? data.id ?? idEntrenador,
          usuario,
          experiencia: data.experiencia ?? "",
          telefono: data.telefono ?? "",
          estado: data.estado ?? { nombre: "Activo" },
        });
      } catch (err) {
        console.error("Error cargando entrenador", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEntrenador();
  }, [idEntrenador]);

  if (loading)
    return <Spinner size="xl" color="teal.400" mt={10} thickness="4px" />;

  if (!entrenador)
    return (
      <Text color="red.500" mt={10}>
        Entrenador no encontrado.
      </Text>
    );

  const { usuario } = entrenador;

  return (
    <Box py={8}>
      <Flex mb={6} align="center" gap={4}>
        <Button
          leftIcon={<ArrowBackIcon />}
          bg="#258d19"
          color="white"
          onClick={() => navigate(-1)}
        >
          Volver
        </Button>
        <Heading size="lg" color="white">
          Perfil del Entrenador
        </Heading>
      </Flex>

      <Card
        borderRadius="2xl"
        boxShadow="lg"
        bgGradient="linear(to-b, teal.50, white)"
      >
        <CardHeader>
          <Flex align="center" gap={4}>
            <Avatar
              size="lg"
              name={`${usuario?.nombre ?? ""} ${usuario?.apellido ?? ""}`}
              src={usuario?.foto_perfil ?? ""}
              bg="green.500"
              color="white"
            />
            <Box>
              <Heading size="md">
                {usuario?.nombre} {usuario?.apellido}
              </Heading>
              <Badge mt={2} colorScheme="purple">
                {entrenador.estado?.nombre ?? "Activo"}
              </Badge>
            </Box>
          </Flex>
        </CardHeader>

        <CardBody>
          <Stack spacing={3} fontSize="sm" color="gray.700">
            <Text>
              <strong>Email:</strong>{" "}
              {usuario?.correo || usuario?.email || "—"}
            </Text>
            <Text>
              <strong>Teléfono:</strong> {entrenador.telefono || "—"}
            </Text>
            <Text>
              <strong>Experiencia:</strong>{" "}
              {entrenador.experiencia || "Sin especificar"}
            </Text>
          </Stack>

          <Button
            mt={6}
            leftIcon={<EditIcon />}
            bg="#258d19"
            color="white"
            _hover={{ bg: "green.500" }}
            onClick={() =>
              navigate(`/entrenadores/editar/${entrenador.idEntrenador}`)
            }
          >
            Editar
          </Button>
        </CardBody>
      </Card>
    </Box>
  );
}
