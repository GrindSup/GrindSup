import {
  Box, Container, Flex, Text, Button, IconButton, Menu,
  MenuButton, MenuList, MenuItem, Image, Spacer
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { useNavigate, useLocation } from "react-router-dom";

export default function Header({ usuario, setUsuario }) {
  const navigate = useNavigate();
  const location = useLocation(); // para saber la ruta actual
  const isLoggedIn = !!usuario;

  const go = (path) => navigate(path);

  const handleLogout = async () => {

    const confirmar = window.confirm("¿Estás seguro de que querés cerrar la sesión?");

    if (!confirmar) {
      return; 
    }

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
  ];

  // No mostrar menú en login o registro
  const hideMenu = location.pathname === "/login" || location.pathname === "/registro";

  return (
    <Box as="header" bg="white" borderBottom="1px" borderColor="gray.200">
      <Container maxW="container.xl" py={3}>
        <Flex align="center">
          
          {/* Logo */}
          <Flex align="center" gap={2} cursor="pointer" onClick={() => go("/")}>
            <Image src="/vite.png" alt="GrindSup" boxSize="30px" />
            <Text fontWeight="bold" fontSize="xl" color="green.800">GrindSup</Text>
          </Flex>

          <Spacer />

          {/* Menú hamburguesa centrado, solo si no estamos en login/registro y usuario logueado */}
          {!hideMenu && isLoggedIn && (
            <Flex flex="1" justify="center">
              <Menu>
                <MenuButton
                  as={IconButton}
                  icon={<HamburgerIcon />}
                  aria-label="Abrir menú"
                  variant="ghost"
                />
                <MenuList>
                  {items.map(i => (
                    <MenuItem key={i.path} onClick={() => go(i.path)}>
                      {i.label}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            </Flex>
          )}

          <Spacer />

          {/* Botón de cierre de sesión o iniciar sesión */}
          {!hideMenu && (
            isLoggedIn ? (
              <Button size="sm" colorScheme="red" onClick={handleLogout} bg="#0f4d11ff">
                Cerrar sesión
              </Button>
            ) : (
              <Button size="sm" colorScheme="green" onClick={() => go("/login")} bg="#0f4d11ff">
                Iniciar sesión
              </Button>
            )
          )}
          
        </Flex>
      </Container>
    </Box>
  );
}
