import { useState } from "react";
import {
  Box, Button, Container, FormControl, FormLabel, Input, Select, Heading,
  VStack, Alert, AlertIcon, Textarea, FormHelperText,
  HStack, IconButton} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons"; 

// REVISAR UNA VEZ DESARROLLADO EL BACKEND
const crearEjercicio = async (payload) => {
  console.log("Enviando al backend:", payload);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { data: { id_ejercicio: Math.floor(Math.random() * 1000), ...payload } };
};


export default function RegistrarEjercicio() {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [grupoMuscularPrincipal, setGrupoMuscularPrincipal] = useState([""]);
  const [grupoMuscularSecundario, setGrupoMuscularSecundario] = useState([""]);
  const [dificultad, setDificultad] = useState("");
  const [equipamiento, setEquipamiento] = useState([""]); 

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const todosLosMusculos = ["Abductores", "Aductores", "Biceps", "Cuadriceps", "Dorsales", "Femorales", "Gemelos", "Gluteos", "Hombros", "Pectorales", "Triceps"];
  const todosLosEquipamientos = ["Banda elástica", "Banco inclinado", "Barra", 
    "Camilla de Isquios", "Mancuernas", "Máquina hack", "Máquina Smith", 
    "Polea", "Prensa", "Silla de Cuádriceps", "Silla de Isquios", "Step"
  ];

  const handleListChange = (setter) => (index, value) => {
    setter(prev => {
      const newList = [...prev];
      newList[index] = value;
      return newList;
    });
  };

  const handleAddListItem = (setter) => () => {
    setter(prev => [...prev, ""]);
  };

  const handleRemoveListItem = (setter) => (index) => {
    setter(prev => {
      if (prev.length === 1) return [""];
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleGrupoPrincipalChange = handleListChange(setGrupoMuscularPrincipal);
  const handleAddGrupoPrincipal = handleAddListItem(setGrupoMuscularPrincipal);
  const handleRemoveGrupoPrincipal = handleRemoveListItem(setGrupoMuscularPrincipal);

  const handleGrupoSecundarioChange = handleListChange(setGrupoMuscularSecundario);
  const handleAddGrupoSecundario = handleAddListItem(setGrupoMuscularSecundario);
  const handleRemoveGrupoSecundario = handleRemoveListItem(setGrupoMuscularSecundario);

  const handleEquipamientoChange = handleListChange(setEquipamiento);
  const handleAddEquipamiento = handleAddListItem(setEquipamiento);
  const handleRemoveEquipamiento = handleRemoveListItem(setEquipamiento);

  const resetForm = () => {
    setNombre("");
    setDescripcion("");
    setGrupoMuscularPrincipal([""]);
    setGrupoMuscularSecundario([""]);
    setDificultad("");
    setEquipamiento([""]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    
    const musculosPrincipalesFinal = grupoMuscularPrincipal.filter(Boolean);
    if (!nombre || musculosPrincipalesFinal.length === 0 || !dificultad) {
      return setError("Nombre, al menos un grupo muscular principal y dificultad son obligatorios.");
    }
    
    const equipamientoFinal = equipamiento.filter(Boolean);
    const musculosSecundariosFinal = grupoMuscularSecundario.filter(Boolean);

    const payload = {
      nombre,
      descripcion,
      grupoMuscularPrincipal: musculosPrincipalesFinal,
      grupoMuscularSecundario: musculosSecundariosFinal,
      dificultad,
      equipamiento: equipamientoFinal,
    };

    try {
      setLoading(true);
      await crearEjercicio(payload);
      setMsg(`Ejercicio "${nombre}" registrado con éxito ✅`);
      resetForm();
    } catch (err) {
      setError(err?.response?.data?.mensaje || err?.message || "Error al registrar el ejercicio");
    } finally {
      setLoading(false);
    }
  };

  const musculosPrincipalesSeleccionados = grupoMuscularPrincipal.filter(Boolean);

  return (
    <Container maxW="lg" py={10}>
      <Box p={8} borderWidth="1px" borderRadius="2xl" boxShadow="lg" bg="white">
        <Heading size="lg" textAlign="center" mb={6} color="brand.600">Registrar Nuevo Ejercicio</Heading>

        <form onSubmit={handleSubmit}>
          <VStack spacing={5} align="stretch">
            <FormControl isRequired>
                <FormLabel>Nombre del Ejercicio</FormLabel>
                <Input 
                    type="text" 
                    placeholder="Ej: Sentadillas con barra" 
                    value={nombre} 
                    onChange={(e) => setNombre(e.target.value)} 
                />
            </FormControl>

            <FormControl>
                <FormLabel>Descripción</FormLabel>
                <Textarea 
                    placeholder="Describe la técnica..." 
                    value={descripcion} 
                    onChange={(e) => setDescripcion(e.target.value)} 
                />
            </FormControl>

            {/* --- Grupo Muscular Principal (Modificado) --- */}
            <FormControl isRequired>
              <FormLabel>Grupo Muscular Principal</FormLabel>
              <VStack align="stretch" spacing={3}>
                {grupoMuscularPrincipal.map((itemSeleccionado, index) => {
                  const opcionesDisponibles = todosLosMusculos.filter(
                    op => !grupoMuscularPrincipal.includes(op) || op === itemSeleccionado
                  );

                  return (
                    <HStack key={index}>
                      <Select placeholder="Seleccione un grupo" value={itemSeleccionado} onChange={(e) => handleGrupoPrincipalChange(index, e.target.value)}>
                        {opcionesDisponibles.map(op => <option key={op} value={op}>{op}</option>)}
                      </Select>
                      <IconButton icon={<DeleteIcon />} colorScheme="red" variant="ghost" onClick={() => handleRemoveGrupoPrincipal(index)} aria-label="Eliminar grupo muscular"/>
                    </HStack>
                  );
                })}
              </VStack>
              <Button leftIcon={<AddIcon />} mt={3} size="sm" variant="outline" colorScheme="green" onClick={handleAddGrupoPrincipal} isDisabled={grupoMuscularPrincipal.filter(Boolean).length >= todosLosMusculos.length}>
                Agregar Grupo Muscular
              </Button>
            </FormControl>

            <FormControl>
              <FormLabel>Grupo Muscular Secundario </FormLabel>
              <VStack align="stretch" spacing={3}>
                {grupoMuscularSecundario.map((itemSeleccionado, index) => {
                  const opcionesDisponibles = todosLosMusculos.filter(
                    op => !musculosPrincipalesSeleccionados.includes(op) && (!grupoMuscularSecundario.includes(op) || op === itemSeleccionado)
                  );

                  return (
                    <HStack key={index}>
                      <Select placeholder="Seleccione un grupo" value={itemSeleccionado} onChange={(e) => handleGrupoSecundarioChange(index, e.target.value)}>
                        {opcionesDisponibles.map(op => <option key={op} value={op}>{op}</option>)}
                      </Select>
                      <IconButton icon={<DeleteIcon />} colorScheme="red" variant="ghost" onClick={() => handleRemoveGrupoSecundario(index)} aria-label="Eliminar grupo muscular"/>
                    </HStack>
                  );
                })}
              </VStack>
              <Button leftIcon={<AddIcon />} mt={3} size="sm" variant="outline" colorScheme="green" onClick={handleAddGrupoSecundario} isDisabled={grupoMuscularSecundario.filter(Boolean).length >= todosLosMusculos.length - musculosPrincipalesSeleccionados.length}>
                Agregar Grupo Muscular
              </Button>
            </FormControl>
            
            <FormControl isRequired>
                <FormLabel>Dificultad</FormLabel>
                <Select placeholder="Seleccione la dificultad" value={dificultad} onChange={(e) => setDificultad(e.target.value)}>
                    <option value="principiante">Principiante</option>
                    <option value="intermedio">Intermedio</option>
                    <option value="avanzado">Avanzado</option>
                </Select>
            </FormControl>
            
            <FormControl>
              <FormLabel>Equipamiento Necesario </FormLabel>
              <VStack align="stretch" spacing={3}>
                {equipamiento.map((itemSeleccionado, index) => {
                  const opcionesDisponibles = todosLosEquipamientos.filter(
                    op => !equipamiento.includes(op) || op === itemSeleccionado
                  );

                  return (
                    <HStack key={index}>
                      <Select placeholder="Seleccione equipamiento" value={itemSeleccionado} onChange={(e) => handleEquipamientoChange(index, e.target.value)}>
                        {opcionesDisponibles.map(opcion => <option key={opcion} value={opcion}>{opcion}</option>)}
                      </Select>
                      <IconButton icon={<DeleteIcon />} colorScheme="red" variant="ghost" onClick={() => handleRemoveEquipamiento(index)} aria-label="Eliminar equipamiento"/>
                    </HStack>
                  );
                })}
              </VStack>
              <Button leftIcon={<AddIcon />} mt={3} size="sm" variant="outline" colorScheme="green" onClick={handleAddEquipamiento} isDisabled={equipamiento.filter(Boolean).length >= todosLosEquipamientos.length}>
                Agregar Equipamiento
              </Button>
            </FormControl>

            {error && <Alert status="error"><AlertIcon/>{error}</Alert>}
            {msg && <Alert status="success"><AlertIcon/>{msg}</Alert>}

            <Button type="submit" colorScheme="brand" width="full" isLoading={loading} loadingText="Guardando...">
              Guardar Ejercicio
            </Button>
          </VStack>
        </form>
      </Box>
    </Container>
  );
}