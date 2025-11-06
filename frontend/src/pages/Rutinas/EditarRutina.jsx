// frontend/src/pages/Rutinas/EditarRutina.jsx
import { useEffect, useState } from "react";
import {
  Box, Button, Heading, FormControl, FormLabel, Input, Textarea,
  VStack, HStack, Select, NumberInput, NumberInputField, IconButton,
  useToast, Text, Divider
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { useNavigate, useParams } from "react-router-dom";
import { ejerciciosService } from "../../services/ejercicios.servicio";
import BotonVolver from "../../components/BotonVolver";
import rutinasService from "../../services/rutinas.servicio";

export default function EditarRutina() {
  // const { idPlan, idRutina } = useParams(); // <-- LÍNEA ANTIGUA
  const params = useParams(); // <-- CAMBIO 1: Obtener TODOS los parámetros
  const toast = useToast();
  const navigate = useNavigate();

  // ----- ¡SOLUCIÓN 1: Leer bien los params! -----
  const idPlan = params.idPlan; // (Será 'undefined' en la ruta corta)
  const idRutina = params.idRutina ?? params.id; // (Acepta 'idRutina' O 'id')
  // ---------------------------------------------

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [catalogo, setCatalogo] = useState([]);

  const [items, setItems] = useState([
    { idEjercicio: "", series: 3, repeticiones: 10, descansoSegundos: 60 },
  ]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const ex = await ejerciciosService.getAll();
        setCatalogo(Array.isArray(ex) ? ex : []);

        // Ahora esto se llama como (undefined, "ID_RUTINA") para rutinas sin plan
        const det = await rutinasService.obtenerDetalleRutina(idPlan, idRutina);
        
        // Esta lógica de abajo ya soporta 'det' como la rutina o anidado
        const r = det?.rutina ?? (typeof det === "object" ? det : null);
        const ejs = det?.ejercicios ?? (Array.isArray(det) ? det : []);

        if (r) {
          setNombre(r.nombre ?? "");
          setDescripcion(r.descripcion ?? "");
        }
        if (Array.isArray(ejs) && ejs.length > 0) {
          setItems(ejs.map(e => ({
            // Soporta datos planos (e.id_ejercicio) y anidados (e.ejercicio.id_ejercicio)
            idEjercicio: e?.ejercicio?.id_ejercicio ?? e?.ejercicio?.id ?? e?.id_ejercicio ?? e?.id ?? "",
            series: e.series ?? 3,
            repeticiones: e.repeticiones ?? 10,
            descansoSegundos: e.descanso_segundos ?? e.descansoSegundos ?? 60,
          })));
        }
      } catch {
        toast({ title: "No se pudo cargar la rutina", status: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, [idPlan, idRutina, toast]); // El array de dependencias está bien

  const addItem = () =>
    setItems((prev) => [...prev, { idEjercicio: "", series: 3, repeticiones: 10, descansoSegundos: 60 }]);

  const removeItem = (i) =>
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i)));

  const changeItem = (i, field, value) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, [field]: value } : it)));

  const handleSave = async () => {
    if (!nombre.trim()) {
      toast({ title: "El nombre es obligatorio", status: "warning" });
      return;
    }
    const ejercicios = items
      .filter((x) => x.idEjercicio)
      .map((x) => ({
        idEjercicio: Number(x.idEjercicio),
        series: Number(x.series),
        repeticiones: Number(x.repeticiones),
        descansoSegundos: Number(x.descansoSegundos),
      }));

    const payload = { nombre, descripcion, ejercicios };

    try {
      setSaving(true);
      // La función 'update' del servicio ya maneja bien el idPlan (lo ignora)
      await rutinasService.update(idPlan, idRutina, payload);
      toast({ title: "Rutina actualizada", status: "success" });

      // ----- ¡SOLUCIÓN 2: Navegación condicional! -----
      if (idPlan) {
        navigate(`/planes/${idPlan}`); // Ir al plan si existe
      } else {
        navigate('/rutinas'); // Ir a la lista de rutinas si no hay plan
      }
      // ------------------------------------------------

    } catch (e) {
      const msg = e?.response?.data?.message || "No se pudo actualizar la rutina.";
      toast({ title: "Error", description: msg, status: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    // ... (Todo el JSX de 'return' es idéntico y no necesita cambios)
    <Box opacity={loading ? .6 : 1}>
      <HStack mb={4}><BotonVolver /><Heading size="lg" color="white">Editar rutina</Heading></HStack>

      <VStack align="stretch" spacing={4} bg="white" p={5} borderRadius="md">
        <FormControl isRequired>
          <FormLabel>Nombre</FormLabel>
          <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </FormControl>

        <FormControl>
          <FormLabel>Descripción</FormLabel>
          <Textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        </FormControl>

        <Divider />

        <Heading size="md">Ejercicios</Heading>
        {items.map((it, i) => (
          <HStack key={i} align="flex-end" spacing={3}>
            <FormControl isRequired>
              <FormLabel>Ejercicio</FormLabel>
              <Select
                placeholder="Seleccioná…"
                value={it.idEjercicio}
                onChange={(e) => changeItem(i, "idEjercicio", e.target.value)}
                bg="white"
              >
                {catalogo.map((e) => (
                  <option key={e.id_ejercicio ?? e.id} value={e.id_ejercicio ?? e.id}>
                    {e.nombre}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Series</FormLabel>
              <NumberInput min={1} value={it.series} onChange={(_, v) => changeItem(i, "series", v)}>
                <NumberInputField />
              </NumberInput>
            </FormControl>

            <FormControl>
              <FormLabel>Reps</FormLabel>
              <NumberInput min={1} value={it.repeticiones} onChange={(_, v) => changeItem(i, "repeticiones", v)}>
                <NumberInputField />
              </NumberInput>
            </FormControl>

            <FormControl>
              <FormLabel>Descanso (min)</FormLabel>
              <NumberInput min={0} value={it.descansoSegundos} onChange={(_, v) => changeItem(i, "descansoSegundos", v)}>
                <NumberInputField />
              </NumberInput>
            </FormControl>

            <IconButton aria-label="Eliminar" icon={<DeleteIcon />} onClick={() => removeItem(i)} mt={1} bg="#258d19" color="white" />
          </HStack>
        ))}

        <HStack>
          <Button leftIcon={<AddIcon />} onClick={addItem} bg="#258d19" color="white">Agregar ejercicio</Button>
          <Text color="gray.500" fontSize="sm">Podés agregar varios bloques.</Text>
        </HStack>

        <HStack justify="flex-end" pt={2}>
          <Button variant="ghost" onClick={() => navigate(-1)}>Cancelar</Button> {/* Corregido: history.back() no existe en react-router-dom v6 */}
          <Button colorScheme="green" onClick={handleSave} isLoading={saving} bg="#258d19">
            Guardar cambios
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}