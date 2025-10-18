// frontend/src/pages/Rutinas/NuevaRutina.jsx
import { useEffect, useState } from "react";
import {
  Box, Button, Heading, FormControl, FormLabel, Input, Textarea,
  VStack, HStack, Select, NumberInput, NumberInputField, IconButton,
  useToast, Text, Divider
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { useNavigate, useParams } from "react-router-dom";
import { ejerciciosService } from "../../services/ejercicios.servicio";
import { rutinasService } from "../../services/rutinas.servicio";
import { planesService } from "../../services/planes.servicio";
import BotonVolver from "../../components/BotonVolver";

export default function NuevaRutina() {
  const { idPlan } = useParams();
  const toast = useToast();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [catalogo, setCatalogo] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [planSel, setPlanSel] = useState(idPlan || "");

  const [items, setItems] = useState([
    { idEjercicio: "", series: 3, repeticiones: 10, descansoSegundos: 60 },
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [ex, ps] = await Promise.all([
          ejerciciosService.getAll(),
          planesService.listAll(),
        ]);
        setCatalogo(Array.isArray(ex) ? ex : []);
        setPlanes(Array.isArray(ps) ? ps : []);
        // autoselección si no vino en URL
        if (!idPlan && ps.length) setPlanSel(ps[0].id_plan ?? ps[0].id);
      } catch {
        toast({ title: "No se pudieron cargar datos", status: "error" });
      }
    })();
  }, [idPlan, toast]);

  const addItem = () =>
    setItems((prev) => [...prev, { idEjercicio: "", series: 3, repeticiones: 10, descansoSegundos: 60 }]);

  const removeItem = (i) =>
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i)));

  const changeItem = (i, field, value) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, [field]: value } : it)));

  const handleSave = async () => {
    const planIdFinal = idPlan || planSel;
    if (!planIdFinal) {
      toast({ title: "Seleccioná un plan", status: "warning" });
      return;
    }
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
      await rutinasService.crear(planIdFinal, payload);
      toast({ title: "Rutina creada", status: "success" });
      navigate(`/planes/${planIdFinal}/rutinas`);
    } catch (e) {
      const msg = e?.response?.data?.message || "No se pudo crear la rutina.";
      toast({ title: "Error", description: msg, status: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <HStack mb={4}><BotonVolver /><Heading size="lg">Nueva rutina</Heading></HStack>

      <VStack align="stretch" spacing={4} bg="white" p={5} borderRadius="md">
        {/* Selector de Plan (si no vino por URL) */}
        {!idPlan && (
          <FormControl isRequired>
            <FormLabel>Plan</FormLabel>
            <Select value={planSel} onChange={(e) => setPlanSel(e.target.value)} bg="white">
              <option value="" disabled>Seleccioná un plan…</option>
              {planes.map(p => (
                <option key={p.id_plan ?? p.id} value={p.id_plan ?? p.id}>
                  {`#${p.id_plan ?? p.id} — ${(p.objetivo ?? "Sin objetivo").slice(0, 50)}`}
                </option>
              ))}
            </Select>
          </FormControl>
        )}

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
              <FormLabel>Descanso (seg)</FormLabel>
              <NumberInput min={0} value={it.descansoSegundos} onChange={(_, v) => changeItem(i, "descansoSegundos", v)}>
                <NumberInputField />
              </NumberInput>
            </FormControl>

            <IconButton aria-label="Eliminar" icon={<DeleteIcon />} onClick={() => removeItem(i)} mt={1} />
          </HStack>
        ))}

        <HStack>
          <Button leftIcon={<AddIcon />} onClick={addItem}>Agregar ejercicio</Button>
          <Text color="gray.500" fontSize="sm">Podés agregar varios bloques.</Text>
        </HStack>

        <HStack justify="flex-end" pt={2}>
          <Button variant="ghost" onClick={() => history.back()}>Cancelar</Button>
          <Button colorScheme="green" onClick={handleSave} isLoading={saving} bg="#0f4d11ff">
            Guardar rutina
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
