import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box, Button, Container, Heading, Flex, Alert, AlertIcon, Spinner, Text,
  SimpleGrid, Card, CardHeader, CardBody, CardFooter, HStack, Tag, Spacer,
  InputGroup, InputLeftElement, Input, Center, Link, useDisclosure, useToast,
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  RadioGroup, Radio, Stack, IconButton, Menu, MenuButton, MenuList, MenuOptionGroup, MenuItemOption
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, SearchIcon, ChevronDownIcon } from '@chakra-ui/icons';
import axiosInstance from '../../config/axios.config';
import BotonVolver from '../../components/BotonVolver.jsx';
import rutinasService from '../../services/rutinas.servicio.js';

const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

const allMuscleGroups = ["Abductores", "Aductores", "Biceps", "Cuadriceps", "Dorsales", "Femorales", "Gemelos", "Gluteos", "Hombros", "Pectorales", "Triceps"];

export default function ListaEjercicios() {
  const [ejercicios, setEjercicios] = useState([]);
  const [rutinas, setRutinas] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedMuscles, setSelectedMuscles] = useState([]);

  const navigate = useNavigate();
  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();

  const [ejercicioAEliminar, setEjercicioAEliminar] = useState(null);
  const [ejercicioParaAgregar, setEjercicioParaAgregar] = useState(null);
  const [rutinaSeleccionada, setRutinaSeleccionada] = useState(null);

  useEffect(() => {
    fetchEjercicios();
    fetchRutinas();
  }, []);

  const fetchEjercicios = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/ejercicios');
      setEjercicios(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los ejercicios: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchRutinas = async () => {
    try {
      // ⚠️ Si usás planes, reemplazá el 1 por el id del plan actual
      const rutinasData = await rutinasService.listByPlan(1);
      setRutinas(rutinasData);
    } catch (err) {
      console.error("Error al cargar rutinas:", err);
      setRutinas([]);
    }
  };

  const abrirDialogoEliminar = (ejercicio) => {
    setEjercicioAEliminar(ejercicio);
    onOpen();
  };

  const handleEliminar = async () => {
    if (!ejercicioAEliminar) return;

    try {
      await axiosInstance.delete(`/api/ejercicios/${ejercicioAEliminar.id_ejercicio}`);
      toast({
        title: "Ejercicio eliminado",
        description: `El ejercicio "${ejercicioAEliminar.nombre}" ha sido eliminado.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
      fetchEjercicios();
    } catch (err) {
      toast({
        title: "Error al eliminar",
        description: err.response?.data?.message || err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const abrirModalAgregar = (ejercicio) => {
    setEjercicioParaAgregar(ejercicio);
    setRutinaSeleccionada(null);
    onAddOpen();
  };

  const handleAgregarARutina = async () => {
    if (!rutinaSeleccionada || !ejercicioParaAgregar) return;

    try {
      const rutina = rutinas.find(r => r.id.toString() === rutinaSeleccionada);
      if (!rutina) throw new Error("Rutina no encontrada.");

      // Obtenemos los detalles actuales de la rutina
      const detalle = await rutinasService.obtenerDetalleRutina(rutina.planId, rutina.id);
      const ejerciciosExistentes = detalle?.ejercicios ?? [];

      // Evitar duplicados
      const yaExiste = ejerciciosExistentes.some(
        (e) => e.id_ejercicio === ejercicioParaAgregar.id_ejercicio
      );
      if (yaExiste) {
        toast({
          title: "Ejercicio ya existente",
          description: `"${ejercicioParaAgregar.nombre}" ya está en la rutina "${rutina.nombre}".`,
          status: "warning",
          duration: 4000,
          isClosable: true,
        });
        onAddClose();
        return;
      }

      const nuevosEjercicios = [
        ...ejerciciosExistentes,
        {
          idEjercicio: ejercicioParaAgregar.id_ejercicio,
          series: 3,
          repeticiones: 10,
          descansoSegundos: 60,
        },
      ];

      await rutinasService.update(rutina.planId, rutina.id, {
        ...detalle,
        ejercicios: nuevosEjercicios,
      });

      toast({
        title: "Ejercicio agregado",
        description: `"${ejercicioParaAgregar.nombre}" se agregó a la rutina "${rutina.nombre}".`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });

      onAddClose();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error al agregar ejercicio",
        description: err.response?.data?.message || err.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const filteredEjercicios = useMemo(() => {
    let ejerciciosFiltrados = ejercicios;
    if (search) {
      ejerciciosFiltrados = ejerciciosFiltrados.filter(ej =>
        ej.nombre.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (selectedMuscles.length > 0) {
      ejerciciosFiltrados = ejerciciosFiltrados.filter(ej => {
        const musculosDelEjercicio = [
          ...(ej.grupoMuscularPrincipal || []),
          ...(ej.grupoMuscularSecundario || [])
        ];
        return selectedMuscles.some(selected => musculosDelEjercicio.includes(selected));
      });
    }

    return ejerciciosFiltrados;
  }, [ejercicios, search, selectedMuscles]);

  return (
    <Container maxW="7xl" py={10}>
      <Flex justifyContent="space-between" alignItems="center" mb={6} wrap="wrap" gap={4}>
        <HStack spacing={4} alignItems="center">
          <BotonVolver />
          <Heading as="h1" size="xl" color="white">
            Lista de Ejercicios
          </Heading>
        </HStack>
        <Spacer />
        <HStack spacing={4}>
          <Menu closeOnSelect={false}>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              minW="200px"
              bg="#258d19"
              color="white"
              _hover={{ bg: "#0b3a0c" }}
              _active={{ bg: "#082b09" }}
            >
              {selectedMuscles.length > 0 ? `Músculos (${selectedMuscles.length})` : "Filtrar por Músculo"}
            </MenuButton>
            <MenuList minWidth="240px">
              <MenuOptionGroup
                title="Grupos Musculares"
                type="checkbox"
                value={selectedMuscles}
                onChange={setSelectedMuscles}
              >
                {allMuscleGroups.map(muscle => (
                  <MenuItemOption key={muscle} value={muscle}>
                    {muscle}
                  </MenuItemOption>
                ))}
              </MenuOptionGroup>
            </MenuList>
          </Menu>
          <InputGroup w={{ base: "100%", md: "300px" }}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.500" />
            </InputLeftElement>
            <Input
              placeholder="Buscar por nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              borderRadius="full"
              bg="white"
            />
          </InputGroup>
          <Button
            leftIcon={<AddIcon />}
            onClick={() => navigate('/ejercicio/registrar')}
            bg="#258d19"
            color="white"
          >
            Nuevo Ejercicio
          </Button>
        </HStack>
      </Flex>

      {loading && <Center py={10}><Spinner size="xl" /></Center>}
      {error && <Alert status="error"><AlertIcon />{error}</Alert>}

      {!loading && !error && (
        <>
          {filteredEjercicios.length === 0 ? (
            <Center py={10}>
              <Text fontSize="lg" color="gray.500">
                {search ? 'No se encontraron ejercicios con ese nombre.' : 'Aún no hay ejercicios registrados.'}
              </Text>
            </Center>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {filteredEjercicios.map((ej) => (
                <Card key={ej.id_ejercicio} direction="column" h="100%" display="flex">
                  <Link as={RouterLink} to={`/ejercicio/detalle/${ej.id_ejercicio}`} flex="1" _hover={{ textDecoration: 'none' }}>
                    <CardHeader>
                      <Heading size='md'>{ej.nombre}</Heading>
                    </CardHeader>
                    <CardBody>
                      <HStack spacing={2} wrap="wrap">
                        <Tag colorScheme='teal'>{capitalize(ej.dificultad)}</Tag>
                        {ej.grupoMuscularPrincipal?.map(musculo => (
                          <Tag key={musculo} colorScheme='purple'>{musculo}</Tag>
                        ))}
                      </HStack>
                      <Text mt={4} noOfLines={3}>{ej.descripcion || "Sin descripción."}</Text>
                    </CardBody>
                  </Link>
                  <Spacer />
                  <CardFooter>
                    <Flex justify="space-between" align="center" w="100%">
                      <IconButton
                        aria-label="Agregar a rutina"
                        icon={<AddIcon />}
                        bg="#258d19"
                        color="white"
                        isRound
                        onClick={() => abrirModalAgregar(ej)}
                      />
                      <HStack>
                        <Button variant='solid' size="sm" onClick={() => navigate(`/ejercicio/editar/${ej.id_ejercicio}`)} bg="#258d19" color="white">
                          Editar
                        </Button>
                        <Button size="sm" bg="red.600" color="white" _hover={{ bg: "red.600" }} onClick={() => abrirDialogoEliminar(ej)}>
                          Eliminar
                        </Button>
                      </HStack>
                    </Flex>
                  </CardFooter>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </>
      )}

      {/* Modal eliminar */}
      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Eliminar Ejercicio
            </AlertDialogHeader>
            <AlertDialogBody>
              ¿Estás seguro de que querés eliminar el ejercicio <strong>"{ejercicioAEliminar?.nombre}"</strong>? Esta acción no se puede deshacer.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose} bg="#258d19" color="white">
                Cancelar
              </Button>
              <Button
                bg="red.600"
                color="white"
                _hover={{ bg: "red.600" }}
                onClick={handleEliminar}
                ml={3}
              >
                Eliminar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Modal agregar a rutina */}
      <Modal isOpen={isAddOpen} onClose={onAddClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Agregar "{ejercicioParaAgregar?.nombre}" a Rutina</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>Seleccioná la rutina a la que querés agregar este ejercicio:</Text>
            <RadioGroup onChange={setRutinaSeleccionada} value={rutinaSeleccionada}>
              <Stack>
                {rutinas.length > 0 ? (
                  rutinas.map((r) => (
                    <Radio key={r.id} value={r.id.toString()}>
                      {r.nombre}
                    </Radio>
                  ))
                ) : (
                  <Text color="gray.500">No hay rutinas disponibles.</Text>
                )}
              </Stack>
            </RadioGroup>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAddClose}>
              Cancelar
            </Button>
            <Button
              bg="#258d19"
              color="white"
              onClick={handleAgregarARutina}
              isDisabled={!rutinaSeleccionada}
            >
              Agregar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}