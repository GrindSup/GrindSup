import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Button, Card, CardBody, CardHeader, Container, Grid, GridItem,
  Heading, Input, Stack, Text, useToast, FormControl, FormLabel,
  FormErrorMessage, Textarea, Checkbox
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export function EditarAlumnoForm({
  apiBaseUrl = import.meta?.env?.VITE_API_BASE_URL || "http://localhost:8080/api",
}) {
  const { id } = useParams();
  const toast = useToast();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [alumno, setAlumno] = useState({
    nombre: "", apellido: "", documento: "", peso: "", altura: "",
    lesiones: "", enfermedades: "", informeMedico: false, telefono: "",
  });

  useEffect(() => {
    const fetchAlumno = async () => {
      try {
        const res = await axios.get(`${apiBaseUrl}/alumnos/${id}`);
        setAlumno({ ...res.data, telefono: res.data.telefono || "" });
      } catch (err) {
        toast({ status: "error", title: "Error al cargar alumno", description: err.message, position: "top" });
      }
    };
    fetchAlumno();
  }, [id, apiBaseUrl, toast]);

  const errors = useMemo(() => {
    const e = {};
    if (!alumno.nombre?.trim()) e.nombre = "El nombre es obligatorio";
    if (!alumno.apellido?.trim()) e.apellido = "El apellido es obligatorio";
    if (alumno.peso && !/^[0-9]+$/.test(alumno.peso)) e.peso = "El peso debe ser numérico";
    if (alumno.altura && !/^[0-9]+$/.test(alumno.altura)) e.altura = "La altura debe ser numérica";
    if (alumno.telefono && !/^\+?\d+$/.test(alumno.telefono)) e.telefono = "El teléfono debe ser numérico y puede incluir +";
    return e;
  }, [alumno]);

  const isValid = Object.keys(errors).length === 0;
  const handleChange = (e) => setAlumno((p) => ({ ...p, [e.target.name]: e.target.value }));

  const buildPayload = () => ({
    nombre: alumno.nombre.trim(),
    apellido: alumno.apellido.trim(),
    documento: alumno.documento,
    peso: alumno.peso ? Number(alumno.peso) : null,
    altura: alumno.altura ? Number(alumno.altura) : null,
    lesiones: alumno.lesiones?.trim() || null,
    enfermedades: alumno.enfermedades?.trim() || null,
    informeMedico: alumno.informeMedico,
    telefono: alumno.telefono?.trim(),
    estado: alumno.estado || { id_estado: 1 },
    entrenador: null,
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (!isValid) {
      toast({ status: "warning", title: "Revisá los campos obligatorios", position: "top" });
      return;
    }
    setSubmitting(true);
    try {
      const payload = buildPayload();
      await axios.put(`${apiBaseUrl}/alumnos/${id}`, payload);
      toast({ status: "success", title: "Alumno actualizado", position: "top" });
      navigate("/alumnos");
    } catch (err) {
      toast({ status: "error", title: "No se pudo actualizar", description: err.message, position: "top" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box py={{ base: 8, md: 12 }}>
      <Container maxW="container.sm">
        <Card>
          <CardHeader textAlign="center" pb={0}>
            <Heading size="2xl" color="brand.700">GrindSup</Heading>
            <Heading size="lg" mt={2}>Editar Alumno</Heading>
            <Text color="gray.600" mt={2}>Modificá los datos necesarios y guardá los cambios.</Text>
          </CardHeader>
          <CardBody pt={6} px={{ base: 6, md: 10 }} pb={8}>
            <Box as="form" onSubmit={onSubmit}>
              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={5}>
                <GridItem>
                  <FormControl isRequired isInvalid={submitted && !!errors.nombre}>
                    <FormLabel>Nombre</FormLabel>
                    <Input name="nombre" value={alumno.nombre} onChange={handleChange}/>
                    {submitted && <FormErrorMessage>{errors.nombre}</FormErrorMessage>}
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl isRequired isInvalid={submitted && !!errors.apellido}>
                    <FormLabel>Apellido</FormLabel>
                    <Input name="apellido" value={alumno.apellido} onChange={handleChange}/>
                    {submitted && <FormErrorMessage>{errors.apellido}</FormErrorMessage>}
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl isRequired>
                    <FormLabel>Documento (DNI)</FormLabel>
                    <Input name="documento" value={alumno.documento} isDisabled/>
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl isInvalid={submitted && !!errors.peso}>
                    <FormLabel>Peso (kg)</FormLabel>
                    <Input type="number" name="peso" value={alumno.peso || ""} onChange={handleChange}/>
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl isInvalid={submitted && !!errors.altura}>
                    <FormLabel>Altura (cm)</FormLabel>
                    <Input type="number" name="altura" value={alumno.altura || ""} onChange={handleChange}/>
                  </FormControl>
                </GridItem>
                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <FormControl isRequired isInvalid={submitted && !!errors.telefono}>
                    <FormLabel>Teléfono</FormLabel>
                    <Input name="telefono" placeholder="+541112345678"
                      value={alumno.telefono} onChange={handleChange}/>
                  </FormControl>
                </GridItem>
                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <FormControl>
                    <FormLabel>Historial de lesiones</FormLabel>
                    <Textarea name="lesiones" value={alumno.lesiones || ""} onChange={handleChange} rows={3}/>
                  </FormControl>
                </GridItem>
                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <FormControl>
                    <FormLabel>Enfermedades</FormLabel>
                    <Textarea name="enfermedades" value={alumno.enfermedades || ""} onChange={handleChange} rows={3}/>
                  </FormControl>
                </GridItem>
                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <FormControl>
                    <Checkbox
                      name="informeMedico"
                      isChecked={alumno.informeMedico}
                      onChange={(e) => setAlumno((p) => ({ ...p, informeMedico: e.target.checked }))}
                    >
                      Entregó informe médico
                    </Checkbox>
                  </FormControl>
                </GridItem>
              </Grid>

              <Stack direction={{ base: "column", md: "row" }} spacing={4} mt={8} justify="center">
                <Button type="submit" isLoading={submitting} loadingText="Guardando" px={10}>Guardar cambios</Button>
                <Button variant="ghost" onClick={() => navigate("/alumnos")}>Cancelar</Button>
              </Stack>
            </Box>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
}

export default EditarAlumnoForm;
