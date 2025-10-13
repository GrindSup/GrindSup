// src/components/AlumnoList.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import axios from "axios";
import {
  AddIcon, ChevronDownIcon, ChevronUpIcon, DeleteIcon, EditIcon, SearchIcon,
} from "@chakra-ui/icons";
import {
  Box, Button, Card, CardBody, CardHeader, CardFooter, Collapse, Container,
  Flex, Heading, HStack, IconButton, Input, InputGroup, InputLeftElement,
  SimpleGrid, Spacer, Spinner, Text, useToast, Tag, TagLabel, Badge,
  Select, Checkbox, AlertDialog, AlertDialogBody, AlertDialogContent,
  AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Textarea,
  Center, Link, Alert, AlertIcon
} from "@chakra-ui/react";
import { getUsuario, getEntrenadorId } from "../context/auth.js";
import BotonVolver from "../components/BotonVolver";

const API = import.meta?.env?.VITE_API_BASE_URL || "http://localhost:8080/api";

/* ---- helpers JSON <-> items ---- */
function parseNotes(raw) {
  if (!raw) return [];
  try {
    const j = JSON.parse(raw);
    if (Array.isArray(j?.items)) {
      return j.items
        .map(it => ({ text: String(it.text ?? "").trim(), important: !!it.important }))
        .filter(it => it.text);
    }
  } catch {}
  const t = String(raw).trim();
  return t ? [{ text: t, important: false }] : [];
}
function importantSummary(a) {
  const imp = [...parseNotes(a.lesiones), ...parseNotes(a.enfermedades)]
    .filter(i => i.important)
    .map(i => i.text);
  return imp;
}

export default function AlumnoList() {
  const [alumnos, setAlumnos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [expanded, setExpanded] = useState(() => new Set());

  const [isOpen, setIsOpen] = useState(false);
  const [alumnoToDelete, setAlumnoToDelete] = useState(null);
  const [motivo, setMotivo] = useState("");
  const cancelRef = useRef();

  const navigate = useNavigate();
  const toast = useToast();

  const usuario = useMemo(() => getUsuario(), []);
  const entrenadorId = useMemo(() => getEntrenadorId(usuario), [usuario]);

  const getAlumnoEntrenadorId = (a) =>
    a?.entrenador?.id_entrenador ?? a?.entrenador?.id ?? a?.id_entrenador ?? a?.entrenadorId ?? null;

  const fetchAlumnos = async () => {
    try {
      // Si NO hay entrenador → no traemos nada y mostramos empty state
      if (!entrenadorId) {
        setAlumnos([]);
        return;
      }
      const { data } = await axios.get(`${API}/alumnos`, {
        params: { entrenadorId }, // si el backend lo ignora, filtramos abajo
      });
      const rows = Array.isArray(data) ? data : [];
      const propios = rows.filter(
        (a) => Number(getAlumnoEntrenadorId(a)) === Number(entrenadorId)
      );
      setAlumnos(propios);
    } catch {
      toast({ title: "Error al cargar alumnos", status: "error", duration: 2000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  const fetchEstados = async () => {
    try {
      const { data } = await axios.get(`${API}/estados`);
      setEstados(data || []);
    } catch {
      toast({ title: "Error al cargar estados", status: "error", duration: 2000, isClosable: true });
    }
  };

  useEffect(() => {
    fetchAlumnos();
    fetchEstados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entrenadorId]);

  const toggleExpand = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleEstadoChange = (idAlumno, idEstado) => {
    const alumnoActual = alumnos.find((a) => a.id_alumno === idAlumno);
    if (!alumnoActual) return;

    const payload = {
      ...alumnoActual,
      estado: { id_estado: Number(idEstado) },
      entrenador:
        alumnoActual.entrenador ??
        (entrenadorId ? { id_entrenador: entrenadorId, id: entrenadorId } : null),
    };

    axios
      .put(`${API}/alumnos/${idAlumno}`, payload)
      .then(() => {
        toast({ title: "Estado actualizado", status: "success", duration: 2000, isClosable: true });
        fetchAlumnos();
      })
      .catch(() =>
        toast({ title: "Error al actualizar estado", status: "error", duration: 2000, isClosable: true })
      );
  };

  const handleInformeChange = (idAlumno, checked) => {
    axios
      .patch(`${API}/alumnos/${idAlumno}/informe`, { informeMedico: checked })
      .then(() => {
        toast({ title: "Informe médico actualizado", status: "success", duration: 2000, isClosable: true });
        fetchAlumnos();
      })
      .catch(() =>
        toast({ title: "Error al actualizar informe médico", status: "error", duration: 2000, isClosable: true })
      );
  };

  const openDeleteDialog = (alumno) => {
    setAlumnoToDelete(alumno);
    setMotivo("");
    setIsOpen(true);
  };

  const confirmDelete = () => {
    if (!motivo.trim()) {
      toast({ title: "Debe ingresar un motivo", status: "warning", duration: 2000, isClosable: true });
      return;
    }

    axios
      .delete(`${API}/alumnos/${alumnoToDelete.id_alumno}`, { data: { motivo } })
      .then(() => {
        toast({
          title: "Alumno eliminado",
          description: `Motivo: ${motivo}`,
          status: "success",
          duration: 2000,
          isClosable: true,
        });
        fetchAlumnos();
      })
      .catch(() => toast({ title: "Error al eliminar", status: "error", duration: 2000, isClosable: true }))
      .finally(() => setIsOpen(false));
  };

  const filteredAlumnos = alumnos.filter((alumno) => {
    const q = search.toLowerCase();
    return (
      alumno.nombre?.toLowerCase().includes(q) ||
      alumno.apellido?.toLowerCase().includes(q) ||
      String(alumno.documento ?? "").toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <Center py={20}>
        <Spinner size="xl" color="teal.500" />
      </Center>
    );
  }

  return (
    <Container maxW="7xl" py={8}>
      {!entrenadorId && (
        <Alert status="warning" mb={6} borderRadius="lg">
          <AlertIcon />
          Tu usuario no está vinculado a un entrenador. Por eso no se muestran alumnos.
        </Alert>
      )}

      <Flex gap={4} align="center" mb={6} wrap="wrap">
        <BotonVolver />
        <Heading size="lg" color="gray.900">Lista de Alumnos</Heading>
        <Spacer />
        <InputGroup w={{ base: "100%", sm: "360px" }}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Buscar por nombre, apellido o documento"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            bg="white"
            borderRadius="full"
            boxShadow="sm"
          />
        </InputGroup>
        <Button
          colorScheme="teal"
          leftIcon={<AddIcon />}
          onClick={() => navigate("/alumno/registrar")}
          bg="#38A169"
          color="white"
          isDisabled={!entrenadorId}
        >
          Agregar Alumno
        </Button>
      </Flex>

      {filteredAlumnos.length === 0 ? (
        <Center py={10}>
          <Text fontSize="lg" color="gray.500">
            {entrenadorId ? "No se encontraron alumnos." : "No hay alumnos para mostrar."}
          </Text>
        </Center>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={5}>
          {filteredAlumnos.map((a) => {
            const isOpen = expanded.has(a.id_alumno);
            const imp = importantSummary(a);
            const impText = imp.length <= 2 ? imp.join(", ") : `${imp.slice(0, 2).join(", ")} +${imp.length - 2}`;

            return (
              <Card key={a.id_alumno} borderRadius="2xl" boxShadow="md" _hover={{ boxShadow: "lg" }}>
                <CardHeader pb={3}>
                  <Flex align="center" gap={3}>
                    <Link as={RouterLink} to={`/alumno/perfil/${a.id_alumno}`} flex="1" _hover={{ textDecor: "none" }}>
                      <Box>
                        <Heading size="md">{a.nombre} {a.apellido}</Heading>
                        {imp.length > 0 && (
                          <Tag mt={2} size="sm" colorScheme="red" borderRadius="full">
                            <TagLabel>Importante: {impText}</TagLabel>
                          </Tag>
                        )}
                        <HStack spacing={2} mt={2}>
                          <Tag size="sm" colorScheme="teal" variant="subtle">
                            <TagLabel>DNI: {a.documento}</TagLabel>
                          </Tag>
                          {a.estado?.nombre && <Badge colorScheme="purple">{a.estado.nombre}</Badge>}
                        </HStack>
                      </Box>
                    </Link>
                    <Spacer />
                    <IconButton
                      aria-label={isOpen ? "Ocultar detalles" : "Ver detalles"}
                      icon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                      variant="ghost"
                      onClick={() => toggleExpand(a.id_alumno)}
                    />
                  </Flex>
                </CardHeader>

                <Collapse in={isOpen} animateOpacity>
                  <CardBody pt={0}>
                    <Box fontSize="sm" color="gray.700">
                      <Detail label="Teléfono" value={a.telefono || "—"} />
                      <Detail label="Altura (cm)" value={a.altura ?? "—"} />
                      <Detail label="Peso (kg)" value={a.peso ?? "—"} />

                      <NotesList label="Lesiones" items={parseNotes(a.lesiones)} />
                      <NotesList label="Enfermedades" items={parseNotes(a.enfermedades)} />

                      <Box mt={3}>
                        <Checkbox
                          isChecked={!!a.informeMedico}
                          onChange={(e) => handleInformeChange(a.id_alumno, e.target.checked)}
                        >
                          Informe médico entregado
                        </Checkbox>
                      </Box>

                      <Box mt={3}>
                        <Text mb={1} fontWeight="medium">Estado</Text>
                        <Select
                          size="sm"
                          value={a.estado?.id_estado || ""}
                          onChange={(e) => handleEstadoChange(a.id_alumno, e.target.value)}
                        >
                          {estados.map((estado) => (
                            <option key={estado.id_estado} value={estado.id_estado}>
                              {estado.nombre}
                            </option>
                          ))}
                        </Select>
                      </Box>
                    </Box>
                  </CardBody>
                </Collapse>

                <CardFooter pt={0}>
                  <HStack spacing={3} w="full" justify="flex-end">
                    <Button
                      size="sm"
                      colorScheme="blue"
                      leftIcon={<EditIcon />}
                      onClick={() => navigate(`/alumno/editar/${a.id_alumno}`)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      bg="red.500"
                      color="white"
                      _hover={{ bg: "red.600" }}
                      leftIcon={<DeleteIcon />}
                      onClick={() => openDeleteDialog(a)}
                    >
                      Eliminar
                    </Button>
                  </HStack>
                </CardFooter>
              </Card>
            );
          })}
        </SimpleGrid>
      )}

      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={() => setIsOpen(false)}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">Eliminar Alumno</AlertDialogHeader>
            <AlertDialogBody>
              <Text mb={2}>
                Ingrese el motivo de la eliminación del alumno{" "}
                <strong>{alumnoToDelete?.nombre} {alumnoToDelete?.apellido}</strong>:
              </Text>
              <Textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ej: alumno no continúa…" />
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsOpen(false)}>Cancelar</Button>
              <Button bg="red.500" color="white" _hover={{ bg: "red.600" }} onClick={confirmDelete} ml={3}>
                Eliminar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
}

function Detail({ label, value }) {
  return (
    <Flex as="dl" gap={2} mt={1}>
      <Text as="dt" minW="140px" color="gray.500">{label}</Text>
      <Text as="dd" fontWeight="medium">{String(value)}</Text>
    </Flex>
  );
}

function NotesList({ label, items }) {
  if (!items?.length) return <Detail label={label} value="—" />;
  return (
    <Box mt={2}>
      <Text mb={1} color="gray.500">{label}</Text>
      <Box pl={2}>
        {items.map((it, i) => (
          <HStack key={i} spacing={2} mb={1}>
            <Text>• {it.text}</Text>
            {it.important && <Badge colorScheme="red">Importante</Badge>}
          </HStack>
        ))}
      </Box>
    </Box>
  );
}