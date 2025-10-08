// Header.jsx
import {
  Box, Container, Flex, HStack, Text, Button, IconButton, Menu,
  MenuButton, MenuList, MenuItem, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalBody, ModalFooter, useDisclosure,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";

export default function Header({ usuario, setUsuario, setShowLogin }) {
  const navigate = useNavigate();
  const isLoggedIn = !!usuario;
  const { isOpen, onOpen, onClose } = useDisclosure();

  const goHome = () => {
    setShowLogin(false);
    navigate("/");
  };

  const goLogin = () => {
    setShowLogin(true);
    navigate("/");
  };

  const handleLogout = async () => {
    onClose();
    const sesionId = localStorage.getItem("sesionId");
    if (sesionId) {
      try {
        await fetch(`http://localhost:8080/api/usuarios/logout/${sesionId}`, { method: "PUT" });
      } catch (err) {
        console.error("Error de red al cerrar sesión:", err);
      }
    }
    localStorage.removeItem("usuario");
    localStorage.removeItem("sesionId");
    setUsuario(null);
    goHome();
  };

  const menuItems = [
    { label: "Inicio", path: "/" },
    { label: "Alumnos", path: "/alumnos" },
    { label: "Entrenadores", path: "/entrenadores" },
    { label: "Contacto", path: "/contacto" },
  ];

  return (
    <Box as="header" bg="white" borderBottom="1px" borderColor="gray.200">
      <Container maxW="container.xl" py={3}>
        <Flex align="center" minH="64px">
          {/* Logo */}
          <Flex w={{ base: "auto", md: "220px" }} align="center">
            <Text
              fontWeight="bold"
              fontSize="xl"
              color="brand.600"
              _hover={{ cursor: "pointer", color: "brand.700" }}
              onClick={goHome}
            >
              GrindSup
            </Text>
          </Flex>

          {/* Nav central: SOLO si está logueado */}
          <Flex flex="1" justify="center">
            {isLoggedIn && (
              <>
                <HStack
                  spacing={8}
                  display={{ base: "none", md: "flex" }}
                  fontWeight={500}
                  color="gray.700"
                >
                  {menuItems.map((item) => (
                    <Text
                      key={item.label}
                      _hover={{ color: "brand.600", cursor: "pointer" }}
                      onClick={item.path === "/" ? goHome : () => navigate(item.path)}
                    >
                      {item.label}
                    </Text>
                  ))}
                </HStack>

                {/* Menú mobile */}
                <Menu>
                  <MenuButton
                    as={IconButton}
                    icon={<HamburgerIcon />}
                    aria-label="Abrir menú"
                    display={{ base: "inline-flex", md: "none" }}
                    variant="ghost"
                  />
                  <MenuList>
                    {menuItems.map((item) => (
                      <MenuItem
                        key={item.label}
                        onClick={item.path === "/" ? goHome : () => navigate(item.path)}
                      >
                        {item.label}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>
              </>
            )}
          </Flex>

          {/* Botón derecho */}
          <Flex w={{ base: "auto", md: "220px" }} justify="flex-end">
            {!isLoggedIn ? (
              <Button size="sm" colorScheme="brand" onClick={goLogin}>
                Iniciar sesión
              </Button>
            ) : (
              <>
                <Button size="sm" colorScheme="red" onClick={onOpen}>
                  Cerrar sesión
                </Button>

                <Modal isOpen={isOpen} onClose={onClose} isCentered>
                  <ModalOverlay />
                  <ModalContent>
                    <ModalHeader>Confirmar cierre de sesión</ModalHeader>
                    <ModalBody>¿Estás seguro de que quieres cerrar sesión?</ModalBody>
                    <ModalFooter>
                      <Button colorScheme="red" mr={3} onClick={handleLogout}>
                        Sí
                      </Button>
                      <Button onClick={onClose}>No</Button>
                    </ModalFooter>
                  </ModalContent>
                </Modal>
              </>
            )}
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
}
