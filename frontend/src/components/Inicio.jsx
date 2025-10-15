import {
  Box, Container, Heading, Text, Button, Stack, Grid, Card, CardHeader,
  CardBody, Icon, Image
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { MdPeople, MdEvent, MdFitnessCenter, MdDashboard } from "react-icons/md";

export default function Inicio({ usuario }) {
  const isLoggedIn = !!usuario || !!localStorage.getItem("usuario");
  return isLoggedIn ? <InicioPrivado /> : <InicioPublico />;
}

/* === Público: hero verde sobre fondo blanco === */
function InicioPublico() {
  const features = [
    { t: "Gestioná alumnos", d: "Altas, edición y seguimiento." },
    { t: "Agendá turnos", d: "Clases individuales o grupales." },
    { t: "Centralizá tu trabajo", d: "Todo en un solo lugar." },
  ];

  return (
    <Box bg="#228B22">
      <Box
        bg="#0f4d11ff"
        color="white"
        borderRadius={{ base: "xl", md: "2xl" }}
        mx={{ base: 3, md: 6 }}
        mt={{ base: 4, md: 6 }}
        mb={{ base: 8, md: 12 }}
        px={{ base: 6, md: 12 }}
        py={{ base: 8, md: 14 }}
        boxShadow="0 16px 36px rgba(0,0,0,.18)"
      >
        <Container maxW="container.xl" centerContent>
          <Image
            src="/vite.png"
            alt="GrindSup"
            boxSize={{ base: "160px", md: "220px" }}
            mb={{ base: 2, md: 4 }}
            draggable={false}
          />
          <Heading
            size={{ base: "xl", md: "2xl" }}
            textAlign="center"
            lineHeight="1.15"
            mb={3}
            fontWeight={800}
          >
            La plataforma para{" "}
            <Box as="span" color="brand.300">entrenadores</Box> y{" "}
            <Box as="span" color="brand.300">personal trainers</Box>
          </Heading>
          <Text textAlign="center" opacity={0.95} mb={6} fontSize={{ base: "md", md: "lg" }}>
            Gestioná <b>alumnos</b>, <b>turnos</b> y <b>progreso</b> de forma simple y desde cualquier dispositivo.
          </Text>
          <Stack direction={{ base: "column", sm: "row" }} spacing={4}>
            <Button as={RouterLink} to="/registro" variant="solid" bg="brand.300">
              Registrar
            </Button>
            <Button as={RouterLink} to="/login" variant="solid" bg="brand.300">Iniciar sesión</Button>
          </Stack>
        </Container>
      </Box>

      <Container maxW="container.xl" pb={{ base: 10, md: 16 }}>
        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
          {features.map((f) => (
            <Card key={f.t}
                  _hover={{ boxShadow: "xl", transform: "translateY(-4px)" }}
                  transition="all .2s">
              <CardBody>
                <Heading size="md" color="gray.900" mb={1}>{f.t}</Heading>
                <Text color="gray.600">{f.d}</Text>
              </CardBody>
            </Card>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

/* === Privado: panel blanco centrado sobre verde === */
function InicioPrivado() {
  const items = [
    { t: "Dashboard", i: MdDashboard, to: "/dashboard", desc: "Vista general" },
    { t: "Alumnos", i: MdPeople, to: "/alumnos", desc: "Listado y gestión" },
    { t: "Turnos", i: MdEvent, to: "/turnos", desc: "Agenda y calendario" },
    { t: "Rutinas", i: MdFitnessCenter, to: "/rutinas", desc: "Planes de entrenamiento" },
  ];

  return (
    <Box bg="#228B22" py={{ base: 8, md: 10 }}>
      <Container maxW="7xl">
        <Box bg="#228B22" borderRadius="2xl" px={{ base: 6, md: 10 }} py={{ base: 6, md: 8 }}>
          <Heading size="lg" textAlign="center" mb={8} color="white" fontWeight={800}>
            ¡Hola! <Text as="span" fontWeight="semibold">¿Qué querés hacer hoy?</Text>
          </Heading>

          <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={6}>
            {items.map((it) => (
              <Card key={it.t} as={RouterLink} to={it.to} borderRadius="xl"
                    _hover={{ textDecoration: "none", transform: "translateY(-4px)", boxShadow: "lg" }}
                    transition="all .2s">
                <CardHeader pb={2}>
                  <Stack direction="row" align="center" spacing={3}>
                    <Icon as={it.i} boxSize={7} color="brand.700" />
                    <Heading size="md" color="gray.800" noOfLines={1} overflow="hidden" textOverflow="ellipsis" flex="1" minW={0}>{it.t}</Heading>
                  </Stack>
                </CardHeader>
                <CardBody pt={0}>
                  <Text color="gray.600">{it.desc}</Text>
                </CardBody>
              </Card>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}