import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { SearchIcon, EditIcon, DeleteIcon, AddIcon } from "@chakra-ui/icons";
import {
  Heading,
  InputGroup,
  InputLeftElement,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Select,
  Button,
  HStack,
  Box,
  Flex,
  Spinner,
  Center,
  Text,
  useToast,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Textarea,
  Checkbox,
} from "@chakra-ui/react";

const AlumnoList = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [alumnoToDelete, setAlumnoToDelete] = useState(null);
  const [motivo, setMotivo] = useState("");
  const cancelRef = useRef();

  const navigate = useNavigate();
  const toast = useToast();

  const fetchAlumnos = () => {
    axios
      .get("http://localhost:8080/api/alumnos")
      .then((res) => setAlumnos(res.data))
      .catch(() =>
        toast({
          title: "Error al cargar alumnos",
          status: "error",
          duration: 2000,
          isClosable: true,
        })
      )
      .finally(() => setLoading(false));
  };

  const fetchEstados = () => {
    axios
      .get("http://localhost:8080/api/estados")
      .then((res) => setEstados(res.data))
      .catch(() =>
        toast({
          title: "Error al cargar estados",
          status: "error",
          duration: 2000,
          isClosable: true,
        })
      );
  };

  useEffect(() => {
    fetchAlumnos();
    fetchEstados();
  }, []);

  const handleEstadoChange = (idAlumno, idEstado) => {
    axios
      .put(`http://localhost:8080/api/alumnos/${idAlumno}`, {
        estado: { id_estado: Number(idEstado) },
      })
      .then(() => {
        toast({
          title: "Estado actualizado",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
        fetchAlumnos();
      })
      .catch(() =>
        toast({
          title: "Error al actualizar estado",
          status: "error",
          duration: 2000,
          isClosable: true,
        })
      );
  };

  // ✅ Ahora usa PATCH al nuevo endpoint
  const handleInformeChange = (idAlumno, checked) => {
    axios
      .patch(`http://localhost:8080/api/alumnos/${idAlumno}/informe`, {
        informeMedico: checked,
      })
      .then(() => {
        toast({
          title: "Informe médico actualizado",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
        fetchAlumnos();
      })
      .catch(() =>
        toast({
          title: "Error al actualizar informe médico",
          status: "error",
          duration: 2000,
          isClosable: true,
        })
      );
  };

  const openDeleteDialog = (alumno) => {
    setAlumnoToDelete(alumno);
    setMotivo("");
    setIsOpen(true);
  };

  const confirmDelete = () => {
    if (!motivo.trim()) {
      toast({
        title: "Debe ingresar un motivo",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    axios
      .delete(`http://localhost:8080/api/alumnos/${alumnoToDelete.id_alumno}`, {
        data: { motivo },
      })
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
      .catch(() =>
        toast({
          title: "Error al eliminar",
          status: "error",
          duration: 2000,
          isClosable: true,
        })
      )
      .finally(() => setIsOpen(false));
  };

  const filteredAlumnos = alumnos.filter((alumno) => {
    const query = search.toLowerCase();
    return (
      alumno.nombre?.toLowerCase().includes(query) ||
      alumno.apellido?.toLowerCase().includes(query) ||
      String(alumno.documento)?.toLowerCase().includes(query)
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
    <Box mt={10} w="100%">
      <Flex justify="space-between" align="center" mb={6} px={8}>
        <Heading as="h2" size="lg" color="teal.600">
          Lista de Alumnos
        </Heading>
        <InputGroup w="350px">
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
      </Flex>

      {filteredAlumnos.length === 0 ? (
        <Center py={10}>
          <Text fontSize="lg" color="gray.500">
            No se encontraron alumnos.
          </Text>
        </Center>
      ) : (
        <TableContainer w="100%" maxW="100%" px={8}>
          <Table variant="striped" colorScheme="teal" size="md">
            <Thead>
              <Tr>
                <Th>Nombre</Th>
                <Th>Apellido</Th>
                <Th>Documento</Th>
                <Th>Teléfono</Th>
                <Th>Enfermedades</Th>
                <Th>Informe Médico</Th>
                <Th>Estado</Th>
                <Th textAlign="center">Opciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredAlumnos.map((alumno) => (
                <Tr key={alumno.id_alumno} _hover={{ bg: "teal.50" }}>
                  <Td>{alumno.nombre}</Td>
                  <Td>{alumno.apellido}</Td>
                  <Td>{alumno.documento}</Td>
                  <Td>{alumno.telefono}</Td>
                  <Td>{alumno.enfermedades || "—"}</Td>
                  <Td>
                    <Checkbox
                      isChecked={alumno.informeMedico}
                      onChange={(e) =>
                        handleInformeChange(alumno.id_alumno, e.target.checked)
                      }
                    >
                      Entregado
                    </Checkbox>
                  </Td>
                  <Td>
                    <Select
                      size="sm"
                      value={alumno.estado?.id_estado || ""}
                      onChange={(e) =>
                        handleEstadoChange(alumno.id_alumno, e.target.value)
                      }
                    >
                      {estados.map((estado) => (
                        <option
                          key={estado.id_estado}
                          value={estado.id_estado}
                        >
                          {estado.nombre}
                        </option>
                      ))}
                    </Select>
                  </Td>
                  <Td>
                    <HStack spacing={3} justify="center">
                      <Button
                        size="sm"
                        colorScheme="blue"
                        leftIcon={<EditIcon />}
                        onClick={() =>
                          navigate(`/alumno/editar/${alumno.id_alumno}`)
                        }
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="red"
                        leftIcon={<DeleteIcon />}
                        onClick={() => openDeleteDialog(alumno)}
                      >
                        Eliminar
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}

      <Flex justify="center" px={8} mt={6}>
        <Button
          colorScheme="teal"
          leftIcon={<AddIcon />}
          onClick={() => navigate("/alumno/registrar")}
        >
          Agregar Alumno
        </Button>
      </Flex>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Eliminar Alumno
            </AlertDialogHeader>
            <AlertDialogBody>
              <Text mb={2}>
                Ingrese el motivo de la eliminación del alumno{" "}
                <strong>{alumnoToDelete?.nombre}</strong>:
              </Text>
              <Textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ej: alumno no continúa con el curso..."
              />
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                Eliminar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default AlumnoList;
