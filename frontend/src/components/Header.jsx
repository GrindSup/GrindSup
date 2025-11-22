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
  // Spacer, // YA NO NECESITAMOS SPACER
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Avatar,
  Badge,
  VStack,
} from "@chakra-ui/react";

import { HamburgerIcon, BellIcon } from "@chakra-ui/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { clearSessionCache, ensureEntrenadorId } from "../context/auth";
import { useState, useEffect } from "react";

export default function Header({ usuario, setUsuario }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!usuario;
  const isLoginPage = location.pathname === "/login";

  const { isOpen, onOpen, onClose } = useDisclosure();
  const notifModal = useDisclosure();

  const [logoutPending, setLogoutPending] = useState(false);
  const [entrenadorId, setEntrenadorId] = useState(null);
  const [notificaciones, setNotificaciones] = useState([]);

  const go = (path) => navigate(path);

  // Obtener id_entrenador
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

  // Traer notificaciones del entrenador
  useEffect(() => {
    if (!entrenadorId) return;
    const fetchNotif = async () => {
      try {
        const res = await fetch(
          `http://localhost:8080/api/notificaciones/entrenador/${entrenadorId}`
        );
        if (res.ok) {
          setNotificaciones(await res.json());
        }
      } catch (e) {
        console.error("Error obteniendo notificaciones", e);
      }
    };
    fetchNotif();
    const interval = setInterval(fetchNotif, 30000);
    return () => clearInterval(interval);
  }, [entrenadorId]);

  // Logout
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

  const hideMenu =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <Box as="header" bg="white" borderBottom="1px" borderColor="gray.200">
      <Container maxW="container.xl" py={3}>
        {/* Contenedor Principal Flex */}
        <Flex align="center">
          
          {/* 1. SECCIÓN IZQUIERDA (Logo) - flex={1} */}
          <Flex 
            flex="1" 
            align="center" 
            gap={2} 
            cursor="pointer" 
            onClick={() => go("/")}
          >
            <Image src="/vite.png" alt="GrindSup" boxSize="30px" />
            <Text fontWeight="bold" fontSize="xl" color="green.800">
              GrindSup
            </Text>
          </Flex>

          {/* 2. SECCIÓN CENTRAL (Menú) - Ancho automático */}
          {/* Al no tener flex-grow, se quedará en el centro exacto gracias a los flex=1 de los lados */}
          <Flex justify="center">
            {!hideMenu && isLoggedIn && (
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
            )}
          </Flex>

          {/* 3. SECCIÓN DERECHA (Usuario/Logout) - flex={1} y justify="flex-end" */}
          <Flex flex="1" justify="flex-end" align="center" gap={3}>
            {isLoggedIn ? (
              <>
                {/* Campana */}
                {!hideMenu && entrenadorId && (
                  <Box position="relative">
                    <IconButton
                      icon={<BellIcon boxSize={6} color="#258d19" />}
                      variant="ghost"
                      onClick={notifModal.onOpen}
                    />
                    {notificaciones.length > 0 && (
                      <Badge
                        colorScheme="red"
                        position="absolute"
                        top="-2px"
                        right="-2px"
                        borderRadius="full"
                        px={2}
                      >
                        {notificaciones.length}
                      </Badge>
                    )}
                  </Box>
                )}

                {/* Avatar */}
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
              </>
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

        </Flex>
      </Container>

      {/* Modales (sin cambios) */}
      <Modal isOpen={notifModal.isOpen} onClose={notifModal.onClose} size="md">
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader>Notificaciones</ModalHeader>
          <ModalBody>
            {notificaciones.length === 0 ? (
              <Text>No tienes notificaciones nuevas.</Text>
            ) : (
              <VStack align="stretch" spacing={3}>
                {notificaciones.map((n) => (
                  <Box
                    key={n.idNotificacion}
                    p={3}
                    borderRadius="lg"
                    bg="gray.100"
                  >
                    <Text fontWeight="bold">{n.titulo}</Text>
                    <Text fontSize="sm">{n.mensaje}</Text>
                  </Box>
                ))}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              onClick={notifModal.onClose}
              bg="#258d19"
              color="white"
            >
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

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
          <ModalBody textAlign="center" fontSize="md" py={6} fontWeight="bold">
            ¿Estás seguro de que quieres cerrar sesión?
          </ModalBody>
          <ModalFooter justifyContent="center" gap={3} py={4}>
            <Button onClick={onClose} variant="outline" borderRadius="lg">
              Cancelar
            </Button>
            <Button
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