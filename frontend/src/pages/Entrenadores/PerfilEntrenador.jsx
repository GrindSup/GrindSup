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
  Spinner,
  Flex,
  Avatar,
  Divider
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
        maxW="900px"
        mx="auto"
        borderRadius="2xl"
        boxShadow="lg"
        bgGradient="linear(to-b, teal.50, white)"
        p={3}
      >
         <CardBody>
          <Flex gap={8}>

            {/* FOTO CON DOBLE CONTORNO */}
            <Flex w="250px" align="center" justify="center">
              <Box
                boxSize="195px"                // tamaño exterior
                border="6px solid #22e30cff"     // borde verde
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Box
                  boxSize="178px"              // borde blanco más fino
                  border="3px solid white"
                  bg="white"
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Avatar
                    size="2xl"
                    name={`${usuario?.nombre ?? ""} ${usuario?.apellido ?? ""}`}
                    src={usuario?.foto_perfil ?? ""}
                    bg="green.500"
                    color="white"
                    boxSize="176px"            // avatar interior
                  />
                </Box>
              </Box>
            </Flex>

            {/* INFORMACIÓN DERECHA */}
            <Stack spacing={4} fontSize="md" color="gray.900" flex="1">
              <Heading size="lg">
                {usuario?.nombre} {usuario?.apellido}
              </Heading>
              
              {/* LÍNEA DIVISORIA */}
              <Divider borderColor="green.500" borderWidth="1px" />

              {/* CUADRO GRIS CON INFO */}
              <Box
                bg="gray.100"
                p={4}
                borderRadius="lg"
                boxShadow="sm"
              >
                <Stack spacing={2}>
                  <Text>
                    <strong>Correo Electrónico:</strong>{" "}
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
              </Box>

              <Button
                mt={2}
                leftIcon={<EditIcon />}
                bg="#258d19"
                color="white"
                _hover={{ bg: "green.500" }}
                w="fit-content"
                onClick={() =>
                  navigate(`/entrenadores/editar/${entrenador.idEntrenador}`)
                }
              >
                Editar
              </Button>
            </Stack>
          </Flex>
        </CardBody>
      </Card>
    </Box>
  );
}