// frontend/src/components/Header.jsx
import {
  Box,
  Container,
  Flex,
  Text,
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Image,
  Spacer,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Avatar,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { clearSessionCache, ensureEntrenadorId } from "../context/auth";
import { useState, useEffect } from "react";

export default function Header({ usuario, setUsuario }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!usuario;
  const isLoginPage = location.pathname === "/login";

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [logoutPending, setLogoutPending] = useState(false);
  const [entrenadorId, setEntrenadorId] = useState(null);

  const go = (path) => navigate(path);

  // 🔥 Resolver id_entrenador del usuario logueado
  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!isLoggedIn) {
        setEntrenadorId(null);
        return;
      }
      try {
        const id = await ensureEntrenadorId();
        if (active) setEntrenadorId(id ?? null);
      } catch (e) {
        console.error("No se pudo obtener entrenadorId", e);
        if (active) setEntrenadorId(null);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [isLoggedIn]);

  const handleLogout = async () => {
    setLogoutPending(true);
    const sesionId = localStorage.getItem("sesionId");
    try {
      if (sesionId) {
        await fetch(`http://localhost:8080/api/usuarios/logout/${sesionId}`, {
          method: "PUT",
        });
      }
    } catch (e) {
      console.error("Error al cerrar sesión", e);
    } finally {
      localStorage.removeItem("usuario");
      localStorage.removeItem("sesionId");
      localStorage.removeItem("gs_token");
      clearSessionCache();
      setUsuario?.(null);
      onClose();
      setLogoutPending(false);
      go("/login");
    }
  };

  const items = [
    { label: "Inicio", path: "/" },
    { label: "Alumnos", path: "/alumnos" },
    { label: "Turnos", path: "/turnos" },
    { label: "Planes", path: "/planes" },
    {
      label: "Perfil",
      path: entrenadorId ? `/entrenadores/perfil/${entrenadorId}` : "/",
    },
    { label: "Contacto", path: "/contacto" },
  ];

  // Solo ocultar el menú en login/register
  const hideMenu =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <Box as="header" bg="white" borderBottom="1px" borderColor="gray.200">
      <Container maxW="container.xl" py={3}>
        <Flex align="center">
          {/* Logo */}
          <Flex align="center" gap={2} cursor="pointer" onClick={() => go("/")}>
            <Image src="/vite.png" alt="GrindSup" boxSize="30px" />
            <Text fontWeight="bold" fontSize="xl" color="green.800">
              GrindSup
            </Text>
          </Flex>

          <Spacer />

          {/* Menú hamburguesa */}
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
                  {items.map((i) => (
                    <MenuItem key={i.path} onClick={() => go(i.path)}>
                      {i.label}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            </Flex>
          )}

          <Spacer />

          {/* Avatar + botón de sesión */}
          {isLoggedIn ? (
            <Flex align="center" gap={3}>
              {!hideMenu && (
                <Box
                  cursor={entrenadorId ? "pointer" : "default"}
                  onClick={() =>
                    entrenadorId && go(`/entrenadores/perfil/${entrenadorId}`)
                  }
                >
                  <Avatar
                    size="sm"
                    name={`${usuario?.nombre ?? ""} ${
                      usuario?.apellido ?? ""
                    }`}
                    src={usuario?.foto_perfil ?? ""}
                    bg="green.500"
                    color="white"
                  />
                </Box>
              )}

              <Button size="sm" onClick={onOpen} bg="#258d19" color="white">
                Cerrar sesión
              </Button>
            </Flex>
          ) : (
            !isLoginPage && (
              <Button
                size="sm"
                colorScheme="green"
                onClick={() => go("/login")}
                bg="#258d19"
              >
                Iniciar sesión
              </Button>
            )
          )}
        </Flex>
      </Container>

      {/* Modal de confirmación */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent
          borderRadius="2xl"
          overflow="hidden"
          boxShadow="0 8px 30px rgba(0,0,0,0.2)"
        >
          <ModalHeader
            bg="#007000"
            color="white"
            fontWeight="bold"
            textAlign="center"
          >
            Confirmar cierre de sesión
          </ModalHeader>
          <ModalBody
            textAlign="center"
            fontSize="md"
            color="gray.900"
            py={6}
            fontWeight="bold"
          >
            ¿Estás seguro de que quieres cerrar sesión?
          </ModalBody>
          <ModalFooter justifyContent="center" gap={3} py={4}>
            <Button onClick={onClose} variant="outline" borderRadius="lg">
              Cancelar
            </Button>
            <Button
              colorScheme="red"
              onClick={handleLogout}
              isLoading={logoutPending}
              borderRadius="lg"
              px={6}
              bg="#258d19"
              color="white"
            >
              Cerrar sesión
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
