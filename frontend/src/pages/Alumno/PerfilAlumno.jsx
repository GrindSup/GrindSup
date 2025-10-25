import React, { useEffect, useState } from "react";
import {
  Box, Button, Card, CardBody, CardHeader, Container,
  Heading, Text, useToast, Spinner, Stack, Grid, GridItem,
  Badge, Divider, HStack, Tag
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const API = import.meta?.env?.VITE_API_BASE_URL || "http://localhost:8080/api";

// Helper para parsear las notas (lesiones/enfermedades)
function parseNotes(raw) {
  if (!raw) return [];
  try {
    const j = JSON.parse(raw);
    if (Array.isArray(j?.items)) {
      return j.items
        .map(it => ({ text: String(it.text ?? "").trim(), important: !!it.important }))
        .filter(it => it.text);
    }
  } catch {}
  return [];
}

// Pequeño componente para mostrar datos de forma consistente
function InfoItem({ label, value }) {
  return (
    <Box>
      <Text fontSize="sm" color="gray.500">{label}</Text>
      <Text fontSize="md" fontWeight="medium">{value || "-"}</Text>
    </Box>
  );
}

export default function PerfilAlumno({ apiBaseUrl = API }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [alumno, setAlumno] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlumno = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${apiBaseUrl}/alumnos/${id}`);
        setAlumno(data);
        setError(null);
      } catch (err) {
        setError("No se pudo cargar la información del alumno.");
        toast({ status: "error", title: "Error al cargar alumno", description: err.message, position: "top" });
      } finally {
        setLoading(false);
      }
    };
    fetchAlumno();
  }, [id, apiBaseUrl, toast]);

  if (loading) {
    return <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />;
  }

  if (error) {
    return <Text color="red.500">{error}</Text>;
  }

  if (!alumno) {
    return <Text>Alumno no encontrado.</Text>;
  }
  
  const lesiones = parseNotes(alumno.lesiones);
  const enfermedades = parseNotes(alumno.enfermedades);

  return (
    <Container maxW="container.md" py={8}>
      <Card>
        <CardHeader>
          <Heading size="lg">{alumno.nombre} {alumno.apellido}</Heading>
          <Text color="gray.600">Perfil del Alumno</Text>
        </CardHeader>

        <CardBody>
          <Stack spacing={6}>
            <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
              <InfoItem label="Documento (DNI)" value={alumno.documento} />
              <InfoItem label="Teléfono" value={alumno.telefono} />
              <InfoItem label="Fecha de Nacimiento" value={new Date(alumno.fechaNacimiento).toLocaleDateString('es-AR')} />
              <InfoItem label="Peso" value={alumno.peso ? `${alumno.peso} kg` : "-"} />
              <InfoItem label="Altura" value={alumno.altura ? `${alumno.altura} cm` : "-"} />
              <InfoItem label="Informe Médico" value={alumno.informe_medico ? "Entregado" : "Pendiente"} />
            </Grid>

            <Divider />

            {/* Sección de Lesiones */}
            <Box>
              <Heading size="md" mb={3}>Lesiones</Heading>
              {lesiones.length > 0 ? (
                <HStack wrap="wrap" spacing={2}>
                  {lesiones.map((item, index) => (
                    <Tag key={index} size="lg" colorScheme={item.important ? "red" : "gray"}>
                      {item.text}
                    </Tag>
                  ))}
                </HStack>
              ) : <Badge>Sin registros</Badge>}
            </Box>

            {/* Sección de Enfermedades */}
            <Box>
              <Heading size="md" mb={3}>Enfermedades</Heading>
              {enfermedades.length > 0 ? (
                <HStack wrap="wrap" spacing={2}>
                  {enfermedades.map((item, index) => (
                    <Tag key={index} size="lg" colorScheme={item.important ? "red" : "gray"}>
                      {item.text}
                    </Tag>
                  ))}
                </HStack>
              ) : <Badge>Sin registros</Badge>}
            </Box>

            <Divider />

            <Stack direction="row" spacing={4} justify="center" mt={4}>
              <Button onClick={() => navigate(`/alumno/editar/${id}`)} colorScheme="blue" bg="#258d19">
                Editar Alumno
              </Button>
              <Button variant="ghost" onClick={() => navigate("/alumnos")}>
                Volver a la Lista
              </Button>
            </Stack>
          </Stack>
        </CardBody>
      </Card>
    </Container>
  );
}
