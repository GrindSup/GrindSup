// src/pages/Entrenadores/EditarEntrenador.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Button, Card, CardBody, CardHeader, Container,
  Grid, GridItem, Heading, Input, Stack, Text, useToast,
  FormControl, FormLabel, FormErrorMessage
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import axios from '../../config/axios.config';

const API = import.meta?.env?.VITE_API_BASE_URL || "http://localhost:8080/api";

export default function EditarEntrenador({ apiBaseUrl = API }) {
  const { idEntrenador } = useParams();
  const toast = useToast();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [entrenador, setEntrenador] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    experiencia: ""
  });

  // Cargar entrenador
  useEffect(() => {
    const fetchEntrenador = async () => {
      try {
        const { data } = await axios.get(`${apiBaseUrl}/entrenadores/${idEntrenador}`);
        setEntrenador({
          idEntrenador: data.idEntrenador,
          nombre: data.usuario?.nombre || "",
          apellido: data.usuario?.apellido || "",
          correo: data.usuario?.correo || "",
          telefono: data.telefono || "",
          experiencia: data.experiencia || ""
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
    setEntrenador(prev => ({ ...prev, [name]: value }));
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
      // Payload que coincide con el backend, sin estado
      const payload = {
        experiencia: entrenador.experiencia,
        telefono: entrenador.telefono,
        usuario: {
          nombre: entrenador.nombre,
          apellido: entrenador.apellido,
          correo: entrenador.correo
        }
      };

      await axios.put(`${apiBaseUrl}/entrenadores/${idEntrenador}`, payload);

      toast({
        status: "success",
        title: "Entrenador actualizado correctamente",
        position: "top",
      });
      navigate("/entrenadores");
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
            <Heading size="lg">Editar Entrenador</Heading>
            <Text color="gray.600" mt={2}>
              Modificá los datos del entrenador y guardá los cambios.
            </Text>
          </CardHeader>

          <CardBody pt={6} px={{ base: 6, md: 10 }} pb={8}>
            <Box as="form" onSubmit={onSubmit}>
              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={5}>
                <GridItem>
                  <FormControl isRequired isInvalid={submitted && !!errors.nombre}>
                    <FormLabel>Nombre</FormLabel>
                    <Input name="nombre" value={entrenador.nombre} onChange={handleChange} />
                    {submitted && <FormErrorMessage>{errors.nombre}</FormErrorMessage>}
                  </FormControl>
                </GridItem>

                <GridItem>
                  <FormControl isRequired isInvalid={submitted && !!errors.apellido}>
                    <FormLabel>Apellido</FormLabel>
                    <Input name="apellido" value={entrenador.apellido} onChange={handleChange} />
                    {submitted && <FormErrorMessage>{errors.apellido}</FormErrorMessage>}
                  </FormControl>
                </GridItem>

                <GridItem colSpan={2}>
                  <FormControl isRequired isInvalid={submitted && !!errors.correo}>
                    <FormLabel>Correo</FormLabel>
                    <Input name="correo" value={entrenador.correo} onChange={handleChange} />
                    {submitted && <FormErrorMessage>{errors.correo}</FormErrorMessage>}
                  </FormControl>
                </GridItem>

                <GridItem colSpan={2}>
                  <FormControl isRequired isInvalid={submitted && !!errors.telefono}>
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

              <Stack direction={{ base: "column", md: "row" }} spacing={4} mt={8} justify="center">
                <Button type="submit" isLoading={submitting} loadingText="Guardando" px={10} bg="#258d19" color="white">
                  Guardar cambios
                </Button>
                <Button variant="ghost" onClick={() => navigate("/entrenadores")}>Cancelar</Button>
              </Stack>
            </Box>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
}