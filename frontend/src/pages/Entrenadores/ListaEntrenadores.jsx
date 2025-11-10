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
    try {
      const { data } = await axios.get(`${API}/entrenadores`);
      setEntrenadores(Array.isArray(data) ? data : []);
    } catch {
      toast.current?.({ title: "Error al cargar entrenadores", status: "error" });
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
    <Container maxW="7xl" py={8}>
      <Flex gap={4} align="center" mb={6} wrap="wrap">
        <Button leftIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} bg="#258d19" color="white">Volver</Button>
        <Heading size="lg" color="white">Lista de Entrenadores</Heading>
        <Spacer />
        <InputGroup w={{ base: "100%", sm: "360px" }}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} bg="white" borderRadius="full" boxShadow="sm"/>
        </InputGroup>
      </Flex>

      {filtered.length === 0 ? (
        <Text fontSize="lg" color="gray.300" fontWeight="bold" textAlign="center">No se encontraron entrenadores.</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={5}>
          {filtered.map((e) => (
            <Card key={e.idEntrenador} borderRadius="2xl" boxShadow="lg" bgGradient="linear(to-b, teal.50, white)" _hover={{ transform: "scale(1.02)", transition: "0.2s" }}>
              <CardHeader pb={2}>
                <Flex align="center" gap={3}>
                  <Box>
                    <Heading size="md">{e.usuario?.nombre} {e.usuario?.apellido}</Heading>
                    <HStack spacing={2} mt={2}><Badge colorScheme="purple">{e.estado?.nombre || "Activo"}</Badge></HStack>
                  </Box>
                  <Spacer />
                </Flex>
              </CardHeader>
              <CardBody pt={1}>
                <Stack spacing={2} fontSize="sm" color="gray.700">
                  <Text><strong>Teléfono:</strong> {e.telefono || "—"}</Text>
                  <Text><strong>Correo Electrónico:</strong> {e.usuario?.correo || e.usuario?.email || "—"}</Text>
                  <Text><strong>Experiencia:</strong> {e.experiencia || "Sin especificar"}</Text>
                </Stack>
              </CardBody>
              <CardFooter pt={0}>
                <HStack spacing={3} w="full" justify="flex-end">
                  <Button size="sm" bg="#258d19" color="white" leftIcon={<EditIcon />} _hover={{ bg: "green.500" }} onClick={() => navigate(`/entrenadores/editar/${e.idEntrenador}`)}>Editar</Button>
                  <Button size="sm" bg="red.600" color="white" _hover={{ bg: "red.700" }} leftIcon={<DeleteIcon />} onClick={() => openDeleteDialog(e)}>Eliminar</Button>
                </HStack>
              </CardFooter>
            </Card>
          ))}
        </SimpleGrid>
      )}

      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={() => setIsOpen(false)}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">Eliminar Entrenador</AlertDialogHeader>
            <AlertDialogBody>
              <Text mb={2}>Ingrese motivo de eliminación de <strong>{entrenadorToDelete?.usuario?.nombre} {entrenadorToDelete?.usuario?.apellido}</strong>:</Text>
              <Textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ej: se retiró del gimnasio" />
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsOpen(false)} bg="#258d19" color="white">Cancelar</Button>
              <Button bg="red.600" color="white" _hover={{ bg: "red.700" }} onClick={confirmDelete} ml={3}>Eliminar</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
}