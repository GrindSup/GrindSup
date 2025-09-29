import {
  Box,
  Container,
  Flex,
  HStack,
  Text,
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";

export default function Header({ usuario, setUsuario, setShowLogin }) {
  const isLoggedIn = !!usuario;
  const { isOpen, onOpen, onClose } = useDisclosure(); // modal control

  const handleLogout = async () => {
    onClose(); // cierra el modal

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
  };

  return (
    <Box as="header" bg="white" borderBottom="1px" borderColor="gray.200">
      <Container maxW="container.xl" py={3}>
        <Flex align="center" minH="64px">
          {/* Logo */}
          <Flex w={{ base: "auto", md: "220px" }} align="center">
            <Text fontWeight="bold" fontSize="xl" color="brand.600">
              GrindSup
            </Text>
          </Flex>

          {/* Menú de navegación */}
          <Flex flex="1" justify="center">
            <HStack
              spacing={8}
              display={{ base: "none", md: "flex" }}
              fontWeight={500}
              color="gray.700"
            >
              <Text _hover={{ color: "brand.600", cursor: "pointer" }}>Inicio</Text>
              <Text _hover={{ color: "brand.600", cursor: "pointer" }}>Alumnos</Text>
              <Text _hover={{ color: "brand.600", cursor: "pointer" }}>Entrenadores</Text>
              <Text _hover={{ color: "brand.600", cursor: "pointer" }}>Contacto</Text>
            </HStack>

            <Menu>
              <MenuButton
                as={IconButton}
                icon={<HamburgerIcon />}
                aria-label="Abrir menú"
                display={{ base: "inline-flex", md: "none" }}
                variant="ghost"
              />
              <MenuList>
                <MenuItem>Inicio</MenuItem>
                <MenuItem>Alumnos</MenuItem>
                <MenuItem>Entrenadores</MenuItem>
                <MenuItem>Contacto</MenuItem>
              </MenuList>
            </Menu>
          </Flex>

          {/* Botón de login / logout */}
          <Flex w={{ base: "auto", md: "220px" }} justify="flex-end">
            {!isLoggedIn ? (
              <Button
                size="sm"
                colorScheme="brand"
                onClick={() => setShowLogin(true)}
              >
                Iniciar sesión
              </Button>
            ) : (
              <>
                <Button size="sm" colorScheme="red" onClick={onOpen}>
                  Cerrar sesión
                </Button>

                {/* Modal de confirmación */}
                <Modal isOpen={isOpen} onClose={onClose} isCentered>
                  <ModalOverlay />
                  <ModalContent>
                    <ModalHeader>Confirmar cierre de sesión</ModalHeader>
                    <ModalBody>
                      ¿Estás seguro de que quieres cerrar sesión?
                    </ModalBody>
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
