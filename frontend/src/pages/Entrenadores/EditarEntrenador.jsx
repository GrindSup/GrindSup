// src/pages/Entrenadores/EditarEntrenador.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Grid,
  GridItem,
  Heading,
  Input,
  Stack,
  Text,
  useToast,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Image,
  Flex,
  VStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
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
    // URL o dataURL (base64) de la foto
    foto_perfil: "",
  });

  // modoFoto: "url" | null (para mostrar/ocultar campo URL)
  const [modoFoto, setModoFoto] = useState(null);
  const fileInputRef = useRef(null);

  // Cargar entrenador
  useEffect(() => {
    const fetchEntrenador = async () => {
      try {
        const { data } = await axios.get(
          `${apiBaseUrl}/entrenadores/${idEntrenador}`
        );
        setEntrenador({
          idEntrenador: data.idEntrenador ?? data.id_entrenador ?? null,
          nombre: data.usuario?.nombre || "",
          apellido: data.usuario?.apellido || "",
          correo: data.usuario?.correo || "",
          telefono: data.telefono || "",
          experiencia: data.experiencia || "",
          foto_perfil:
            data.usuario?.foto_perfil ||
            data.usuario?.fotoPerfil ||
            "",
        });
      } catch (err) {
        console.error("Error al cargar entrenador:", err.response?.data || err);
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

  // Cargar imagen desde dispositivo y convertirla a dataURL
  const handleFileFromDevice = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setEntrenador((prev) => ({
          ...prev,
          foto_perfil: reader.result, // data:image/...;base64,...
        }));
      }
    };
    reader.readAsDataURL(file);

    // Permitir volver a elegir el mismo archivo más adelante
    e.target.value = "";
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
          // Puede ser una URL normal o un dataURL (si subió archivo)
          foto_perfil: entrenador.foto_perfil || "",
        },
      };

      await axios.put(`${apiBaseUrl}/entrenadores/${idEntrenador}`, payload);

      toast({
        status: "success",
        title: "Entrenador actualizado correctamente",
        position: "top",
      });
      navigate(-1);
    } catch (err) {
      console.error("Error al actualizar entrenador:", err.response?.data || err);

      const backendMessage =
        err.response?.data?.message ||
        (typeof err.response?.data === "string" ? err.response.data : "") ||
        err.message;

      toast({
        status: "error",
        title: "Error al actualizar",
        description: backendMessage,
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
            <Heading size="lg">Editar Perfil</Heading>
            <Text color="gray.600" mt={2}>
              Modificá tus datos y guardá los cambios.
            </Text>
          </CardHeader>

          <CardBody pt={6} px={{ base: 6, md: 10 }} pb={8}>
            <Box as="form" onSubmit={onSubmit}>
              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={5}>
                {/* Sección foto + nombre + apellido */}
                <GridItem colSpan={2} mb={4}>
                  <Flex
                    direction={{ base: "column", md: "row" }}
                    gap={8}
                    align="start"
                    width="full"
                  >
                    {/* Vista previa + botón para cambiar foto */}
                    <Box
                      minW="160px"
                      textAlign={{ base: "center", md: "left" }}
                      flexShrink={0}
                    >
                      <Text
                        fontSize="md"
                        color="gray.600"
                        mb={2}
                        fontWeight="medium"
                      >
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
                          mx={{ base: "auto", md: "0" }}
                        />
                      ) : (
                        <Box
                          boxSize="100px"
                          borderRadius="full"
                          bg="gray.100"
                          border="2px dashed gray.300"
                          mx={{ base: "auto", md: "0" }}
                        />
                      )}

                      {/* Botón + menú para elegir modo de cambio */}
                      <Menu>
                        <MenuButton
                          as={Button}
                          size="sm"
                          mt={4}
                          variant="outline"
                        >
                          Cambiar foto de perfil
                        </MenuButton>
                        <MenuList>
                          <MenuItem onClick={() => setModoFoto("url")}>
                            Desde URL
                          </MenuItem>
                          <MenuItem
                            onClick={() => {
                              setModoFoto(null);
                              if (fileInputRef.current) {
                                fileInputRef.current.click();
                              }
                            }}
                          >
                            Desde dispositivo
                          </MenuItem>
                        </MenuList>
                      </Menu>

                      {/* input file oculto para subir imagen */}
                      <Input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        display="none"
                        onChange={handleFileFromDevice}
                      />

                      {/* Si elige modo URL, mostramos el campo */}
                      {modoFoto === "url" && (
                        <FormControl mt={3}>
                          <FormLabel fontSize="sm">
                            URL de la imagen
                          </FormLabel>
                          <Input
                            size="sm"
                            name="foto_perfil"
                            value={entrenador.foto_perfil}
                            onChange={handleChange}
                            placeholder="https://..."
                          />
                          <Text fontSize="xs" color="gray.500" mt={1}>
                            La vista previa se actualiza al cambiar la URL.
                            Si lo dejás vacío, se eliminará la foto.
                          </Text>
                        </FormControl>
                      )}
                    </Box>

                    {/* Nombre y apellido */}
                    <VStack
                      flex="1"
                      spacing={5}
                      align="stretch"
                      w="full"
                    >
                      <FormControl
                        isRequired
                        isInvalid={submitted && !!errors.nombre}
                      >
                        <FormLabel>Nombre</FormLabel>
                        <Input
                          name="nombre"
                          value={entrenador.nombre}
                          onChange={handleChange}
                        />
                        {submitted && (
                          <FormErrorMessage>
                            {errors.nombre}
                          </FormErrorMessage>
                        )}
                      </FormControl>

                      <FormControl
                        isRequired
                        isInvalid={submitted && !!errors.apellido}
                      >
                        <FormLabel>Apellido</FormLabel>
                        <Input
                          name="apellido"
                          value={entrenador.apellido}
                          onChange={handleChange}
                        />
                        {submitted && (
                          <FormErrorMessage>
                            {errors.apellido}
                          </FormErrorMessage>
                        )}
                      </FormControl>
                    </VStack>
                  </Flex>
                </GridItem>

                <GridItem colSpan={2}>
                  <FormControl
                    isRequired
                    isInvalid={submitted && !!errors.correo}
                  >
                    <FormLabel>Correo Electrónico</FormLabel>
                    <Input
                      name="correo"
                      value={entrenador.correo}
                      onChange={handleChange}
                    />
                    {submitted && (
                      <FormErrorMessage>
                        {errors.correo}
                      </FormErrorMessage>
                    )}
                  </FormControl>
                </GridItem>

                <GridItem colSpan={2}>
                  <FormControl
                    isInvalid={submitted && !!errors.telefono}
                  >
                    <FormLabel>Teléfono</FormLabel>
                    <Input
                      name="telefono"
                      value={entrenador.telefono}
                      onChange={handleChange}
                    />
                    {submitted && (
                      <FormErrorMessage>
                        {errors.telefono}
                      </FormErrorMessage>
                    )}
                  </FormControl>
                </GridItem>

                <GridItem colSpan={2}>
                  <FormControl>
                    <FormLabel>Experiencia</FormLabel>
                    <Input
                      name="experiencia"
                      value={entrenador.experiencia}
                      onChange={handleChange}
                    />
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
