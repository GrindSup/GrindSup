//src\pages\Entrenadores\ListaEntrenadores.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../config/axios.config";
import {
  Box, Button, Container, Flex, Heading, Input, InputGroup, InputLeftElement,
  SimpleGrid, Spacer, Spinner, Text, HStack, Card, CardHeader, CardBody, CardFooter,
  Badge, Stack, AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader,
  AlertDialogBody, Textarea, AlertDialogFooter
} from "@chakra-ui/react";
import { SearchIcon, EditIcon, DeleteIcon, ArrowBackIcon } from "@chakra-ui/icons";

const API = import.meta?.env?.VITE_API_BASE_URL || "http://localhost:8080/api";

export default function ListaEntrenadores() {
  const [entrenadores, setEntrenadores] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [entrenadorToDelete, setEntrenadorToDelete] = useState(null);
  const [motivo, setMotivo] = useState("");
  const toast = useRef();
  const navigate = useNavigate();
  const cancelRef = useRef();

  const fetchEntrenadores = async () => {
  const idEntrenador = localStorage.getItem("entrenadorId"); //  <-- CORRECTO

  if (!idEntrenador) {
    setLoading(false);
    return;
  }

  try {
    const { data } = await axios.get(`${API}/entrenadores/${idEntrenador}`);
    setEntrenadores([data]); // lo mantengo igual, porque es un perfil único
  } catch (error) {
    toast.current?.({ title: "Error al cargar entrenador", status: "error" });
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchEntrenadores();
  }, []);

  const filtered = entrenadores.filter((e) => {
    const q = search.toLowerCase();
    return (
      e.usuario?.nombre?.toLowerCase().includes(q) ||
      e.usuario?.apellido?.toLowerCase().includes(q)
    );
  });

  const openDeleteDialog = (entrenador) => {
    setEntrenadorToDelete(entrenador);
    setMotivo("");
    setIsOpen(true);
  };

  const confirmDelete = async () => {
    if (!motivo.trim()) return;
    try {
      await axios.delete(`${API}/entrenadores/${entrenadorToDelete.idEntrenador}`, {
        data: { motivo },
      });
      fetchEntrenadores();
    } catch {}
    finally { setIsOpen(false); }
  };

  if (loading) return <Spinner size="xl" color="teal.400" />;

  return (
    <Container maxW="5xl" py={10}>
      
      {/* FILA SUPERIOR: solo el botón */}
<Flex align="center" mb={4}>
  <Button
    leftIcon={<ArrowBackIcon />}
    onClick={() => navigate(-1)}
    bg="#258d19"
    color="white"
  >
    Volver
  </Button>
</Flex>

{/* CONTENIDO CENTRADO: título + card */}
<Flex direction="column" align="center">
  <Heading size="lg" color="white" mb={6}>
    Perfil del Entrenador
  </Heading>

  {/* Aquí ponés tu card o el contenido que quieras centrar */}
  <Box w="100%" maxW="500px">
    {/** tu card aquí **/}
  </Box>
</Flex>
      {filtered.length === 0 ? (
        <Text
          fontSize="lg"
          color="gray.300"
          fontWeight="bold"
          textAlign="center"
        >
          No se encontró el entrenador.
        </Text>
      ) : (
        filtered.map((e) => (
          <Card
            key={e.idEntrenador}
            borderRadius="2xl"
            boxShadow="xl"
            bg="white"
            p={6}
            _hover={{ transform: "scale(1.01)", transition: "0.3s" }}
          >
            <Flex gap={8} align="flex-start" direction={{ base: "column", md: "row" }}>
              
              {/* FOTO */}
              <Box textAlign="center">
                <Box
                  as="img"
                  src={e.usuario?.foto_perfil || e.foto_perfil}
                  alt="Foto perfil"
                  w="150px"
                  h="150px"
                  objectFit="cover"
                  borderRadius="full"
                  boxShadow="md"
                  mb={3}
                />
                <Badge colorScheme="purple" fontSize="sm" px={3} py={1} borderRadius="full">
                  {e.estado?.nombre}
                </Badge>
              </Box>

              {/* INFO */}
              <Stack spacing={4} flex="1">
                <Heading size="md" color="gray.900">
                  {e.usuario?.nombre} {e.usuario?.apellido}
                </Heading>

                <Box bg="gray.50" p={4} borderRadius="lg" shadow="inner">
                  <Stack spacing={2} fontSize="sm" color="gray.900">
                    <Text><strong>Correo:</strong> {e.usuario?.correo}</Text>
                    <Text><strong>Teléfono:</strong> {e.telefono || "—"}</Text>
                    <Text><strong>Experiencia:</strong> {e.experiencia || "Sin especificar"}</Text>
                  </Stack>
                </Box>

                {/* BOTONES */}
                <Flex gap={4} mt={4}>
                  <Button
                    bg="#258d19"
                    color="white"
                    leftIcon={<EditIcon />}
                    _hover={{ bg: "green.500" }}
                    onClick={() => navigate(`/entrenadores/editar/${e.idEntrenador}`)}
                  >
                    Editar Perfil
                  </Button>

                  <Button
                    bg="red.600"
                    color="white"
                    leftIcon={<DeleteIcon />}
                    _hover={{ bg: "red.700" }}
                    onClick={() => openDeleteDialog(e)}
                  >
                    Eliminar
                  </Button>
                </Flex>
              </Stack>

            </Flex>
          </Card>
        ))
      )}

      {/* Modal de eliminación */}
      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={() => setIsOpen(false)}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Eliminar Entrenador
            </AlertDialogHeader>
            <AlertDialogBody>
              <Text mb={2}>
                Ingrese motivo de eliminación de <strong>{entrenadorToDelete?.usuario?.nombre} {entrenadorToDelete?.usuario?.apellido}</strong>:
              </Text>
              <Textarea 
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ej: ya no trabaja en el gimnasio"
              />
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsOpen(false)} bg="#258d19" color="white">
                Cancelar
              </Button>
              <Button
                bg="red.600"
                color="white"
                _hover={{ bg: "red.700" }}
                onClick={confirmDelete}
                ml={3}
              >
                Eliminar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
}