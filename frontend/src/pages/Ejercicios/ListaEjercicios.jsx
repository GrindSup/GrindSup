import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box, Button, Container, Heading, Flex, Alert, AlertIcon, Spinner, Text,
  SimpleGrid, Card, CardHeader, CardBody, CardFooter, HStack, Tag, Spacer,
  InputGroup, InputLeftElement, Input, Center, Link, useDisclosure, useToast,
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  RadioGroup, Radio, Stack, IconButton, Menu, MenuButton, MenuList, MenuOptionGroup, MenuItemOption,
  FormControl, FormLabel, Textarea
} from '@chakra-ui/react';

import { AddIcon, EditIcon, DeleteIcon, SearchIcon, ChevronDownIcon, ArrowBackIcon } from '@chakra-ui/icons';
import axiosInstance from '../../config/axios.config';
import BotonVolver from '../../components/BotonVolver.jsx';
import rutinasService from '../../services/rutinas.servicio.js';
import { planesService } from '../../services/planes.servicio.js';
import { ensureEntrenadorId } from '../../context/auth.js';

// ==== Utils ====
const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

const allMuscleGroups = ["Abductores", "Aductores", "Biceps", "Cuadriceps", "Dorsales",
  "Femorales", "Gemelos", "Gluteos", "Hombros", "Pectorales", "Triceps", "Espalda"
];

export default function ListaEjercicios() {

  const [ejercicios, setEjercicios] = useState([]);
  const [rutinas, setRutinas] = useState([]);
  const [entrenadorId, setEntrenadorId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedMuscles, setSelectedMuscles] = useState([]);

  const [ejercicioAEliminar, setEjercicioAEliminar] = useState(null);
  const [ejercicioParaAgregar, setEjercicioParaAgregar] = useState(null);
  const [rutinaSeleccionada, setRutinaSeleccionada] = useState(null);

  const [nuevoEjercicioConfig, setNuevoEjercicioConfig] = useState({
    series: 3,
    repeticiones: 10,
    observaciones: "",
    grupoMuscular: ""
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();

  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose
  } = useDisclosure();

  const navigate = useNavigate();
  const toast = useToast();

  // ============================
  //  Load entrenadorId y data
  // ============================
  useEffect(() => {
    fetchEjercicios();
    (async () => {
      const id = await ensureEntrenadorId();
      if (id) setEntrenadorId(id);
    })();
  }, []);

  useEffect(() => {
    if (entrenadorId) {
      fetchRutinas(entrenadorId);
    }
  }, [entrenadorId]);

  // ============================
  //  Fetch ejercicios
  // ============================
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

  // ============================
  //  Fetch rutinas
  // ============================
  const fetchRutinas = async (entId) => {
    try {
      const ps = await planesService.listAll(entId);

      let data = [];
      try {
        const r = await axiosInstance.get("/api/rutinas", { params: { entrenadorId: entId } });
        data = Array.isArray(r.data) ? r.data : [];
      } catch {
        const r = await axiosInstance.get("/api/rutinas", { params: { entrenadorId: entId, all: 1 } });
        data = Array.isArray(r.data) ? r.data : [];
      }

      const enrich = data.map((r) => {
        const planId = r.planId ?? r.plan?.id_plan ?? r.id_plan ?? null;
        const plan = (ps || []).find((p) => String(p.id_plan ?? p.id) === String(planId));
        const alumno = plan?.alumno
          ? `${plan.alumno.nombre} ${plan.alumno.apellido}`
          : null;

        return { ...r, planId: planId, __alumno: alumno };
      });

      setRutinas(enrich);

    } catch (err) {
      console.error("Error al cargar rutinas:", err);
      setRutinas([]);
    }
  };

  // ============================
  //  Delete ejercicio
  // ============================
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
        description: `Se eliminó "${ejercicioAEliminar.nombre}".`,
        status: "success",
        duration: 3000
      });
      onClose();
      fetchEjercicios();
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || err.message,
        status: "error"
      });
    }
  };

  // ============================
  //  Agregar ejercicio a rutina
  // ============================
  const abrirModalAgregar = (ejercicio) => {
    setEjercicioParaAgregar(ejercicio);
    setRutinaSeleccionada(null);

    const defaultGrupo =
      ejercicio?.grupoMuscularPrincipal?.[0] ||
      ejercicio?.grupoMuscularSecundario?.[0] ||
      "";

    setNuevoEjercicioConfig({
      series: 3,
      repeticiones: 10,
      observaciones: "",
      grupoMuscular: defaultGrupo
    });

    onAddOpen();
  };

  const handleAgregarARutina = async () => {
    if (!rutinaSeleccionada || !ejercicioParaAgregar) return;

    const rutina = rutinas.find(r => (r.id_rutina ?? r.id).toString() === rutinaSeleccionada);
    if (!rutina) {
      toast({ title: "Error", description: "Rutina no encontrada", status: "error" });
      return;
    }

    const planId = rutina.planId;
    const rutinaId = rutina.id_rutina ?? rutina.id;

    try {
      const detalle = await rutinasService.obtenerDetalleRutina(planId, rutinaId);
      const infoRutina = detalle.rutina ?? {};
      const ejerciciosExistentes = detalle.ejercicios ?? [];

      const yaExiste = ejerciciosExistentes.some(
        (e) => (e.ejercicio?.id_ejercicio ?? e.id_ejercicio) === ejercicioParaAgregar.id_ejercicio
      );

      if (yaExiste) {
        toast({
          title: "Ya existe",
          description: `"${ejercicioParaAgregar.nombre}" ya está en la rutina.`,
          status: "warning"
        });
        onAddClose();
        return;
      }

      const ejerciciosDtoExistentes = ejerciciosExistentes.map(e => ({
        idEjercicio: e.ejercicio?.id_ejercicio ?? e.id_ejercicio,
        series: e.series,
        repeticiones: e.repeticiones,
        grupoMuscular: e.grupo_muscular ?? null,
        observaciones: e.observaciones ?? null,
      }));

      const nuevoEjercicioDto = {
        idEjercicio: ejercicioParaAgregar.id_ejercicio,
        series: Number(nuevoEjercicioConfig.series),
        repeticiones: Number(nuevoEjercicioConfig.repeticiones),
        grupoMuscular: nuevoEjercicioConfig.grupoMuscular || null,
        observaciones: nuevoEjercicioConfig.observaciones.trim() || null
      };

      const payload = {
        nombre: infoRutina.nombre,
        descripcion: infoRutina.descripcion,
        ejercicios: [...ejerciciosDtoExistentes, nuevoEjercicioDto],
      };

      await rutinasService.update(planId, rutinaId, payload);

      toast({
        title: "Agregado",
        description: `"${ejercicioParaAgregar.nombre}" agregado correctamente.`,
        status: "success"
      });

      onAddClose();

    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || err.message,
        status: "error"
      });
    }
  };

  // ============================
  //  Filtro ejercicios
  // ============================
  const filteredEjercicios = useMemo(() => {
    let list = ejercicios;

    if (search) {
      list = list.filter(e =>
        e.nombre.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (selectedMuscles.length > 0) {
      list = list.filter(e => {
        const groups = [
          ...(e.grupoMuscularPrincipal || []),
          ...(e.grupoMuscularSecundario || [])
        ];
        return selectedMuscles.some(m => groups.includes(m));
      });
    }

    return list;
  }, [ejercicios, search, selectedMuscles]);

  // ============================
  //  UI
  // ============================
  return (
    <Container maxW="7xl" py={10}>
      <Flex justify="space-between" align="center" mb={6}>
        <HStack spacing={4} align="center">
          <Button leftIcon={<ArrowBackIcon />} onClick={() => navigate("/InicioDashboard")} bg="#258d19" color="white">
            Volver
          </Button>
          <Heading size="xl" color="white">Lista de Ejercicios</Heading>
        </HStack>

        <HStack spacing={4}>
          <Menu closeOnSelect={false}>
            <MenuButton as={Button}
              rightIcon={<ChevronDownIcon />}
              minW="200px"
              bg="#258d19"
              color="white"
            >
              {selectedMuscles.length > 0
                ? `Músculos (${selectedMuscles.length})`
                : "Filtrar por Músculo"}
            </MenuButton>

            <MenuList minWidth="240px">
              <MenuOptionGroup type="checkbox"
                value={selectedMuscles}
                onChange={setSelectedMuscles}
              >
                {allMuscleGroups.map(m => (
                  <MenuItemOption key={m} value={m}>{m}</MenuItemOption>
                ))}
              </MenuOptionGroup>
            </MenuList>
          </Menu>

          <InputGroup w={{ base: "100%", md: "300px" }}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.500" />
            </InputLeftElement>
            <Input
              placeholder="Buscar…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              borderRadius="full"
              bg="white"
            />
          </InputGroup>

          <Button
            leftIcon={<AddIcon />}
            bg="#258d19"
            color="white"
            onClick={() => navigate('/registrar')}
          >
            Nuevo Ejercicio
          </Button>
        </HStack>
      </Flex>

      {loading && (
        <Center py={10}>
          <Spinner size="xl" />
        </Center>
      )}

      {error && <Alert status="error"><AlertIcon />{error}</Alert>}

      {!loading && !error && (
        <>
          {filteredEjercicios.length === 0 ? (
            <Center py={10}>
              <Text fontSize="lg" color="gray.500">
                {search ? "No se encontraron resultados." : "No hay ejercicios registrados."}
              </Text>
            </Center>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {filteredEjercicios.map(ej => (
                <Card key={ej.id_ejercicio}>
                  <Link as={RouterLink} to={`/ejercicio/detalle/${ej.id_ejercicio}`} _hover={{ textDecoration: "none" }}>
                    <CardHeader>
                      <Heading size="md">{ej.nombre}</Heading>
                    </CardHeader>
                    <CardBody>
                      <HStack spacing={2} wrap="wrap">
                        <Tag colorScheme="teal">{capitalize(ej.dificultad)}</Tag>
                        {ej.grupoMuscularPrincipal?.map(g => (
                          <Tag key={g} colorScheme="purple">{g}</Tag>
                        ))}
                      </HStack>
                      <Text mt={3} noOfLines={3}>
                        {ej.descripcion || "Sin descripción"}
                      </Text>
                    </CardBody>
                  </Link>

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
                        <Button
                          size="sm"
                          bg="#258d19"
                          color="white"
                          onClick={() => navigate(`/ejercicio/editar/${ej.id_ejercicio}`)}
                        >
                          Editar
                        </Button>

                        <Button
                          size="sm"
                          bg="red.600"
                          color="white"
                          onClick={() => abrirDialogoEliminar(ej)}
                        >
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

      {/* =======================
          Modal eliminar
      ======================= */}
      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Eliminar Ejercicio</AlertDialogHeader>
            <AlertDialogBody>
              ¿Eliminar <strong>{ejercicioAEliminar?.nombre}</strong>?
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>Cancelar</Button>
              <Button bg="red.600" color="white" ml={3} onClick={handleEliminar}>
                Eliminar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* =======================
          Modal agregar a rutina
      ======================= */}
      <Modal isOpen={isAddOpen} onClose={onAddClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Agregar "{ejercicioParaAgregar?.nombre}"</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Text mb={4}>Elegí la rutina:</Text>

            <RadioGroup onChange={setRutinaSeleccionada} value={rutinaSeleccionada}>
              <Stack>
                {rutinas.length > 0 ? (
                  rutinas.map(r => (
                    <Radio key={r.id_rutina ?? r.id} value={(r.id_rutina ?? r.id).toString()}>
                      {r.nombre}
                      {r.__alumno && (
                        <Text as="span" color="gray.500"> — {r.__alumno}</Text>
                      )}
                    </Radio>
                  ))
                ) : (
                  <Text color="gray.500">No hay rutinas disponibles.</Text>
                )}
              </Stack>
            </RadioGroup>

            {/* Configuración del ejercicio */}
            {ejercicioParaAgregar && (
              <Stack mt={6} spacing={3}>
                <FormControl>
                  <FormLabel>Series</FormLabel>
                  <Input
                    type="number"
                    value={nuevoEjercicioConfig.series}
                    onChange={(e) => setNuevoEjercicioConfig(p => ({ ...p, series: e.target.value }))}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Repeticiones</FormLabel>
                  <Input
                    type="number"
                    value={nuevoEjercicioConfig.repeticiones}
                    onChange={(e) => setNuevoEjercicioConfig(p => ({ ...p, repeticiones: e.target.value }))}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Grupo muscular</FormLabel>
                  <Input
                    value={nuevoEjercicioConfig.grupoMuscular}
                    onChange={(e) => setNuevoEjercicioConfig(p => ({ ...p, grupoMuscular: e.target.value }))}
                    placeholder="Ej: Pecho"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Observaciones</FormLabel>
                  <Textarea
                    value={nuevoEjercicioConfig.observaciones}
                    onChange={(e) => setNuevoEjercicioConfig(p => ({ ...p, observaciones: e.target.value }))}
                    placeholder="Notas para el alumno"
                  />
                </FormControl>
              </Stack>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" onClick={onAddClose}>Cancelar</Button>
            <Button bg="#258d19" color="white" ml={3}
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
