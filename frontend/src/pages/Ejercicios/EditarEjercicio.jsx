import React, { useState, useEffect } from 'react';
import {
  Box, Button, Container, FormControl, FormLabel, Input, Select, Heading,
  VStack, Alert, AlertIcon, Textarea, HStack, IconButton, Text,
  Spinner, Center, useToast
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import axiosInstance from '../../config/axios.config';
import { useNavigate, useParams } from "react-router-dom";

export default function EditarEjercicio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [grupoMuscularPrincipal, setGrupoMuscularPrincipal] = useState([""]);
  const [grupoMuscularSecundario, setGrupoMuscularSecundario] = useState([""]);
  const [dificultad, setDificultad] = useState("");
  const [equipamiento, setEquipamiento] = useState([""]);


  const [loading, setLoading] = useState(true); 
  const [submitting, setSubmitting] = useState(false); 
  const [error, setError] = useState("");
  const [inlineErrors, setInlineErrors] = useState({ principal: "", secundario: "", equipamiento: "" });

  const todosLosMusculos = ["Abductores", "Aductores", "Biceps", "Cuadriceps", "Dorsales", "Femorales", "Gemelos", "Gluteos", "Hombros", "Pectorales", "Triceps"];
  const todosLosEquipamientos = ["Banda elástica", "Banco inclinado", "Barra", "Camilla de Isquios", "Mancuernas", "Máquina hack", "Máquina Smith", "Polea", "Prensa", "Silla de Cuádriceps", "Silla de Isquios", "Step"];


  useEffect(() => {
    const fetchEjercicio = async () => {
      try {
        const response = await axiosInstance.get(`/api/ejercicios/${id}`);
        const data = response.data;

        setNombre(data.nombre);
        setDescripcion(data.descripcion || "");
        setDificultad(data.dificultad || "");
        setGrupoMuscularPrincipal(data.grupoMuscularPrincipal?.length ? data.grupoMuscularPrincipal : [""]);
        setGrupoMuscularSecundario(data.grupoMuscularSecundario?.length ? data.grupoMuscularSecundario : [""]);
        setEquipamiento(data.equipamiento?.length ? data.equipamiento : [""]);

      } catch (err) {
        setError("Error al cargar la información del ejercicio.");
        toast({ title: "Error", description: "No se pudo cargar el ejercicio.", status: "error", duration: 3000, isClosable: true });
      } finally {
        setLoading(false);
      }
    };
    fetchEjercicio();
  }, [id, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const musculosPrincipalesFinal = grupoMuscularPrincipal.filter(Boolean);
    if (!nombre || musculosPrincipalesFinal.length === 0 || !dificultad) {
      return setError("Nombre, al menos un grupo muscular principal y dificultad son obligatorios.");
    }

    const payload = {
      nombre,
      descripcion,
      dificultad,
      grupoMuscularPrincipal: musculosPrincipalesFinal,
      grupoMuscularSecundario: grupoMuscularSecundario.filter(Boolean),
      equipamiento: equipamiento.filter(Boolean),
    };

    try {
      setSubmitting(true);
      await axiosInstance.put(`/api/ejercicios/${id}`, payload);
      toast({ title: "Éxito", description: `Ejercicio "${nombre}" actualizado correctamente.`, status: "success", duration: 3000, isClosable: true });
      navigate('/ejercicios'); 
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Error al actualizar el ejercicio";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleListChange = (setter, errorKey) => (index, value) => {
    setInlineErrors(prev => ({ ...prev, [errorKey]: "" }));
    setter(prev => {
      const newList = [...prev];
      newList[index] = value;
      return newList;
    });
  };

  const handleRemoveListItem = (setter) => (index) => {
    setter(prev => {
      if (prev.length === 1) return [""];
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleAddGrupoPrincipal = () => {
    if (!grupoMuscularPrincipal[grupoMuscularPrincipal.length - 1]) {
      return setInlineErrors(prev => ({ ...prev, principal: "Debe seleccionar una opción para agregar otra." }));
    }
    setGrupoMuscularPrincipal(prev => [...prev, ""]);
  };

  const handleAddGrupoSecundario = () => {
    if (!grupoMuscularSecundario[grupoMuscularSecundario.length - 1]) {
      return setInlineErrors(prev => ({ ...prev, secundario: "Debe seleccionar una opción para agregar otra." }));
    }
    setGrupoMuscularSecundario(prev => [...prev, ""]);
  };

  const handleAddEquipamiento = () => {
    if (!equipamiento[equipamiento.length - 1]) {
      return setInlineErrors(prev => ({ ...prev, equipamiento: "Debe seleccionar una opción para agregar otra." }));
    }
    setEquipamiento(prev => [...prev, ""]);
  };

  const handleGrupoPrincipalChange = handleListChange(setGrupoMuscularPrincipal, 'principal');
  const handleRemoveGrupoPrincipal = handleRemoveListItem(setGrupoMuscularPrincipal);
  const handleGrupoSecundarioChange = handleListChange(setGrupoMuscularSecundario, 'secundario');
  const handleRemoveGrupoSecundario = handleRemoveListItem(setGrupoMuscularSecundario);
  const handleEquipamientoChange = handleListChange(setEquipamiento, 'equipamiento');
  const handleRemoveEquipamiento = handleRemoveListItem(setEquipamiento);

  const musculosPrincipalesSeleccionados = grupoMuscularPrincipal.filter(Boolean);

  if (loading) {
    return <Center py={10}><Spinner size="xl" /></Center>;
  }

  return (
    <Container maxW="lg" py={10}>
      <Box p={8} borderWidth="1px" borderRadius="2xl" boxShadow="lg" bg="white">
        <Heading size="lg" textAlign="center" mb={6} color="white">Editar Ejercicio</Heading>

        <form onSubmit={handleSubmit}>
          <VStack spacing={5} align="stretch">
            <FormControl isRequired>
                <FormLabel>Nombre del Ejercicio</FormLabel>
                <Input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </FormControl>
            <FormControl>
                <FormLabel>Descripción</FormLabel>
                <Textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
            </FormControl>
            <FormControl isRequired isInvalid={!!inlineErrors.principal}>
              <FormLabel>Grupo Muscular Principal</FormLabel>
              <VStack align="stretch" spacing={3}>
                {grupoMuscularPrincipal.map((itemSeleccionado, index) => {
                  const opcionesDisponibles = todosLosMusculos.filter(op => !grupoMuscularPrincipal.includes(op) || op === itemSeleccionado);
                  return (
                    <HStack key={index}>
                      <Select placeholder="Seleccione un grupo" value={itemSeleccionado} onChange={(e) => handleGrupoPrincipalChange(index, e.target.value)}>
                        {opcionesDisponibles.map(op => <option key={op} value={op}>{op}</option>)}
                      </Select>
                      <IconButton icon={<DeleteIcon />} onClick={() => handleRemoveGrupoPrincipal(index)} aria-label="Eliminar grupo muscular" bg="#258d19" color="white"/>
                    </HStack>
                  );
                })}
              </VStack>
              <Box mt={3}>
                <Button leftIcon={<AddIcon />} size="sm" variant="solid" onClick={handleAddGrupoPrincipal} isDisabled={musculosPrincipalesSeleccionados.length >= todosLosMusculos.length} bg="#258d19" color="white">
                  Agregar Grupo Muscular
                </Button>
                {inlineErrors.principal && <Text color="red.500" fontSize="sm" mt={2}>{inlineErrors.principal}</Text>}
              </Box>
            </FormControl>
            <FormControl isInvalid={!!inlineErrors.secundario}>
              <FormLabel>Grupo Muscular Secundario</FormLabel>
              <VStack align="stretch" spacing={3}>
                {grupoMuscularSecundario.map((itemSeleccionado, index) => {
                  const opcionesDisponibles = todosLosMusculos.filter(op => !musculosPrincipalesSeleccionados.includes(op) && (!grupoMuscularSecundario.includes(op) || op === itemSeleccionado));
                  return (
                    <HStack key={index}>
                      <Select placeholder="Seleccione un grupo" value={itemSeleccionado} onChange={(e) => handleGrupoSecundarioChange(index, e.target.value)}>
                        {opcionesDisponibles.map(op => <option key={op} value={op}>{op}</option>)}
                      </Select>
                      <IconButton icon={<DeleteIcon />} onClick={() => handleRemoveGrupoSecundario(index)} aria-label="Eliminar grupo muscular" bg="#258d19" color="white"/>
                    </HStack>
                  );
                })}
              </VStack>
              <Box mt={3}>
                <Button leftIcon={<AddIcon />} size="sm" variant="solid" onClick={handleAddGrupoSecundario} isDisabled={grupoMuscularSecundario.filter(Boolean).length >= todosLosMusculos.length - musculosPrincipalesSeleccionados.length} bg="#258d19" color="white">
                  Agregar Grupo Muscular
                </Button>
                {inlineErrors.secundario && <Text color="red.500" fontSize="sm" mt={2}>{inlineErrors.secundario}</Text>}
              </Box>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Dificultad</FormLabel>
              <Select placeholder="Seleccione la dificultad" value={dificultad} onChange={(e) => setDificultad(e.target.value)}>
                <option value="principiante">Principiante</option>
                <option value="intermedio">Intermedio</option>
                <option value="avanzado">Avanzado</option>
              </Select>
            </FormControl>
            <FormControl isInvalid={!!inlineErrors.equipamiento}>
              <FormLabel>Equipamiento Necesario</FormLabel>
              <VStack align="stretch" spacing={3}>
                {equipamiento.map((itemSeleccionado, index) => {
                  const opcionesDisponibles = todosLosEquipamientos.filter(op => !equipamiento.includes(op) || op === itemSeleccionado);
                  return (
                    <HStack key={index}>
                      <Select placeholder="Seleccione equipamiento" value={itemSeleccionado} onChange={(e) => handleEquipamientoChange(index, e.target.value)}>
                        {opcionesDisponibles.map(opcion => <option key={opcion} value={opcion}>{opcion}</option>)}
                      </Select>
                      <IconButton icon={<DeleteIcon />} onClick={() => handleRemoveEquipamiento(index)} aria-label="Eliminar equipamiento" bg="#258d19" color="white" />
                    </HStack>
                  );
                })}
              </VStack>
              <Box mt={3}>
                <Button leftIcon={<AddIcon />} size="sm" variant="solid" onClick={handleAddEquipamiento} isDisabled={equipamiento.filter(Boolean).length >= todosLosEquipamientos.length} bg="#258d19" color="white">
                  Agregar Equipamiento
                </Button>
                {inlineErrors.equipamiento && <Text color="red.500" fontSize="sm" mt={2}>{inlineErrors.equipamiento}</Text>}
              </Box>
            </FormControl>

            {error && <Alert status="error"><AlertIcon />{error}</Alert>}

            <HStack pt={4}>
              <Button type="submit" colorScheme="brand" width="full" isLoading={submitting} loadingText="Guardando..." bg="#258d19" color="white">
                Guardar Cambios
              </Button>
              <Button variant="ghost" onClick={() => navigate(-1)}>Cancelar</Button>
            </HStack>
            
          </VStack>
        </form>
      </Box>
    </Container>
  );
}