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
import { useState, useEffect, useCallback } from "react";
import api from "../config/axios.config";

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

  // Función para obtener las notificaciones (usamos useCallback para el intervalo)
  const fetchNotificaciones = useCallback(async (id) => {
    // Es buena práctica asegurarse de que el ID es un número antes de la llamada
    const numericId = Number(id); 
    if (!numericId || isNaN(numericId)) {
        console.warn("ID de entrenador no válido para notificaciones.");
        return;
    }
    
    try {
      const res = await api.get(`/api/notificaciones/entrenador/${numericId}`);
      setNotificaciones(res.data || []);
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
    }
  }, []); 

  // Obtener id_entrenador y configurar el Polling
  useEffect(() => {
    let intervalId = null;

    const resolveIdAndStartPolling = async () => {
      // 🛑 CORRECCIÓN CLAVE: Usar AWAIT para resolver la Promise del ID
      const id = await ensureEntrenadorId(); 
      
      const validId = id && !isNaN(Number(id)) ? Number(id) : null;
      setEntrenadorId(validId); // Actualizar el state con el ID resuelto

      if (validId) {
        // 1. Cargar notificaciones inmediatamente
        fetchNotificaciones(validId);

        // 2. Configurar el Polling (ejecutar cada 15 segundos)
        intervalId = setInterval(() => {
          console.log("Polling notificaciones...");
          fetchNotificaciones(validId); 
        }, 15000); 
      }
    };

    resolveIdAndStartPolling(); // Llamar a la función async inmediatamente

    // 3. Limpiar el intervalo cuando el componente se desmonte o el ID cambie
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [usuario, fetchNotificaciones]);

  // Traer notificaciones del entrenador
  useEffect(() => {
    if (!entrenadorId) return;
    const fetchNotif = async () => {
      try {
        const res = await api.get(
          `api/notificaciones/entrenador/${entrenadorId}`
        );
        setNotificaciones(res.data);
      } catch (e) {
        console.error("Error obteniendo notificaciones", e);
      }
    };
    fetchNotif();
    const interval = setInterval(fetchNotif, 30000);
    return () => clearInterval(interval);
  }, [entrenadorId]);

  // 🆕 Función para marcar las notificaciones como leídas
  const markNotificationsAsRead = async () => {
    if (!entrenadorId || notificaciones.length === 0) return;

    try {
      // 1. Llamar al nuevo endpoint PUT para marcar en la DB
      await api.put(`/api/notificaciones/entrenador/${entrenadorId}/leidas`);

      // 2. Opcional pero recomendado: Limpiar el estado local (para que la insignia desaparezca de inmediato)
      setNotificaciones([]);
    } catch (e) {
      console.error("Error al marcar notificaciones como leídas", e);
    }
  };

  // 🆕 Función para manejar el cierre del modal
  const handleNotifModalClose = () => {
    notifModal.onClose(); // Cierra el modal
    markNotificationsAsRead(); // Ejecuta la acción de marcado
  };

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

  const notificacionesNoLeidas = notificaciones.length;
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
                  {items.map((i, index) => {
                      const finalKey = i.path === '/' ? i.label : i.path; 
                      return (
                          <MenuItem key={finalKey} onClick={() => go(i.path)}>
                              {i.label}
                          </MenuItem>
                      );
                  })}
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
                      aria-label="Notificaiones"
                      position="relative"
                    />
                    {notificacionesNoLeidas > 0 && (
                      <Badge
                        colorScheme="red"
                        position="absolute"
                        top="-2px"
                        right="-2px"
                        borderRadius="full"
                        fontSize="xs"
                        px={2}
                      >
                        {notificacionesNoLeidas}
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
          <ModalBody
            maxH="400px"
            overflowY="auto"
            display="flex"
            flexDirection="column"
            gap={2}
          >
            {notificaciones.length === 0 ? (
              <Text textAlign="center" color="gray.500" py={4}>
                No tienes notificaciones pendientes.
              </Text>
            ) : (
              // ❌ Corrección de la advertencia "key"
              notificaciones.map((notif, index) => (
                <Box
                  key={notif.id} // ✅ Usar el ID de la notificación como key
                  p={3}
                  bg="gray.50"
                  borderRadius="lg"
                  boxShadow="sm"
                  borderLeft="4px solid #007000"
                >
                  <Text fontWeight="bold">{notif.titulo}</Text>
                  <Text fontSize="sm" color="gray.600">
                    {notif.mensaje}
                  </Text>
                  <Text fontSize="xs" color="gray.400" mt={1}>
                    {new Date(notif.createdAt).toLocaleTimeString('es-AR', {
                      hour: 'numeric',
                      minute:'2-digit'
                    })}
                  </Text>
                </Box>
              ))
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              onClick={handleNotifModalClose}
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