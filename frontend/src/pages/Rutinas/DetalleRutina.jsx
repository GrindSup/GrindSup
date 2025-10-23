import { useEffect, useMemo, useState } from "react";
import {
  Box, Heading, Text, Table, Thead, Tbody, Tr, Th, Td,
  HStack, Spinner, Button, useToast, Tag, VStack, Center
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { obtenerDetalleRutina } from "../../services/rutinas.servicio";
import BotonVolver from "../../components/BotonVolver";

// estimación simple: 2s por rep + descanso
function calcDurationSecs(items) {
  if (!Array.isArray(items)) return 0;
  let total = 0;
  for (const it of items) {
    const series = Number(it.series ?? 0);
    const reps = Number(it.repeticiones ?? 0);
    const rest = Number(it.descanso_segundos ?? it.descansoSegundos ?? 0);
    total += series * (reps * 2 + rest);
  }
  return total;
}
function humanizeSecs(s) {
  if (!s || s <= 0) return "—";
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return `≈ ${h}h ${mm}m`;
  }
  return `≈ ${m}m ${r}s`;
}

export default function DetalleRutina() {
  const { idPlan, idRutina } = useParams();
  const toast = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [rutina, setRutina] = useState(null);
  const [ejercicios, setEjercicios] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        // 👇 OJO: obtenerDetalleRutina retorna el objeto directamente (NO { data })
        const detalle = await obtenerDetalleRutina(idPlan, idRutina);

        // Soportar varios formatos posibles
        const r =
          detalle?.rutina ??
          (typeof detalle === "object" ? detalle : null);

        const items =
          Array.isArray(detalle?.ejercicios)
            ? detalle.ejercicios
            : Array.isArray(detalle)
              ? detalle
              : [];

        // Normalizamos un poco la cabecera
        setRutina({
          id_rutina: r?.id_rutina ?? r?.id ?? Number(idRutina),
          nombre: r?.nombre ?? `Rutina #${idRutina}`,
          descripcion: r?.descripcion ?? "",
        });
        setEjercicios(items);
      } catch (e) {
        console.error(e);
        toast({ title: "Error al cargar detalle de rutina", status: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, [idPlan, idRutina, toast]);

  const totalSecs = useMemo(() => calcDurationSecs(ejercicios), [ejercicios]);

  if (loading) {
    return (
      <HStack>
        <Spinner />
        <Text>Cargando…</Text>
      </HStack>
    );
  }

  return (
    <Box>
      <HStack justify="space-between" mb={4} flexWrap="wrap" gap={3}>
        <HStack gap={3}>
          <BotonVolver />
          <Heading size="lg">{rutina?.nombre || `Rutina #${idRutina}`}</Heading>
        </HStack>

        <HStack>
          <Tag colorScheme="teal">Duración estimada: {humanizeSecs(totalSecs)}</Tag>
          <Button onClick={() => navigate(`/planes/${idPlan}/rutinas`)}>Volver</Button>
        </HStack>
      </HStack>

      {!!rutina?.descripcion && (
        <Text mb={4} color="gray.800">{rutina.descripcion}</Text>
      )}

      <Box bg="white" p={4} borderRadius="lg" boxShadow="md">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Grupo Muscular</Th>
              <Th>Ejercicio</Th>
              <Th isNumeric>Series</Th>
              <Th isNumeric>Reps</Th>
              <Th isNumeric>Descanso (seg)</Th>
            </Tr>
          </Thead>
          <Tbody>
            {ejercicios.map((re, idx) => (
              <Tr key={re.id_rutina_ejercicio ?? `${idx}-${re?.ejercicio?.id_ejercicio ?? ""}`}>
                <Td>{re?.ejercicio?.gruposMusculares?.join(", ") || "-"}</Td>
                <Td>{re?.ejercicio?.nombre || `#${re?.ejercicio?.id_ejercicio ?? ""}`}</Td>
                <Td isNumeric>{re.series ?? "-"}</Td>
                <Td isNumeric>{re.repeticiones ?? "-"}</Td>
                <Td isNumeric>{re.descanso_segundos ?? re.descansoSegundos ?? "-"}</Td>
              </Tr>
            ))}
            {ejercicios.length === 0 && (
              <Tr>
                <Td colSpan={4}>
                  <Center py={4}>
                    <VStack spacing={1}>
                      <Text>No hay ejercicios cargados.</Text>
                      <Text fontSize="sm" color="gray.500">
                        Volvé atrás y agregá ejercicios a esta rutina.
                      </Text>
                    </VStack>
                  </Center>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}
