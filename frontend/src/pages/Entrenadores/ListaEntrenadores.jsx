// src/pages/Entrenadores/ListaEntrenadores.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../config/axios.config";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Spinner,
  Text,
  Card,
  CardBody,
  Badge,
  Stack,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import {
  SearchIcon,
  EditIcon,
  DeleteIcon,
  ArrowBackIcon,
} from "@chakra-ui/icons";

const API = import.meta?.env?.VITE_API_BASE_URL || "http://localhost:8080/api";

export default function ListaEntrenadores() {
  const [entrenadores, setEntrenadores] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [isOpen, setIsOpen] = useState(false);
  const [entrenadorToDelete, setEntrenadorToDelete] = useState(null);
  const [motivo, setMotivo] = useState("");

  const toast = useToast();
  const navigate = useNavigate();
  const cancelRef = useRef();

  // Traer TODOS los entrenadores (para admin)
  const fetchEntrenadores = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/entrenadores`);
      setEntrenadores(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error al cargar entrenadores",
        description: "No se pudo obtener el listado de entrenadores.",
        status: "error",
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntrenadores();
  }, []);

  const filtered = entrenadores.filter((e) => {
    const q = search.toLowerCase();
    const nombre = e.usuario?.nombre?.toLowerCase() || "";
    const apellido = e.usuario?.apellido?.toLowerCase() || "";
    const correo =
      e.usuario?.correo?.toLowerCase() ||
      e.usuario?.email?.toLowerCase() ||
      "";
    return (
      nombre.includes(q) ||
      apellido.includes(q) ||
      correo.includes(q)
    );
  });

  const openDeleteDialog = (entrenador) => {
    setEntrenadorToDelete(entrenador);
    setMotivo("");
    setIsOpen(true);
  };

  const confirmDelete = async () => {
    if (!entrenadorToDelete) return;
    try {
      // Por ahora el backend no usa "motivo", solo hacemos el DELETE simple.
      await axios.delete(`${API}/entrenadores/${entrenadorToDelete.idEntrenador}`);
      toast({
        title: "Entrenador eliminado",
        description: "Se realizó la eliminación lógica correctamente.",
        status: "success",
        position: "top",
      });
      setIsOpen(false);
      fetchEntrenadores();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error al eliminar",
        description: "No se pudo eliminar el entrenador.",
        status: "error",
        position: "top",
      });
    }
  };

  if (loading) {
    return (
      <Container maxW="5xl" py={10}>
        <Flex justify="center" align="center" minH="50vh" gap={3}>
          <Spinner size="xl" color="#258d19" />
          <Text color="white">Cargando entrenadores...</Text>
        </Flex>
      </Container>
    );
  }

  return (
    <Container maxW="5xl" py={10}>
      {/* Fila superior: volver + buscador */}
      <Flex align="center" mb={6} gap={4} wrap="wrap">
        <Button
          leftIcon={<ArrowBackIcon />}
          onClick={() => navigate("/dashboard")}
          bg="#258d19"
          color="white"
          _hover={{ bg: "green.600" }}
        >
          Volver
        </Button>

        <Heading size="lg" color="white" flex="1">
          Administrar entrenadores
        </Heading>

        <Box w={{ base: "100%", md: "260px" }}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              bg="white"
              placeholder="Buscar por nombre, apellido o correo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </Box>
      </Flex>

      {filtered.length === 0 ? (
        <Text
          fontSize="lg"
          color="gray.200"
          fontWeight="bold"
          textAlign="center"
          mt={8}
        >
          No se encontraron entrenadores que coincidan con la búsqueda.
        </Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {filtered.map((e) => (
            <Card
              key={e.idEntrenador}
              borderRadius="2xl"
              boxShadow="xl"
              bg="white"
              p={6}
              _hover={{ transform: "scale(1.01)", transition: "0.2s" }}
            >
              <Stack spacing={4}>
                {/* Encabezado: nombre + estado */}
                <Flex justify="space-between" align="center">
                  <Heading size="md" color="gray.900">
                    {e.usuario?.nombre} {e.usuario?.apellido}
                  </Heading>
                  <Badge
                    colorScheme={
                      e.estado?.nombre === "ACTIVO" ? "green" : "purple"
                    }
                    fontSize="sm"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    {e.estado?.nombre || "Sin estado"}
                  </Badge>
                </Flex>

                {/* Datos contacto */}
                <Box bg="gray.50" p={4} borderRadius="lg" shadow="inner">
                  <Stack spacing={2} fontSize="sm" color="gray.900">
                    <Text>
                      <strong>Correo Electrónico:</strong> {e.usuario?.correo || "—"}
                    </Text>
                    <Text>
                      <strong>Teléfono:</strong> {e.telefono || "—"}
                    </Text>
                    <Text>
                      <strong>Experiencia:</strong>{" "}
                      {e.experiencia || "Sin especificar"}
                    </Text>
                  </Stack>
                </Box>

                {/* Botones */}
                <Flex gap={4} mt={2} justify="flex-end">
                  <Button
                    bg="#258d19"
                    color="white"
                    leftIcon={<EditIcon />}
                    _hover={{ bg: "green.500" }}
                    onClick={() =>
                      navigate(`/entrenadores/editar/${e.idEntrenador}`)
                    }
                  >
                    Editar
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
            </Card>
          ))}
        </SimpleGrid>
      )}

      {/* Modal de eliminación */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Eliminar Entrenador
            </AlertDialogHeader>
            <AlertDialogBody>
              <Text mb={2}>
                Motivo de eliminación de{" "}
                <strong>
                  {entrenadorToDelete?.usuario?.nombre}{" "}
                  {entrenadorToDelete?.usuario?.apellido}
                </strong>
                :
              </Text>
              <Textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ej: ya no trabaja en el gimnasio"
              />
              <Text mt={2} fontSize="xs" color="gray.500">
                * Por ahora el motivo no se guarda en backend, pero podés
                dejarlo listo para una futura auditoría.
              </Text>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={() => setIsOpen(false)}
                bg="gray.200"
              >
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
