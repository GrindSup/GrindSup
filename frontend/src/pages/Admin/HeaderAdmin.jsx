// frontend/src/pages/Admin/HeaderAdmin.jsx (Limpiado)
import {
  Box,
  Container,
  Flex,
  Text,
  Button,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Avatar,
} from "@chakra-ui/react";

import { useNavigate, useLocation } from "react-router-dom";
import { clearSessionCache, ensureEntrenadorId } from "../../context/auth";
import { useState, useEffect } from "react"; 

export default function HeaderAdmin({ usuario, setUsuario }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!usuario;
  const isLoginPage = location.pathname === "/login";
  const { isOpen, onOpen, onClose } = useDisclosure(); 

  const [logoutPending, setLogoutPending] = useState(false);
  const [entrenadorId, setEntrenadorId] = useState(null);
  
  const go = (path) => navigate(path);

  useEffect(() => {
    
    const resolveId = async () => {
      const id = await ensureEntrenadorId(); 
      const validId = id && !isNaN(Number(id)) ? Number(id) : null;
      setEntrenadorId(validId);
    };

    resolveId();
  }, [usuario]);


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

          {/* 3. SECCIÓN DERECHA (Usuario/Logout) - flex={1} y justify="flex-end" */}
          <Flex flex="1" justify="flex-end" align="center" gap={3}>
            {isLoggedIn ? (
              <>

                {/* Avatar */}
                {!hideMenu && (
                    <Avatar
                      size="sm"
                      name={`${usuario?.nombre ?? ""} ${
                        usuario?.apellido ?? ""
                      }`}
                      src={usuario?.foto_perfil ?? ""}
                      bg="green.500"
                      color="white"
                    />
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