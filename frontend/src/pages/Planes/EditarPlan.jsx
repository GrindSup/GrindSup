// frontend/src/pages/Planes/EditarPlan.jsx
import { useEffect, useState } from "react";
import {
  Box, Button, Container, Heading, VStack, HStack,
  FormControl, FormLabel, Textarea, Input, useToast
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { planesService } from "../../services/planes.servicio";
import BotonVolver from "../../components/BotonVolver";

export default function EditarPlan() {
  const { idPlan } = useParams();
  const toast = useToast();
  const navigate = useNavigate();

  const [objetivo, setObjetivo] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const p = await planesService.getById(idPlan);
      if (p) {
        setObjetivo(p.objetivo ?? "");
        setFechaInicio((p.fecha_inicio ?? "").slice(0,10));
        setFechaFin((p.fecha_fin ?? "").slice(0,10));
      }
      setLoading(false);
    })();
  }, [idPlan]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (fechaFin && fechaFin < fechaInicio) {
      toast({ title: "La fecha fin no puede ser anterior a inicio.", status: "warning" });
      return;
    }
    try {
      setSaving(true);
      await planesService.update(idPlan, {
        objetivo: objetivo.trim(),
        fechaInicio: fechaInicio || null,
        fechaFin: fechaFin || null,
      });
      toast({ title: "Plan actualizado", status: "success" });
      navigate(`/planes/${idPlan}`);
    } catch (e) {
      const msg = e?.response?.data?.message || "No se pudo actualizar el plan.";
      toast({ title: "Error", description: msg, status: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <HStack mb={4} spacing={3}>
        <BotonVolver />
        <Heading size="lg" color="white">Editar plan N°{idPlan}</Heading>
      </HStack>

      <Box as="form" onSubmit={handleSave} bg="white" p={6} borderRadius="2xl" boxShadow="lg" opacity={loading ? .6 : 1}>
        <VStack align="stretch" spacing={5}>
          <FormControl>
            <FormLabel>Objetivo</FormLabel>
            <Textarea
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
              placeholder="Ej: Hipertrofia, bajar grasa, etc."
            />
          </FormControl>

          <HStack spacing={4}>
            <FormControl>
              <FormLabel>Fecha inicio</FormLabel>
              <Input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
            </FormControl>
            <FormControl>
              <FormLabel>Fecha fin</FormLabel>
              <Input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
            </FormControl>
          </HStack>

          <HStack justify="flex-end" pt={2}>
            <Button variant="ghost" onClick={() => navigate(-1)}>Cancelar</Button>
            <Button type="submit" isLoading={saving} bg="#258d19" color="white">
              Guardar cambios
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Container>
  );
}