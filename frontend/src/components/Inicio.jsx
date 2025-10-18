import {
  Box, Container, Heading, Text, Button, Stack, Grid, Card, CardBody, Image
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

export default function Inicio() {
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
          <Heading size={{ base: "xl", md: "2xl" }} textAlign="center" lineHeight="1.15" mb={3} fontWeight={800}>
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
            <Button as={RouterLink} to="/login" variant="solid" bg="brand.300">
              Iniciar sesión
            </Button>
          </Stack>
        </Container>
      </Box>

      <Container maxW="container.xl" pb={{ base: 10, md: 16 }}>
        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
          {features.map((f) => (
            <Card key={f.t} _hover={{ boxShadow: "xl", transform: "translateY(-4px)" }} transition="all .2s">
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
