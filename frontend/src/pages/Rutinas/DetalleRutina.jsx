import { useEffect, useState } from "react";
import {
  Box, Heading, Text, Stack, Tag, Table, Thead, Tbody, Tr, Th, Td,
  HStack, Spinner, useToast
} from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { rutinasService } from "../../services/rutinas.servicio";
import BotonVolver from "../../components/BotonVolver.jsx";

export default function DetalleRutina() {
  const { idPlan, idRutina } = useParams();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [rutina, setRutina] = useState(null);
  const [ejercicios, setEjercicios] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await rutinasService.detalle(idPlan, idRutina);
        setRutina(data?.rutina || null);
        setEjercicios(Array.isArray(data?.ejercicios) ? data.ejercicios : []);
      } catch {
        toast({ title: "No se pudo obtener el detalle", status: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, [idPlan, idRutina, toast]);

  if (loading) return <HStack><Spinner /><Text>Cargando...</Text></HStack>;

  return (
    <Box>
      <HStack mb={4}><BotonVolver /><Heading size="lg">Rutina: {rutina?.nombre}</Heading></HStack>
      <Stack spacing={2} mb={4}>
        <Text color="gray.700">{rutina?.descripcion || "Sin descripción."}</Text>
        {rutina?.estado?.nombre && <Tag colorScheme="green" w="fit-content">{rutina.estado.nombre}</Tag>}
      </Stack>

      <Heading size="md" mb={2}>Ejercicios</Heading>
      <Table variant="simple" bg="white" borderRadius="md">
        <Thead>
          <Tr>
            <Th>Ejercicio</Th>
            <Th isNumeric>Series</Th>
            <Th isNumeric>Reps</Th>
            <Th isNumeric>Descanso (seg)</Th>
          </Tr>
        </Thead>
        <Tbody>
          {ejercicios.map((e) => (
            <Tr key={e.id_rutina_ejercicio ?? `${e?.ejercicio?.id_ejercicio}-${e?.id}`}>
              <Td>{e?.ejercicio?.nombre || "-"}</Td>
              <Td isNumeric>{e?.series ?? "-"}</Td>
              <Td isNumeric>{e?.repeticiones ?? "-"}</Td>
              <Td isNumeric>{e?.descanso_segundos ?? e?.descansoSegundos ?? "-"}</Td>
            </Tr>
          ))}
          {ejercicios.length === 0 && (
            <Tr><Td colSpan={4}><Text>No hay ejercicios en esta rutina.</Text></Td></Tr>
          )}
        </Tbody>
      </Table>
    </Box>
  );
}
