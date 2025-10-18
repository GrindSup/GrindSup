import { useEffect, useState } from "react";
import {
  Box, Heading, Text, Table, Thead, Tbody, Tr, Th, Td,
  HStack, Spinner, Button, useToast
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { obtenerDetalleRutina } from "../../services/rutinas.servicio";

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
        const { data } = await obtenerDetalleRutina(idPlan, idRutina);
        setRutina(data?.rutina || null);
        setEjercicios(Array.isArray(data?.ejercicios) ? data.ejercicios : []);
      } catch {
        toast({ title: "Error al cargar detalle de rutina", status: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, [idPlan, idRutina, toast]);

  if (loading) return <HStack><Spinner /><Text>Cargando...</Text></HStack>;

  return (
    <Box>
      <HStack justify="space-between" mb={4}>
        <Heading size="lg">{rutina?.nombre || `Rutina #${idRutina}`}</Heading>
        <Button onClick={() => navigate(`/planes/${idPlan}/rutinas`)}>Volver</Button>
      </HStack>

      <Text mb={4}>{rutina?.descripcion || "-"}</Text>

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
          {ejercicios.map((re) => (
            <Tr key={re.id_rutina_ejercicio}>
              <Td>{re?.ejercicio?.nombre || `#${re?.ejercicio?.id_ejercicio}`}</Td>
              <Td isNumeric>{re.series ?? "-"}</Td>
              <Td isNumeric>{re.repeticiones ?? "-"}</Td>
              <Td isNumeric>{re.descanso_segundos ?? "-"}</Td>
            </Tr>
          ))}
          {ejercicios.length === 0 && (
            <Tr><Td colSpan={4}><Text>No hay ejercicios cargados.</Text></Td></Tr>
          )}
        </Tbody>
      </Table>
    </Box>
  );
}
