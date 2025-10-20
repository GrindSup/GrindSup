// frontend/src/pages/Rutinas/NuevaRutina.jsx
import { useEffect, useState } from "react";
import {
  Box, Button, Heading, FormControl, FormLabel, Input, Textarea,
  VStack, HStack, Select, NumberInput, NumberInputField, IconButton,
  useToast, Text, Divider, Tag, TagLabel, Alert, AlertIcon, Skeleton
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { useNavigate, useParams } from "react-router-dom";

import { ejerciciosService } from "../../services/ejercicios.servicio";
import { rutinasService } from "../../services/rutinas.servicio";
import { planesService } from "../../services/planes.servicio";
import axiosInstance from "../../config/axios.config";
import { ensureEntrenadorId } from "../../context/auth";
import BotonVolver from "../../components/BotonVolver";

export default function NuevaRutina() {
  const { idPlan } = useParams();
  const toast = useToast();
  const navigate = useNavigate();

  // form
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

  // catálogos
  const [catalogoEj, setCatalogoEj] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [planSel, setPlanSel] = useState(idPlan || "");

  // resumen de plan (cuando vengo con :idPlan)
  const [planInfo, setPlanInfo] = useState(null);

  const [items, setItems] = useState([
    { idEjercicio: "", series: 3, repeticiones: 10, descansoSegundos: 60 },
  ]);

  const [loadingInit, setLoadingInit] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoadingInit(true);
        setLoadError("");

        // 1) ejercicios
        let ejercicios = [];
        try {
          ejercicios = await ejerciciosService.getAll(); // GET /api/ejercicios
        } catch {
          // fallback ultra básico por si usan otro nombre de endpoint
          const r = await axiosInstance.get("/api/ejercicios");
          ejercicios = r.data;
        }
        setCatalogoEj(Array.isArray(ejercicios) ? ejercicios : []);

        // 2) planes
        if (idPlan) {
          // vengo con un plan → traigo el detalle para mostrar resumen (o al menos el objeto)
          try {
            const p = await planesService.getById(idPlan);
            setPlanInfo(p || null);
          } catch {
            // si no hay /api/planes/:id, no rompo
            setPlanInfo(null);
          }
          setPlanSel(String(idPlan));
          setPlanes([]); // no necesito listado
        } else {
          // no viene id → listar planes del ENTRENADOR
          const idEnt = await ensureEntrenadorId();
          let data = [];
          // a) /entrenadores/{id}/planes
          try {
            const r = await axiosInstance.get(`/api/entrenadores/${idEnt}/planes`);
            data = r.data;
          } catch {
            // b) /planes?entrenadorId=...
            try {
              const r2 = await axiosInstance.get(`/api/planes`, {
                params: { entrenadorId: idEnt },
              });
              data = r2.data;
            } catch {
              // c) /planes (sin filtro) – último recurso
              const r3 = await axiosInstance.get(`/api/planes`);
              data = r3.data;
            }
          }
          setPlanes(Array.isArray(data) ? data : []);
          if (!planSel && Array.isArray(data) && data.length) {
            setPlanSel(String(data[0].id_plan ?? data[0].id));
          }
        }
      } catch (e) {
        setLoadError("No se pudieron cargar datos iniciales.");
      } finally {
        setLoadingInit(false);
      }
    })();
  }, [idPlan]); // eslint-disable-line react-hooks/exhaustive-deps

  // helpers UI
  const addItem = () =>
    setItems((prev) => [...prev, { idEjercicio: "", series: 3, repeticiones: 10, descansoSegundos: 60 }]);

  const removeItem = (i) =>
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i)));

  const changeItem = (i, field, value) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, [field]: value } : it)));

  // save
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
      await rutinasService.crear(planIdFinal, payload); // POST /api/planes/{idPlan}/rutinas
      toast({ title: "Rutina creada", status: "success" });
      navigate(`/planes/${planIdFinal}`); // volvemos al detalle del plan (donde listás rutinas)
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.mensaje ||
        "No se pudo crear la rutina.";
      toast({ title: "Error", description: msg, status: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <HStack mb={4}>
        <BotonVolver />
        <Heading size="lg">Nueva rutina</Heading>
      </HStack>

      {loadError && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {loadError}
        </Alert>
      )}

      <VStack align="stretch" spacing={4} bg="white" p={5} borderRadius="md">
        {/* Resumen del plan si vengo con :idPlan */}
        {!!idPlan && (
          <Skeleton isLoaded={!loadingInit}>
            <HStack spacing={3} flexWrap="wrap" mb={1}>
              <Tag colorScheme="green" borderRadius="full">
                <TagLabel>Plan #{idPlan}</TagLabel>
              </Tag>
              {planInfo?.alumno && (
                <Tag colorScheme="gray" borderRadius="full">
                  <TagLabel>
                    Alumno:{" "}
                    {[
                      planInfo.alumno?.nombre,
                      planInfo.alumno?.apellido,
                    ]
                      .filter(Boolean)
                      .join(" ") || `#${planInfo.alumno?.id_alumno ?? ""}`}
                  </TagLabel>
                </Tag>
              )}
              {!!planInfo?.fecha_inicio && (
                <Tag colorScheme="teal" borderRadius="full">
                  <TagLabel>Inicio: {planInfo.fecha_inicio}</TagLabel>
                </Tag>
              )}
              {!!planInfo?.fecha_fin && (
                <Tag colorScheme="purple" borderRadius="full">
                  <TagLabel>Fin: {planInfo.fecha_fin}</TagLabel>
                </Tag>
              )}
            </HStack>
            {!!planInfo?.objetivo && (
              <Text color="gray.600" mb={2}>
                <b>Objetivo:</b> {planInfo.objetivo}
              </Text>
            )}
          </Skeleton>
        )}

        {/* Selector de Plan (si NO vino por URL) */}
        {!idPlan && (
          <FormControl isRequired isDisabled={loadingInit}>
            <FormLabel>Plan</FormLabel>
            <Select
              value={planSel}
              onChange={(e) => setPlanSel(e.target.value)}
              placeholder={loadingInit ? "Cargando planes..." : "Seleccioná un plan…"}
              bg="white"
            >
              {planes.map((p) => {
                const id = p.id_plan ?? p.id;
                const alumnoNombre = [
                  p?.alumno?.nombre,
                  p?.alumno?.apellido,
                ]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <option key={id} value={id}>
                    {`#${id} — ${alumnoNombre || "Alumno"} — ${(
                      p?.objetivo || "Sin objetivo"
                    ).slice(0, 50)}`}
                  </option>
                );
              })}
            </Select>
          </FormControl>
        )}

        <FormControl isRequired>
          <FormLabel>Nombre</FormLabel>
          <Input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Fuerza tren superior"
          />
        </FormControl>

        <FormControl>
          <FormLabel>Descripción</FormLabel>
          <Textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Notas o instrucciones generales…"
          />
        </FormControl>

        <Divider />

        <Heading size="md">Ejercicios</Heading>

        {items.map((it, i) => (
          <HStack key={i} align="flex-end" spacing={3}>
            <FormControl isRequired>
              <FormLabel>Ejercicio</FormLabel>
              <Select
                placeholder={loadingInit ? "Cargando..." : "Seleccioná…"}
                value={it.idEjercicio}
                onChange={(e) => changeItem(i, "idEjercicio", e.target.value)}
                bg="white"
                isDisabled={loadingInit}
              >
                {catalogoEj.map((e) => (
                  <option key={e.id_ejercicio ?? e.id} value={e.id_ejercicio ?? e.id}>
                    {e.nombre}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Series</FormLabel>
              <NumberInput
                min={1}
                value={it.series}
                onChange={(_, v) => changeItem(i, "series", v)}
              >
                <NumberInputField />
              </NumberInput>
            </FormControl>

            <FormControl>
              <FormLabel>Reps</FormLabel>
              <NumberInput
                min={1}
                value={it.repeticiones}
                onChange={(_, v) => changeItem(i, "repeticiones", v)}
              >
                <NumberInputField />
              </NumberInput>
            </FormControl>

            <FormControl>
              <FormLabel>Descanso (seg)</FormLabel>
              <NumberInput
                min={0}
                value={it.descansoSegundos}
                onChange={(_, v) => changeItem(i, "descansoSegundos", v)}
              >
                <NumberInputField />
              </NumberInput>
            </FormControl>

            <IconButton
              aria-label="Eliminar"
              icon={<DeleteIcon />}
              onClick={() => removeItem(i)}
              mt={1}
              bg="#0f4d11ff"
              color="white"
            />
          </HStack>
        ))}

        <HStack>
          <Button leftIcon={<AddIcon />} onClick={addItem} bg="#0f4d11ff" color="white">
            Agregar ejercicio
          </Button>
          <Text color="gray.500" fontSize="sm">Podés agregar varios bloques.</Text>
        </HStack>

        <HStack justify="flex-end" pt={2}>
          <Button variant="ghost" onClick={() => navigate(-1)}>Cancelar</Button>
          <Button
            colorScheme="green"
            onClick={handleSave}
            isLoading={saving}
            bg="#0f4d11ff"
          >
            Guardar rutina
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
