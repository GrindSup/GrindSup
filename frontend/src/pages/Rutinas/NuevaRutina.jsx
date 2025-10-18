import { useEffect, useMemo, useState } from "react";
import {
  Box, Button, Heading, VStack, HStack, FormControl, FormLabel, Input,
  Textarea, Select, NumberInput, NumberInputField, IconButton,
  useToast, Divider
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { useNavigate, useParams } from "react-router-dom";
import { crearRutina } from "../../services/rutinas.servicio";
import { listarEjercicios } from "../../services/ejercicios.servicio";

export default function NuevaRutina() {
  const { idPlan } = useParams();
  const toast = useToast();
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [ejerciciosCat, setEjerciciosCat] = useState([]);
  const [items, setItems] = useState([
    { idEjercicio: "", series: 3, repeticiones: 10, descansoSegundos: 60 },
  ]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await listarEjercicios();
        setEjerciciosCat(Array.isArray(data) ? data : []);
      } catch {
        toast({ title: "No se pudieron cargar los ejercicios", status: "error" });
      }
    })();
  }, [toast]);

  const canSave = useMemo(() => {
    const hasName = (nombre || "").trim().length > 0;
    const validRows = items.length > 0 && items.every(
      it => it.idEjercicio && it.series > 0 && it.repeticiones > 0 && it.descansoSegundos >= 0
    );
    return hasName && validRows;
  }, [nombre, items]);

  const addRow = () => setItems(prev => [...prev, { idEjercicio: "", series: 3, repeticiones: 10, descansoSegundos: 60 }]);
  const removeRow = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));
  const updateRow = (idx, patch) => setItems(prev => prev.map((r, i) => i === idx ? { ...r, ...patch } : r));

  const handleSubmit = async () => {
    if (!canSave) {
      toast({ title: "Completá nombre y al menos un ejercicio válido", status: "warning" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        nombre,
        descripcion,
        ejercicios: items.map(it => ({
          idEjercicio: Number(it.idEjercicio),
          series: Number(it.series),
          repeticiones: Number(it.repeticiones),
          descansoSegundos: Number(it.descansoSegundos),
        })),
      };
      await crearRutina(idPlan, payload);
      toast({ title: "Rutina creada", status: "success" });
      navigate(`/planes/${idPlan}/rutinas`);
    } catch (e) {
      toast({ title: "Error al crear rutina", description: e?.response?.data || "", status: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Heading size="lg" mb={4}>Nueva Rutina · Plan #{idPlan}</Heading>
      <VStack align="stretch" spacing={4} bg="white" p={5} borderRadius="md">
        <FormControl isRequired>
          <FormLabel>Nombre</FormLabel>
          <Input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej. Espalda + Bíceps" />
        </FormControl>

        <FormControl>
          <FormLabel>Descripción</FormLabel>
          <Textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} />
        </FormControl>

        <Divider />

        <Heading size="md">Ejercicios</Heading>

        {items.map((it, idx) => (
          <HStack key={idx} align="flex-end" gap={3}>
            <FormControl isRequired>
              <FormLabel>Ejercicio</FormLabel>
              <Select
                placeholder="Seleccionar ejercicio"
                value={it.idEjercicio}
                onChange={(e) => updateRow(idx, { idEjercicio: e.target.value })}
              >
                {ejerciciosCat.map((ej) => (
                  <option key={ej.id_ejercicio} value={ej.id_ejercicio}>
                    {ej.nombre}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Series</FormLabel>
              <NumberInput min={1} value={it.series} onChange={(_, v) => updateRow(idx, { series: v || 0 })}>
                <NumberInputField />
              </NumberInput>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Repeticiones</FormLabel>
              <NumberInput min={1} value={it.repeticiones} onChange={(_, v) => updateRow(idx, { repeticiones: v || 0 })}>
                <NumberInputField />
              </NumberInput>
            </FormControl>

            <FormControl>
              <FormLabel>Descanso (seg)</FormLabel>
              <NumberInput min={0} value={it.descansoSegundos} onChange={(_, v) => updateRow(idx, { descansoSegundos: v || 0 })}>
                <NumberInputField />
              </NumberInput>
            </FormControl>

            <IconButton
              aria-label="Quitar"
              icon={<DeleteIcon />}
              onClick={() => removeRow(idx)}
              variant="outline"
            />
          </HStack>
        ))}

        <Button leftIcon={<AddIcon />} variant="outline" onClick={addRow}>
          Agregar ejercicio
        </Button>

        <HStack justify="flex-end">
          <Button onClick={() => navigate(-1)} variant="ghost">Cancelar</Button>
          <Button colorScheme="green" onClick={handleSubmit} isLoading={saving} isDisabled={!canSave}>
            Guardar rutina
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
