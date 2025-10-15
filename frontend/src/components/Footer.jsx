import { Box, Container, Stack, Text, Divider } from "@chakra-ui/react";

export default function Footer() {
  return (
    <Box
      as="footer"
      bg="white"
      borderTop="1px"
      borderColor="gray.200"
      py={6}
      mt="auto"               // 👈 clave para sticky
    >
      <Container maxW="container.lg">
        <Stack spacing={3} textAlign="center">
          <Text fontWeight="bold" fontSize="lg" color="brand.700">
            GrindSup
          </Text>
          <Divider />
          <Text fontSize="sm" color="gray.500">
            © {new Date().getFullYear()} GrindSup. Todos los derechos reservados.
          </Text>
          <Text fontSize="xs" color="gray.400">
            Desarrollado con ❤️ por el equipo UTN-FRC
          </Text>
        </Stack>
      </Container>
    </Box>
  );
}