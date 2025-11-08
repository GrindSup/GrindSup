import React, { useState, useMemo } from "react";
import { Box, Button, Card, CardBody, CardHeader, Container, Grid, GridItem, Heading, Input, Stack, Text, FormControl, FormLabel, FormErrorMessage, useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export default function RegistrarEntrenadores() {
  const toast = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [entrenador, setEntrenador] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    experiencia: "",
    correo: "",
  });

  const errors = useMemo(() => {
    const e = {};
    if (!entrenador.nombre.trim()) e.nombre = "El nombre es obligatorio";
    if (!entrenador.apellido.trim()) e.apellido = "El apellido es obligatorio";
    if (!entrenador.telefono.trim()) e.telefono = "El teléfono es obligatorio";
    else if (!/^\+?\d+$/.test(entrenador.telefono)) e.telefono = "El teléfono debe ser numérico (puede incluir +)";
    if (!entrenador.correo.trim()) e.correo = "El correo es obligatorio";
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
    if (!isValid) return;

    setSubmitting(true);
    try {
      const payload = {
        telefono: entrenador.telefono.trim(),
        experiencia: entrenador.experiencia.trim(),
        usuario: {
          nombre: entrenador.nombre.trim(),
          apellido: entrenador.apellido.trim(),
          correo: entrenador.correo.trim(),
        },
      };

      await axios.post(`${API}/entrenadores`, payload);
      toast({ status: "success", title: "Entrenador registrado correctamente", position: "top" });
      navigate("/entrenadores");
    } catch (err) {
      toast({ status: "error", title: "Error al registrar", description: err.message, position: "top" });
    } finally { setSubmitting(false); }
  };

  return (
    <Box py={8}>
      <Container maxW="container.md">
        <Card>
          <CardHeader textAlign="center">
            <Heading size="lg">Registrar Nuevo Entrenador</Heading>
            <Text color="gray.600" mt={2}>Complete los datos del entrenador</Text>
          </CardHeader>
          <CardBody pt={6}>
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
                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <FormControl isRequired isInvalid={submitted && !!errors.telefono}>
                    <FormLabel>Teléfono</FormLabel>
                    <Input name="telefono" value={entrenador.telefono} onChange={handleChange} placeholder="+541112345678" />
                    {submitted && <FormErrorMessage>{errors.telefono}</FormErrorMessage>}
                  </FormControl>
                </GridItem>
                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <FormControl isRequired isInvalid={submitted && !!errors.correo}>
                    <FormLabel>Correo</FormLabel>
                    <Input name="correo" value={entrenador.correo} onChange={handleChange} placeholder="correo@ejemplo.com" />
                    {submitted && <FormErrorMessage>{errors.correo}</FormErrorMessage>}
                  </FormControl>
                </GridItem>
                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <FormControl>
                    <FormLabel>Experiencia</FormLabel>
                    <Input name="experiencia" value={entrenador.experiencia} onChange={handleChange} placeholder="Ej: 5 años entrenando equipos juveniles" />
                  </FormControl>
                </GridItem>
              </Grid>
              <Stack direction={{ base: "column", md: "row" }} spacing={4} mt={8} justify="center">
                <Button type="submit" isLoading={submitting} loadingText="Registrando" px={10} bg="#258d19" color="white">Registrar</Button>
                <Button variant="ghost" onClick={() => navigate("/entrenadores")}>Cancelar</Button>
              </Stack>
            </Box>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
}