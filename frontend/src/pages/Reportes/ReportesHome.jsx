import { useNavigate } from "react-router-dom";
import {
  Box, Container, Heading, SimpleGrid, HStack, Text, Badge,
  Card, CardBody, Icon, VStack, Button, useColorModeValue, Spacer
} from "@chakra-ui/react";
import { FiUsers, FiBarChart2, FiTrendingUp, FiStar } from "react-icons/fi";
import BotonVolver from "../../components/BotonVolver";

function Tile({ icon, title, desc, badge, onClick }) {
  const bg = useColorModeValue("white", "gray.800");
  const hover = useColorModeValue("rgba(37,141,25,0.08)", "rgba(37,141,25,0.18)");

  return (
    <Card
      role="button"
      onClick={onClick}
      _hover={{ transform: "translateY(-4px)", boxShadow: "xl", bg: hover, cursor: "pointer" }}
      transition="all 180ms ease"
      bg={bg}
      borderRadius="2xl"
    >
      <CardBody>
        <VStack align="start" spacing={3}>
          <HStack spacing={3}>
            <Box
              w={12} h={12}
              display="grid" placeItems="center"
              borderRadius="xl"
              bg="rgba(37,141,25,0.15)"
            >
              <Icon as={icon} boxSize={6} color="#258d19" />
            </Box>
            <VStack align="start" spacing={0}>
              <HStack>
                <Heading size="md">{title}</Heading>
                {badge && <Badge colorScheme="green" variant="subtle">{badge}</Badge>}
              </HStack>
              <Text fontSize="sm" color="gray.600">{desc}</Text>
            </VStack>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
}

export default function ReportesHome() {
  const navigate = useNavigate();

  return (
    <Container maxW="7xl" py={8}>
      <HStack align="center" mb={4} gap={3} wrap="wrap">
        <BotonVolver />
        <Heading size="lg" color="white">Reportes & Analítica</Heading>
        <Spacer />
        <Button onClick={() => navigate("/dashboard")} bg="#258d19" color="white" size="sm">
          Ir al Dashboard
        </Button>
      </HStack>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        <Tile
          icon={FiUsers}
          title="Alumnos — Altas/Bajas + Activos"
          desc="Evolución mensual de altas y bajas, con línea de alumnos activos al cierre de cada mes."
          badge="KPI"
          onClick={() => navigate("/reportes/alumnos")}
        />
        <Tile
          icon={FiStar}
          title="Evaluaciones de Planes"
          desc="Promedio mensual de ratings (0–5) y distribución de calificaciones por puntaje."
          // ✅ CORRECCIÓN: Apuntar a la ruta principal de Planes
          onClick={() => navigate("/reportes/planes")}
        />
        <Tile
          icon={FiBarChart2}
          title="Asistencia & Turnos"
          desc="Tendencias de asistencia, no-shows y horarios pico."
          badge="Próximamente"
          onClick={() => {}}
        />
        <Tile
          icon={FiTrendingUp}
          title="Progreso de Objetivos"
          desc="Indicadores de progreso y objetivos alcanzados por alumno/plan."
          badge="Próximamente"
          onClick={() => {}}
        />
      </SimpleGrid>
    </Container>
  );
}