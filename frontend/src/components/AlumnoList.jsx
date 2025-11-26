// src/components/AlumnoList.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import axios from "../config/axios.config";
import {
  AddIcon, ChevronDownIcon, ChevronUpIcon, DeleteIcon, EditIcon, SearchIcon, ArrowBackIcon,
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

const API = import.meta?.env?.VITE_API_BASE_URL || "http://localhost:8080/api";

/* ---- helpers JSON <-> items ---- */
// 🛑 MODIFICADO: Incluir el campo 'fecha' en la salida
function parseNotes(raw) {
  if (!raw) return [];
  try {
    const j = JSON.parse(raw);
    if (Array.isArray(j?.items)) {
      return j.items
        .map(it => ({ 
          text: String(it.text ?? "").trim(), 
          important: !!it.important,
          fecha: it.fecha || null // <-- Se incluye la fecha
        }))
        .filter(it => it.text);
    }
  } catch {}
  // Para el caso fallback, también inicializamos 'fecha'
  const t = String(raw).trim();
  return t ? [{ text: t, important: false, fecha: null }] : [];
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

  // Contemplar también `entrenador.idEntrenador` (camelCase)
  const getAlumnoEntrenadorId = (a) =>
    a?.entrenador?.id_entrenador ??
    a?.entrenador?.idEntrenador ??
    a?.entrenador?.id ??
    a?.id_entrenador ??
    a?.entrenadorId ??
    null;

  const fetchAlumnos = async () => {
    try {
      if (!entrenadorId) {
        setAlumnos([]);
        return;
      }
      const { data } = await axios.get(`${API}/alumnos`, {
        params: { entrenadorId },
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
      setEstados(Array.isArray(data) ? data : []);
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
    const alumnoActual = alumnos.find((a) => (a.id_alumno ?? a.idAlumno) === idAlumno);
    if (!alumnoActual) return;

    // Asumimos que los estados Activo (1) y Archivados (2) se manejan con PATCH /estado
    const isArchiveOrActivate = Number(idEstado) === 1 || Number(idEstado) === 2;

    if (isArchiveOrActivate) {
        // Usar la nueva API PATCH /alumnos/{id}/estado
        axios
          .patch(`${API}/alumnos/${idAlumno}/estado`, { idEstado: Number(idEstado) })
          .then(() => {
            const statusText = Number(idEstado) === 1 ? "Reactivado" : "Archivado";
            toast({ title: `Alumno ${statusText}`, status: "success", duration: 2000, isClosable: true });
            fetchAlumnos();
          })
          .catch(() =>
            toast({ title: "Error al cambiar estado", status: "error", duration: 2000, isClosable: true })
          );

    } else {
        // Usar el método PUT existente para otros cambios de estado (si los hay)
        const payload = {
            ...alumnoActual,
            estado: { id_estado: Number(idEstado) },
            entrenador:
                alumnoActual.entrenador ??
                (entrenadorId ? { id_entrenador: entrenadorId, id: entrenadorId, idEntrenador: entrenadorId } : null),
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
    }
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
      .delete(`${API}/alumnos/${alumnoToDelete.id_alumno ?? alumnoToDelete.idAlumno}`, { data: { motivo } })
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
        <Button leftIcon={<ArrowBackIcon />} onClick={() => navigate("/InicioDashboard")} bg="#258d19" color="white">
          Volver
        </Button>
        <Heading size="lg" color="white">Lista de Alumnos</Heading>
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
          bg="#258d19"
          color="white"
          isDisabled={!entrenadorId}
        >
          Agregar Alumno
        </Button>
      </Flex>

      {filteredAlumnos.length === 0 ? (
        <Center py={10}>
          <Text fontSize="lg" color="gray.300" fontWeight="bold">
            {entrenadorId ? "No se encontraron alumnos." : "No hay alumnos para mostrar."}
          </Text>
        </Center>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={5}>
          {filteredAlumnos.map((a) => {
            const aid = a.id_alumno ?? a.idAlumno;
            const isOpen = expanded.has(aid);
            const imp = importantSummary(a);
            const impText = imp.length <= 2 ? imp.join(", ") : `${imp.slice(0, 2).join(", ")} +${imp.length - 2}`;

            return (
              <Card 
                key={aid} 
                borderRadius="2xl" 
                boxShadow="md" 
                _hover={{ boxShadow: "lg" }} 
                cursor="pointer" 
                // El Card entero sigue siendo el toggle principal
                onClick={() => toggleExpand(aid)} 
              >
                <CardHeader pb={3}>
                  <Flex align="center" gap={3}>
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
                    <Spacer />
                    <IconButton
                      aria-label={isOpen ? "Ocultar detalles" : "Ver detalles"}
                      icon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                      variant="ghost"
                      // 🛑 SOLUCIÓN: Usar e.stopPropagation() para que solo se dispare el click del icono.
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(aid);
                      }}
                    />
                  </Flex>
                </CardHeader>

                <Collapse in={isOpen} animateOpacity unmountOnExit>
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
                          // 🛑 Parar propagación también en el Checkbox para evitar colapsar
                          onChange={(e) => {
                            e.stopPropagation();
                            handleInformeChange(aid, e.target.checked);
                          }}
                        >
                          Informe médico entregado
                        </Checkbox>
                      </Box>

                      <Box mt={3}>
                        <Text mb={1} fontWeight="medium">Estado</Text>
                        <Select
                          size="sm"
                          value={(a.estado?.id_estado ?? a.estado?.idEstado) ?? ""}
                          // 🛑 Parar propagación también en el Select para evitar colapsar
                          onChange={(e) => {
                            e.stopPropagation();
                            handleEstadoChange(aid, e.target.value);
                          }}
                        >
                          {estados.map((estado) => {
                            const eid = estado.id_estado ?? estado.idEstado;
                            return (
                              <option key={eid} value={eid}>
                                {estado.nombre}
                              </option>
                            );
                          })}
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
                      // 🛑 Parar propagación también en el Botón Editar
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/alumno/editar/${aid}`);
                      }}
                      bg="#258d19"
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      bg="red.600"
                      color="white"
                      _hover={{ bg: "red.600" }}
                      // 🛑 Parar propagación también en el Botón Eliminar
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteDialog(a);
                      }}
                      leftIcon={<DeleteIcon />}
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
              <Button ref={cancelRef} onClick={() => setIsOpen(false)} bg="#258d19" color="white">Cancelar</Button>
              <Button bg="red.600" color="white" _hover={{ bg: "red.600" }} onClick={confirmDelete} ml={3}>
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
      <Text as="dt" minWidth="140px" color="gray.700">{label}</Text>
      <Text as="dd" fontWeight="medium">{String(value)}</Text>
    </Flex>
  );
}

// 🛑 MODIFICADO: Componente NotesList para mostrar la fecha de lesión
function NotesList({ label, items }) {
  if (!items?.length) return <Detail label={label} value="—" />;
  
  const isLesion = label === "Lesiones";

  return (
    <Box mt={2}>
      <Text mb={1} color="gray.500" fontWeight="bold">{label}</Text>
      <Box pl={2}>
        {items.map((it, i) => {
          // Formatear la fecha si existe (formato: dd/mm/yyyy)
          const dateString = isLesion && it.fecha 
            ? new Date(it.fecha + 'T00:00:00').toLocaleDateString('es-AR') 
            : null;
          
          return (
            <HStack key={i} spacing={2} mb={1} align="flex-start">
              <Text>•</Text>
              <Box>
                {/* Mostrar la fecha de la lesión */}
                {isLesion && dateString && (
                    <Badge colorScheme="purple" variant="subtle" mr={2}>{dateString}</Badge>
                )}
                {it.important && <Badge colorScheme="red" mr={2}>Importante</Badge>}
                <Text as="span" fontSize="sm">{it.text}</Text>
              </Box>
            </HStack>
          );
        })}
      </Box>
    </Box>
  );
}