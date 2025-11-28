// src/pages/Entrenadores/EditarEntrenador.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Button, Card, CardBody, CardHeader, Container,
  Grid, GridItem, Heading, Input, Stack, Text, useToast,
  FormControl, FormLabel, FormErrorMessage, Image,
  Flex, VStack // 👈 Importamos Flex y VStack
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../config/axios.config";

const API = import.meta?.env?.VITE_API_BASE_URL || "http://localhost:8080/api";

export default function EditarEntrenador({ apiBaseUrl = API }) {
  const { idEntrenador } = useParams();
  const toast = useToast();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [entrenador, setEntrenador] = useState({
    idEntrenador: null,
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    experiencia: "",
    foto_perfil: "", // Campo para la URL de la foto (Google o Avatar)
  });

  // Cargar entrenador
  useEffect(() => {
    const fetchEntrenador = async () => {
      try {
        const { data } = await axios.get(`${apiBaseUrl}/entrenadores/${idEntrenador}`);
        setEntrenador({
          idEntrenador: data.idEntrenador ?? data.id_entrenador ?? null,
          nombre: data.usuario?.nombre || "",
          apellido: data.usuario?.apellido || "",
          correo: data.usuario?.correo || "",
          telefono: data.telefono || "",
          experiencia: data.experiencia || "",
          // Carga la foto de perfil desde el usuario (Google o Avatar)
          foto_perfil:
            data.usuario?.foto_perfil ||
            data.usuario?.fotoPerfil ||
            ""
        });
      } catch (err) {
        toast({
          status: "error",
          title: "Error al cargar entrenador",
          description: err.message,
          position: "top",
        });
      }
    };

    fetchEntrenador();
  }, [idEntrenador, apiBaseUrl, toast]);

  // Validaciones
  const errors = useMemo(() => {
    const e = {};
    if (!entrenador.nombre?.trim()) e.nombre = "El nombre es obligatorio";
    if (!entrenador.apellido?.trim()) e.apellido = "El apellido es obligatorio";
    if (!entrenador.correo?.trim()) e.correo = "El correo es obligatorio";
    if (entrenador.telefono && !/^\+?\d+$/.test(entrenador.telefono))
      e.telefono = "El teléfono debe ser numérico (puede incluir +)";
    return e;
  }, [entrenador]);

  const isValid = Object.keys(errors).length === 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEntrenador((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    if (!isValid) {
      toast({
        status: "warning",
        title: "Revisá los campos obligatorios",
        position: "top",
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        experiencia: entrenador.experiencia,
        telefono: entrenador.telefono,
        usuario: {
          nombre: entrenador.nombre,
          apellido: entrenador.apellido,
          correo: entrenador.correo,
          // Se mantiene foto_perfil, que contendrá la URL de Google/Avatar
          foto_perfil: entrenador.foto_perfil || "" 
        }
      };

      await axios.put(`${apiBaseUrl}/entrenadores/${idEntrenador}`, payload);

      toast({
        status: "success",
        title: "Entrenador actualizado correctamente",
        position: "top",
      });
      navigate(-1);
    } catch (err) {
      toast({
        status: "error",
        title: "Error al actualizar",
        description: err.response?.data || err.message,
        position: "top",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box py={{ base: 8, md: 12 }}>
      <Container maxW="container.md">
        <Card>
          <CardHeader textAlign="center" pb={0}>
            <Heading size="lg">Editar Perfl</Heading>
            <Text color="gray.600" mt={2}>
              Modificá tus datos y guardá los cambios.
            </Text>
          </CardHeader>

          <CardBody pt={6} px={{ base: 6, md: 10 }} pb={8}>
            <Box as="form" onSubmit={onSubmit}>
              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={5}>
                
                {/* 1. SECCIÓN DE FOTO Y NOMBRE/APELLIDO - Ocupa todo el ancho */}
                <GridItem colSpan={2} mb={4}>
                    {/* FLEX: Alinear horizontalmente la imagen y los campos */}
                    <Flex 
                        direction={{ base: "column", md: "row" }} // Columna en móvil, Fila en desktop
                        gap={8} 
                        align="start" // Alinear al inicio (arriba)
                        width="full"
                    >
                        
                        {/* Vista Previa de la Foto (Izquierda) */}
                        <Box 
                            minW="120px" // Fija el ancho para la columna de la imagen
                            textAlign={{ md: "left" }}
                            flexShrink={0}
                         >
                            <Text fontSize="md" color="gray.600" mb={2} fontWeight="medium">
                                Vista previa
                            </Text>
                            {entrenador.foto_perfil?.trim() ? (
                                <Image
                                    src={entrenador.foto_perfil}
                                    alt="Foto de perfil"
                                    boxSize="100px"
                                    borderRadius="full"
                                    objectFit="cover"
                                    border="2px solid #258d19"
                                />
                            ) : (
                                // Placeholder si no hay foto
                                <Box 
                                    boxSize="80px" 
                                    borderRadius="full" 
                                    bg="gray.100" 
                                    border="2px dashed gray.300"
                                />
                            )}
                        </Box>
                        
                        {/* VStack: Apila Nombre y Apellido (DERECHA) */}
                        <VStack 
                            flex="1" // ✅ TOMA EL ESPACIO RESTANTE
                            spacing={5} 
                            align="stretch"
                            w="full"
                        >
                            {/* Campo Nombre */}
                            <FormControl isRequired isInvalid={submitted && !!errors.nombre}>
                                <FormLabel>Nombre</FormLabel>
                                <Input name="nombre" value={entrenador.nombre} onChange={handleChange} />
                                {submitted && <FormErrorMessage>{errors.nombre}</FormErrorMessage>}
                            </FormControl>
                            
                            {/* Campo Apellido */}
                            <FormControl isRequired isInvalid={submitted && !!errors.apellido}>
                                <FormLabel>Apellido</FormLabel>
                                <Input name="apellido" value={entrenador.apellido} onChange={handleChange} />
                                {submitted && <FormErrorMessage>{errors.apellido}</FormErrorMessage>}
                            </FormControl>
                        </VStack>
                    </Flex>
                </GridItem>

                <GridItem colSpan={2}>
                  <FormControl isRequired isInvalid={submitted && !!errors.correo}>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <Input name="correo" value={entrenador.correo} onChange={handleChange} />
                    {submitted && <FormErrorMessage>{errors.correo}</FormErrorMessage>}
                  </FormControl>
                </GridItem>

                <GridItem colSpan={2}>
                  <FormControl isInvalid={submitted && !!errors.telefono}>
                    <FormLabel>Teléfono</FormLabel>
                    <Input name="telefono" value={entrenador.telefono} onChange={handleChange} />
                    {submitted && <FormErrorMessage>{errors.telefono}</FormErrorMessage>}
                  </FormControl>
                </GridItem>

                <GridItem colSpan={2}>
                  <FormControl>
                    <FormLabel>Experiencia</FormLabel>
                    <Input name="experiencia" value={entrenador.experiencia} onChange={handleChange} />
                  </FormControl>
                </GridItem>
              </Grid>

              <Stack
                direction={{ base: "column", md: "row" }}
                spacing={4}
                mt={8}
                justify="center"
              >
                <Button
                  type="submit"
                  isLoading={submitting}
                  loadingText="Guardando"
                  px={10}
                  bg="#258d19"
                  color="white"
                >
                  Guardar cambios
                </Button>
                <Button variant="ghost" onClick={() => navigate(-1)}>
                  Cancelar
                </Button>
              </Stack>
            </Box>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
}