// frontend/src/pages/InicioDashboard.jsx
import { useMemo } from "react";
import {
  Box, Container, Grid, Heading, Text, Card, CardBody, Icon, Image, Badge,
  chakra, Tooltip
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { AddIcon, ViewIcon, CalendarIcon } from "@chakra-ui/icons";
import { FiActivity, FiMap, FiCopy } from "react-icons/fi";
import { FaRunning } from "react-icons/fa";
import { motion } from "framer-motion";
const MotionBox = motion(chakra.div);

export default function InicioDashboard() {
  const bg = "transparent";
  const borderCol = "rgba(255,255,255,0.16)";
  const textPrimary = "black";
  const textSecondary = "black";
  const iconCol = "white";

  const acciones = useMemo(
    () => [
      // Existentes
      { label: "Registrar Alumno", to: "/alumno/registrar", icon: AddIcon,      desc: "Cargá nuevos alumnos.", available: true },
      { label: "Ver Alumnos",      to: "/alumnos",          icon: ViewIcon,     desc: "Listado y edición.", available: true },
      { label: "Registrar Turno",  to: "/turnos/registrar", icon: CalendarIcon, desc: "Agendá clases.", available: true },
      { label: "Ver Turnos",       to: "/turnos",           icon: ViewIcon,     desc: "Calendario y gestión.", available: true },
      { label: "Ejercicios",       to: "/ejercicios",       icon: FiActivity,   desc: "Catálogo.", available: true },
      { label: "Rutinas",          to: "/rutinas",          icon: FaRunning,    desc: "Planes de entrenamiento.", available: true },
      { label: "Planes",           to: "/planes",           icon: FiMap,        desc: "Planes por alumno.", available: true },
      // 🔹 NUEVOS accesos a reportes
      { label: "Reportes",         to: "/reportes",         icon: FiCopy,       desc: "Reportes y estadisticas.", available: true },
    ],
    []
  );

  return (
    <Box bg={bg} py={{ base: 8, md: 12 }}>
      <Container maxW="container.xl">
        {/* Panel superior */}
        <Box
          bg="#e8e8e8ff"
          border="1px solid"
          borderColor="rgba(255,255,255,0.12)"
          borderRadius="2xl"
          backdropFilter="blur(4px)"
          px={{ base: 6, md: 10 }}
          py={{ base: 6, md: 8 }}
          textAlign="center"
          boxShadow="0 12px 30px rgba(0,0,0,.18)"
        >
          <Image src="/vite.png" alt="GrindSup" boxSize={{ base: "72px", md: "202px" }} mx="auto" mb={2} />
          <Heading size="lg" color={textPrimary} fontWeight="900" letterSpacing="-0.01em" mb={1}>
            Tu panel
          </Heading>
          <Text fontSize="lg" color={textSecondary}>
            Autogestioná alumnos, turnos y rutinas desde un solo lugar.
          </Text>
        </Box>

        {/* Grid de acciones */}
        <Grid mt={{ base: 6, md: 8 }} templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }} gap={6}>
          {acciones.map((a) => {
            const Wrapper = a.available ? RouterLink : "div";
            const linkProps = a.available ? { as: Wrapper, to: a.to } : { as: Wrapper, "aria-disabled": true };

            return (
              <MotionBox
                key={a.label}
                whileHover={{ y: a.available ? -4 : 0, scale: a.available ? 1.02 : 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                borderRadius="2xl"
              >
                <Tooltip label={a.comingSoon ? "Próximamente" : ""} isDisabled={!a.comingSoon} hasArrow>
                  <Card
                    {...linkProps}
                    role="group"
                    bg="#e8e8e8ff"
                    borderRadius="2xl"
                    border="1px solid"
                    borderColor={borderCol}
                    _hover={{
                      textDecoration: "none",
                      bg: "#87c987ff",
                      boxShadow: "0 8px 20px rgba(5,239,28,0.2), 0 4px 10px rgba(0,0,0,0.08)",
                      cursor: a.available ? "pointer" : "not-allowed"
                    }}
                    backdropFilter="blur(3px)"
                  >
                    {a.comingSoon && (
                      <Badge position="absolute" top={3} right={3} colorScheme="yellow" borderRadius="full" px={2.5} py={0.5} fontSize="xs" fontWeight="700">
                        Próximamente
                      </Badge>
                    )}
                    <CardBody p={6}>
                      <Box display="flex" alignItems="center" gap={4} mb={2}>
                        <Box p={3} borderRadius="xl" bg="#258d19" _groupHover={{ bg: "rgba(255,255,255,0.16)" }} transition="all .2s ease">
                          <Icon as={a.icon} boxSize={6} color={iconCol} />
                        </Box>
                        <Heading size="md" color={textPrimary}>{a.label}</Heading>
                      </Box>
                      <Text color={textSecondary}>{a.desc}</Text>
                    </CardBody>
                  </Card>
                </Tooltip>
              </MotionBox>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
}
