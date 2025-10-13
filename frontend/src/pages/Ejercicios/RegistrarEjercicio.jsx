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
  const [grupoMuscular, setGrupoMuscular] = useState("");
  const [dificultad, setDificultad] = useState("");
  

  const [equipamiento, setEquipamiento] = useState([""]); 

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const todasLasOpciones = [
    "Peso corporal", "Bandas elásticas", "Mancuernas", 
    "Escalón", "Pesa rusa", "Máquinas", 
    "Rodillo de abdominales", "Pelota"
  ];

  const handleEquipamientoChange = (index, value) => {
    const nuevosEquipamientos = [...equipamiento];
    nuevosEquipamientos[index] = value;
    setEquipamiento(nuevosEquipamientos);
  };

  const handleAddEquipamiento = () => {
    setEquipamiento([...equipamiento, ""]);
  };

  const handleRemoveEquipamiento = (index) => {
    if (equipamiento.length === 1) {
      setEquipamiento([""]);
    } else {
      setEquipamiento(equipamiento.filter((_, i) => i !== index));
    }
  };


  const resetForm = () => {
    setNombre("");
    setDescripcion("");
    setGrupoMuscular("");
    setDificultad("");
    setEquipamiento([""]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");

    if (!nombre || !grupoMuscular || !dificultad) {
      return setError("Nombre, grupo muscular y dificultad son obligatorios.");
    }
    
    const equipamientoFinal = equipamiento.filter(item => item !== "");

    const payload = {
      nombre,
      descripcion,
      grupoMuscular,
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

  return (
    <Container maxW="lg" py={10}>
      <Box p={8} borderWidth="1px" borderRadius="2xl" boxShadow="lg" bg="white">
        <Heading size="lg" textAlign="center" mb={6} color="brand.600">Registrar Nuevo Ejercicio</Heading>

        <form onSubmit={handleSubmit}>
          <VStack spacing={5} align="stretch">
            <FormControl isRequired><FormLabel>Nombre del Ejercicio</FormLabel><Input type="text" placeholder="Ej: Sentadillas con barra" value={nombre} onChange={(e) => setNombre(e.target.value)} /></FormControl>
            <FormControl><FormLabel>Descripción</FormLabel><Textarea placeholder="Describe la técnica..." value={descripcion} onChange={(e) => setDescripcion(e.target.value)} /></FormControl>
            <FormControl isRequired><FormLabel>Grupo Muscular Principal</FormLabel><Select placeholder="Seleccione un grupo" value={grupoMuscular} onChange={(e) => setGrupoMuscular(e.target.value)}><option value="Brazos">Brazos</option><option value="Espalda">Espalda</option><option value="Piernas">Piernas</option><option value="Abdominales">Abdominales</option><option value="Todo el cuerpo">Todo el cuerpo</option></Select></FormControl>
            <FormControl isRequired><FormLabel>Dificultad</FormLabel><Select placeholder="Seleccione la dificultad" value={dificultad} onChange={(e) => setDificultad(e.target.value)}><option value="principiante">Principiante</option><option value="intermedio">Intermedio</option><option value="avanzado">Avanzado</option></Select></FormControl>

            <FormControl>
              <FormLabel>Equipamiento Necesario</FormLabel>
              <VStack align="stretch" spacing={3}>
                {equipamiento.map((itemSeleccionado, index) => {
                  const opcionesDisponibles = todasLasOpciones.filter(
                    op => !equipamiento.includes(op) || op === itemSeleccionado
                  );

                  return (
                    <HStack key={index}>
                      <Select
                        placeholder="Seleccione equipamiento"
                        value={itemSeleccionado}
                        onChange={(e) => handleEquipamientoChange(index, e.target.value)}
                      >
                        {opcionesDisponibles.map(opcion => (
                          <option key={opcion} value={opcion}>{opcion}</option>
                        ))}
                      </Select>
                      <IconButton
                        aria-label="Eliminar equipamiento"
                        icon={<DeleteIcon />}
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => handleRemoveEquipamiento(index)}
                      />
                    </HStack>
                  );
                })}
              </VStack>
              <Button
                leftIcon={<AddIcon />}
                mt={3}
                size="sm"
                variant="outline"
                colorScheme="green"
                onClick={handleAddEquipamiento}
                isDisabled={equipamiento.filter(Boolean).length >= todasLasOpciones.length}
              >
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