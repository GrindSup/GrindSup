import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Stack,
  Grid,
  Card,
  CardBody,
  Icon,
  useColorModeValue,
  Image,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { CheckCircleIcon } from "@chakra-ui/icons";

export default function Inicio({ onLoginClick }) {
  const bg = useColorModeValue("gray.60", "gray.800");
  const cardBg = useColorModeValue("white", "gray.700");

  const features = [
    { t: "Gestioná alumnos", d: "Altas, edición y seguimiento." },
    { t: "Agendá turnos", d: "Clases individuales o grupales." },
    { t: "Centralizá tu trabajo", d: "Todo en un solo lugar." },
  ];

  return (
    <Box bg={bg} py={{ base: 10, md: 16 }}>
      <Container maxW="container.xl">
        {/* HERO */}
        <Stack spacing={5} textAlign="center" align="center" mb={{ base: 10, md: 14 }}>
          <Image
            src="/vite.png" 
            alt="Logo de GrindSup"
            boxSize="280px" 
            objectFit="contain"
          />
          {/* <Heading size="2xl" letterSpacing="tight">GrindSup</Heading> */}
          <Text maxW="3xl" fontSize={{ base: "md", md: "lg" }} color="blackAlpha.800">
            Bienvenido/a a <b>GrindSup</b>, la plataforma para entrenadores y personal trainers.
            Autogestioná <b>alumnos</b>, <b>turnos</b> y <b>progreso</b> de forma simple y desde cualquier dispositivo.
          </Text>

          <Stack direction={{ base: "column", sm: "row" }} spacing={4} mt={2}>
            <Button
              as={RouterLink}
              to="/registro"
              size="lg"
              bg="#38A169"       
              color="white"
            >
              Registrar
            </Button>
            <Button
              size="lg"
              variant="solid"
              bg="#38A169"
              color="white"
              onClick={() => onLoginClick?.()}
            >
              Iniciar sesión
            </Button>
          </Stack>
        </Stack>

        {/* FEATURES */}
        <Grid
          templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
          gap={6}
        >
          {features.map((f) => (
            <Card key={f.t} bg={cardBg} borderRadius="2xl" shadow="2xl" _hover={{ shadow: "md" }}>
              <CardBody>
                <Stack direction="row" spacing={4} align="start">
                  <Icon as={CheckCircleIcon} color="green.500" boxSize={6} />
                  <Stack spacing={1}>
                    <Heading size="md">{f.t}</Heading>
                    <Text color="gray.600">{f.d}</Text>
                  </Stack>
                </Stack>
              </CardBody>
            </Card>
          ))}
        </Grid>

        <Text textAlign="center" mt={10} color="blackAlpha.800" fontSize="sm">
          ¿Listo/a para empezar? Creá tu cuenta o iniciá sesión y probá GrindSup.
        </Text>
      </Container>
    </Box>
  );
}