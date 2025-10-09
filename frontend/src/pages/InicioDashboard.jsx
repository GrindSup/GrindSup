import { useMemo } from "react";
import {
  Box, Container, Grid, Heading, Text, Card, CardBody, Icon,
  chakra, useColorModeValue, Image
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { AddIcon, ViewIcon, CalendarIcon, SettingsIcon, InfoOutlineIcon } from "@chakra-ui/icons";
import { motion } from "framer-motion";

const MotionBox = motion(chakra.div);

export default function InicioDashboard() {
  const bg = useColorModeValue("gray.60", "gray.800");
  const cardBg = useColorModeValue("white", "gray.700");
  const glow = useColorModeValue("rgba(0, 0, 0, 0.82)", "rgba(6, 253, 109, 0.63)");

  const acciones = useMemo(() => ([
    { label: "Registrar Alumno", to: "/alumno/registrar", icon: AddIcon, desc: "Cargá nuevos alumnos." },
    { label: "Ver Alumnos",      to: "/alumnos",          icon: ViewIcon, desc: "Listado y edición." },
    { label: "Registrar Turno",  to: "/turnos/registrar", icon: CalendarIcon, desc: "Agendá clases." },
    { label: "Ver Turnos",       to: "/turnos",           icon: ViewIcon, desc: "Calendario y gestión." },
    { label: "Ejercicios",       to: "/ejercicios",       icon: InfoOutlineIcon, desc: "Catálogo (próx.)." },
    { label: "Rutinas",          to: "/rutinas",          icon: InfoOutlineIcon, desc: "Armar y asignar (próx.)." },
    { label: "Progreso",         to: "/progreso",         icon: InfoOutlineIcon, desc: "Reportes (próx.)." },
    { label: "Notificaciones",   to: "/notificaciones",   icon: InfoOutlineIcon, desc: "Alertas (próx.)." },
    { label: "Configuración",    to: "/config",           icon: SettingsIcon, desc: "Preferencias." },
  ]), []);

  return (
    <Box bg={bg} py={{ base: 8, md: 12 }}>
      <Container maxW="container.xl">
        {/* Hero / bienvenida */}
        <Box textAlign="center" mb={{ base: 8, md: 12 }}>
          <Image
            src="/vite2.png"
            alt="Logo de GrindSup"
            boxSize="280px" 
            mx="auto"       
            mb={2}          
          />
          {/* <Heading size="2xl" letterSpacing="tight">GrindSup</Heading> */}
          <Text mt={3} fontSize="lg" color="blackAlpha.800">
            Bienvenido/a a la <b>autogestión de tus alumnos</b>. Organizá turnos, registrá avances y centralizá todo en un solo lugar.
          </Text>
        </Box>

        {/* Grid de accesos */}
        <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }} gap={6}>
          {acciones.map((a) => (
            <MotionBox
              key={a.label}
              whileHover={{ y: -4, boxShadow: `0 10px 30px ${glow}`, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              borderRadius="2xl"
            >
              <Card
                as={RouterLink}
                to={a.to}
                role="group"
                aria-label={a.label}
                bg={cardBg}
                borderRadius="2xl"
                shadow="sm"
                _hover={{ textDecoration: "none", shadow: "lg" }}
                _focusWithin={{ boxShadow: `0 0 0 3px ${glow}` }}
              >
                <CardBody p={6}>
                  <Box display="flex" alignItems="center" gap={4} mb={2}>
                    <Box
                      p={3}
                      borderRadius="xl"
                      bg={useColorModeValue("green.50", "green.900")}
                      _groupHover={{ bg: useColorModeValue("green.100", "green.800") }}
                      transition="all .2s ease"
                    >
                      <Icon as={a.icon} boxSize={6} color="green.500" />
                    </Box>
                    <Heading size="md">{a.label}</Heading>
                  </Box>
                  <Text color="gray.500">{a.desc}</Text>
                </CardBody>
              </Card>
            </MotionBox>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}