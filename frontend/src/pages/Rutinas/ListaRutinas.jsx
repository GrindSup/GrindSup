import { useEffect, useState } from "react";
import {
  Box, Button, Heading, Table, Thead, Tbody, Tr, Th, Td,
  HStack, Text, Spinner, useToast
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { listarRutinasPorPlan } from "../../services/rutinas.servicio";

export default function ListaRutinas() {
  const { idPlan } = useParams();
  const toast = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rutinas, setRutinas] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await listarRutinasPorPlan(idPlan);
        setRutinas(Array.isArray(data) ? data : []);
      } catch (e) {
        toast({ title: "Error al cargar rutinas", status: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, [idPlan, toast]);

  return (
    <Box>
      <HStack justify="space-between" mb={4}>
        <Heading size="lg">Rutinas del Plan #{idPlan}</Heading>
        <Button colorScheme="green" onClick={() => navigate(`/planes/${idPlan}/rutinas/nueva`)}>
          Nueva rutina
        </Button>
      </HStack>

      {loading ? (
        <HStack><Spinner /><Text>Cargando...</Text></HStack>
      ) : (
        <Table variant="simple" bg="white" borderRadius="md">
          <Thead>
            <Tr>
              <Th>Nombre</Th>
              <Th>Descripción</Th>
              <Th>Estado</Th>
              <Th isNumeric>Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {rutinas.map((r) => (
              <Tr key={r.id_rutina}>
                <Td>{r.nombre || "-"}</Td>
                <Td maxW="480px">
                  <Text noOfLines={2}>{r.descripcion || "-"}</Text>
                </Td>
                <Td>{r?.estado?.nombre || "-"}</Td>
                <Td isNumeric>
                  <Button size="sm" onClick={() => navigate(`/planes/${idPlan}/rutinas/${r.id_rutina}`)}>
                    Ver
                  </Button>
                </Td>
              </Tr>
            ))}
            {rutinas.length === 0 && (
              <Tr><Td colSpan={4}><Text>No hay rutinas aún.</Text></Td></Tr>
            )}
          </Tbody>
        </Table>
      )}
    </Box>
  );
}
