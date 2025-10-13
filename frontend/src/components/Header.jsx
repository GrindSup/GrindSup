import {
  Box, Container, Flex, HStack, Text, Button, IconButton, Menu,
  MenuButton, MenuList, MenuItem, useDisclosure, Image,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { useNavigate, useLocation } from "react-router-dom";

export default function Header({ usuario, setUsuario }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isLoggedIn = !!usuario;

  const go = (path) => navigate(path);

  const handleLogout = async () => {
    onClose();
    const sesionId = localStorage.getItem("sesionId");
    try {
      if (sesionId) {
        await fetch(`http://localhost:8080/api/usuarios/logout/${sesionId}`, { method: "PUT" });
      }
    } catch (e) {
      console.error("Error al cerrar sesión", e);
    } finally {
      localStorage.removeItem("usuario");
      localStorage.removeItem("sesionId");
      setUsuario?.(null);
      go("/login");
    }
  };

  const items = [
    { label: "Inicio", path: "/" },
    { label: "Alumnos", path: "/alumnos" },
    { label: "Entrenadores", path: "/entrenadores" },
    { label: "Turnos", path: "/turnos" },
    { label: "Ejercicios", path: "/ejercicios" },
    { label: "Contacto", path: "/contacto" },
    { label: "Visualizar Ejercicio", path: "/ejercicio/visualizar" } // Ejemplo de ruta para visualizar un ejercicio
  ];

  return (
    <Box as="header" bg="white" borderBottom="1px" borderColor="gray.200">
      <Container maxW="container.xl" py={3}>
        <Flex align="center" minH="64px">
          {/* Logo / Home */}
          <Flex w={{ base: "auto", md: "220px" }} align="center" gap={2} onClick={() => go("/")} cursor="pointer">
            <Image src="/vite.png" alt="GrindSup" boxSize="30px" />
            <Text fontWeight="bold" fontSize="xl" color="green.700">GrindSup</Text>
          </Flex>

          {/* Nav central (solo logueado) */}
          <Flex flex="1" justify="center">
            {isLoggedIn && (
              <>
                <HStack spacing={8} display={{ base: "none", md: "flex" }} fontWeight={500} color="gray.700">
                  {items.map(i => (
                    <Text key={i.path} _hover={{ color: "green.600", cursor: "pointer" }} onClick={() => go(i.path)}>
                      {i.label}
                    </Text>
                  ))}
                </HStack>

                {/* Menú mobile */}
                <Menu isOpen={isOpen} onClose={onClose}>
                  <MenuButton
                    as={IconButton}
                    icon={<HamburgerIcon />}
                    aria-label="Abrir menú"
                    display={{ base: "inline-flex", md: "none" }}
                    variant="ghost"
                    onClick={onOpen}
                  />
                  <MenuList>
                    {items.map(i => (
                      <MenuItem key={i.path} onClick={() => go(i.path)}>{i.label}</MenuItem>
                    ))}
                    <MenuItem onClick={handleLogout} color="red.600">Cerrar sesión</MenuItem>
                  </MenuList>
                </Menu>
              </>
            )}
          </Flex>

          {/* Botón derecho */}
          <Flex w={{ base: "auto", md: "220px" }} justify="flex-end">
            {!isLoggedIn ? (
              location.pathname !== '/login' && (
                <Button size="sm" colorScheme="green" onClick={() => go("/login")}>
                  Iniciar sesión
                </Button>
              )
            ) : (
              <Button size="sm" colorScheme="red" onClick={handleLogout}>
                Cerrar sesión
              </Button>
            )}
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
}