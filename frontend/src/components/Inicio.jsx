// frontend/src/components/Inicio.jsx
import {
  Box, Container, Heading, Text, Button, Stack, Card, CardBody,
  Image, Icon, SimpleGrid, Badge
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { FiUsers, FiCalendar, FiLayers, FiCheckCircle } from "react-icons/fi";
import { px } from "framer-motion";

const HERO_IMG = "/img/hero-gym.jpg"; // poné tu foto en public/img/hero-gym.jpg

export default function Inicio({ usuario }) {
  const isLoggedIn = !!usuario || !!localStorage.getItem("usuario");
  return isLoggedIn ? <InicioPrivado /> : <InicioPublico />;
}

/* === Landing pública === */
function InicioPublico() {
  const features = [
    { t: "Gestioná alumnos", d: "Altas, edición y seguimiento.", icon: FiUsers },
    { t: "Agendá turnos", d: "Clases individuales o grupales.", icon: FiCalendar },
    { t: "Centralizá tu trabajo", d: "Todo en un solo lugar.", icon: FiLayers },
  ];
  const steps = [
    "Creá tu cuenta y configurá tu perfil.",
    "Cargá alumnos y armá planes/rutinas.",
    "Agendá turnos y compartí el PDF de la rutina.",
  ];

  return (
    <Box position="relative" minH="100vh" bg="#1E7E1E" overflow="hidden">
      {/* Fondo con foto + blur + tinte verdoso */}
      <Box position="absolute" inset="-10%" zIndex={0}>
        <Box
          position="absolute"
          inset="0"
          bgImage={`url(${HERO_IMG})`}
          bgSize="cover"
          bgPos="center"
          filter="blur(8px)"
          transform="scale(1.08)"
          opacity={0.65}
        />
        {/* Tinte verde para mantener marca */}
        <Box
          position="absolute"
          inset="0"
          bgGradient="linear(to-b, rgba(21,92,21,0.85), rgba(34,139,34,0.85))"
          mixBlendMode="multiply"
        />
      </Box>

      {/* HERO */}
      <Box position="relative" zIndex={1} pt={{ base: 12, md: 18 }} pb={{ base: 10, md: 14 }}>
        <Container maxW="6xl">
          <Stack align="center" spacing={{ base: 5, md: 7 }}>
            {/* Logo + halo (más grande) */}
            <Box position="relative">
              <Box
                position="absolute"
                inset="-18px"
                borderRadius="full"
                bg="radial-gradient(160px 160px at 50% 50%, rgba(255,255,255,0.25), transparent 72%)"
                filter="blur(8px)"
              />
              <Image
                src="/vite.png" // ideal: /logo-grindsup.svg
                alt="GrindSup"
                boxSize={{ base: "250px", md: "300px" }}
                draggable={false}
                position="relative"
              />
            </Box>

            <Badge
              bg="white"
              color="#0F4D11"
              borderRadius="full"
              px={3}
              py={1}
              fontWeight="700"
              boxShadow="sm"
              marginTop="-30px"
            >
              Pensado para entrenadores
            </Badge>

            <Heading
              as="h1"
              textAlign="center"
              color="white"
              fontWeight={900}
              letterSpacing="-0.02em"
              lineHeight="1.06"
              fontSize={{ base: "2xl", sm: "3xl", md: "4xl" }}
              maxW="900px"
            >
              La plataforma para entrenadores y personal trainers
            </Heading>

            <Text
              textAlign="center"
              color="whiteAlpha.900"
              fontSize={{ base: "md", md: "lg" }}
              maxW="860px"
            >
              Gestioná <b>alumnos</b>, <b>turnos</b> y <b>progreso</b> de forma simple.
              Exportá rutinas en <b>PDF</b> con tu marca y trabajá desde cualquier dispositivo.
            </Text>

            {/* CTAs con glow/hover */}
            <Stack direction={{ base: "column", sm: "row" }} spacing={4} pt={2}>
              <Button
                as={RouterLink}
                to="/registro"
                size="lg"
                bg="white"
                color="#0F4D11"
                px={8}
                py={5}
                borderRadius="xl"
                transition="all .2s"
                _hover={{
                  bg: "whiteAlpha.900",
                  boxShadow: "0 0 0 6px rgba(255,255,255,0.18)",
                  transform: "translateY(-2px)",
                }}
                _active={{ transform: "translateY(0)" }}
              >
                Crear cuenta
              </Button>
              <Button
                as={RouterLink}
                to="/login"
                size="lg"
                variant="outline"
                color="white"
                borderColor="white"
                px={8}
                py={5}
                borderRadius="xl"
                transition="all .2s"
                _hover={{
                  bg: "whiteAlpha.200",
                  boxShadow: "0 0 0 6px rgba(255,255,255,0.14)",
                  transform: "translateY(-2px)",
                }}
                _active={{ transform: "translateY(0)" }}
              >
                Iniciar sesión
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* BLOQUE BLANCO: features en tarjeta grande redondeada */}
      <Box position="relative" zIndex={1} bg="transparent" pb={{ base: 10, md: 14 }}>
        <Container maxW="container.xl">
          <Box
            bg="white"
            borderRadius="2xl"
            boxShadow="xl"
            p={{ base: 5, md: 8 }}
          >
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              {features.map((f) => (
                <Card
                  key={f.t}
                  bg="white"
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="blackAlpha.100"
                  boxShadow="md"
                  _hover={{ boxShadow: "xl", transform: "translateY(-3px)" }}
                  transition="all .2s"
                >
                  <CardBody>
                    <Stack direction="row" spacing={4} align="start">
                      <Box
                        bg="#E8F5E9"
                        borderRadius="xl"
                        p={2.5}
                        display="inline-flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Icon as={f.icon} boxSize={5} color="#0F4D11" />
                      </Box>
                      <Box>
                        <Heading size="md" color="gray.900" mb={1}>
                          {f.t}
                        </Heading>
                        <Text color="gray.600" fontSize="sm">
                          {f.d}
                        </Text>
                      </Box>
                    </Stack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>

            {/* “Cómo funciona” con las MISMAS cards que arriba */}
            <Heading
              as="h2"
              size="lg"
              textAlign="center"
              color="gray.900"
              mt={{ base: 8, md: 12 }}
              mb={{ base: 4, md: 6 }}
              fontWeight={800}
            >
              ¿Cómo funciona?
            </Heading>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              {steps.map((s, idx) => (
                <Card
                  key={idx}
                  bg="white"
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="blackAlpha.100"
                  boxShadow="sm"
                  _hover={{ boxShadow: "md", transform: "translateY(-2px)" }}
                  transition="all .2s"
                >
                  <CardBody>
                    <Stack direction="row" spacing={4} align="start">
                      <Box
                        bg="#E8F5E9"
                        borderRadius="xl"
                        p={2.5}
                        display="inline-flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Icon as={FiCheckCircle} boxSize={5} color="#0F4D11" />
                      </Box>
                      <Box>
                        <Text color="gray.800" fontWeight="600" mb={1}>
                          Paso {idx + 1}
                        </Text>
                        <Text color="gray.600" fontSize="sm">
                          {s}
                        </Text>
                      </Box>
                    </Stack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </Box>
        </Container>
      </Box>

      {/* CTA final */}
      <Container maxW="container.xl" py={{ base: 10, md: 14 }} position="relative" zIndex={1}>
        <Box
          bg="#0F4D11"
          color="white"
          borderRadius="2xl"
          px={{ base: 6, md: 10 }}
          py={{ base: 8, md: 10 }}
          textAlign="center"
          boxShadow="xl"
        >
          <Heading size="md" fontWeight={800} mb={3}>
            Empezá gratis hoy
          </Heading>
          <Text opacity={0.95} mb={5}>
            Probá GrindSup y organizá tus clases en minutos.
          </Text>
          <Stack direction={{ base: "column", sm: "row" }} spacing={4} justify="center">
            <Button
              as={RouterLink}
              to="/registro"
              bg="white"
              color="#0F4D11"
              borderRadius="xl"
              px={8}
              py={5}
              transition="all .2s"
              _hover={{ bg: "whiteAlpha.900", boxShadow: "0 0 0 6px rgba(255,255,255,0.18)", transform: "translateY(-2px)" }}
            >
              Crear cuenta
            </Button>
            <Button
              as={RouterLink}
              to="/login"
              variant="outline"
              borderColor="white"
              color="white"
              borderRadius="xl"
              px={8}
              py={5}
              transition="all .2s"
              _hover={{ bg: "whiteAlpha.200", boxShadow: "0 0 0 6px rgba(255,255,255,0.14)", transform: "translateY(-2px)" }}
            >
              Iniciar sesión
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

/* === Vista privada: atajo al dashboard === */
function InicioPrivado() {
  return (
    <Box bg="#228B22" py={{ base: 8, md: 10 }}>
      <Container maxW="7xl">
        <Box bg="white" borderRadius="2xl" boxShadow="xl" px={{ base: 6, md: 10 }} py={{ base: 6, md: 8 }}>
          <Heading size="lg" textAlign="center" mb={4} color="gray.900" fontWeight={800}>
            ¡Hola! <Text as="span" fontWeight="semibold">¿Qué querés hacer hoy?</Text>
          </Heading>
          <Text textAlign="center" color="gray.600">
            Andá al <Box as={RouterLink} to="/dashboard" color="#0F4D11" textDecoration="underline">dashboard</Box> para empezar.
          </Text>
        </Box>
      </Container>
    </Box>
  );
}
