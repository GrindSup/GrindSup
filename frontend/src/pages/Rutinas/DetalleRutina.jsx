import { useEffect, useMemo, useState } from "react";
import {
  Box, Heading, Text, Table, Thead, Tbody, Tr, Th, Td,
  HStack, Spinner, Button, useToast, Tag, VStack, Center
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import BotonVolver from "../../components/BotonVolver";
import rutinasService from "../../services/rutinas.servicio"; 

export default function DetalleRutina() {
  const params = useParams();
  const toast = useToast();
  const navigate = useNavigate();

  const idPlan = params.idPlan; 
  const idRutina = params.idRutina ?? params.id; 

  const [loading, setLoading] = useState(true);
  const [rutina, setRutina] = useState(null);
  const [ejercicios, setEjercicios] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true); 
        const detalle = await rutinasService.obtenerDetalleRutina(idPlan, idRutina);

        if (detalle === null) {
          throw new Error("No se pudo encontrar la rutina (Error 404 o 500)");
        }

        const r =
          detalle?.rutina ?? 
          (Array.isArray(detalle) ? null : detalle); 

        const items =
          Array.isArray(detalle?.ejercicios) 
            ? detalle.ejercicios
            : Array.isArray(detalle) 
              ? detalle
              : Array.isArray(r?.ejercicios)
                ? r.ejercicios
                : []; 

        setRutina({
          id_rutina: r?.id_rutina ?? r?.id ?? Number(idRutina),
          nombre: r?.nombre ?? `Rutina N°${idRutina}`,
          descripcion: r?.descripcion ?? "",
        });
        
        setEjercicios(items);
        
      } catch (e) {
        console.error(e);
        toast({
          title: "Error al cargar detalle de rutina",
          description: e.message, 
          status: "error"
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [idPlan, idRutina, toast]); 

  const goToEdit = () => {
    if (idPlan) {
      navigate(`/planes/${idPlan}/rutinas/${idRutina}/editar`);
    } else {
      navigate(`/rutinas/${idRutina}/editar`);
    }
  };

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
          <Heading size="lg" color="white">{rutina?.nombre || `Rutina #${idRutina}`}</Heading>
        </HStack>

        <HStack>
          <Button
            size="sm"
            onClick={goToEdit} 
            bg="#258d19" 
            color="white"
          >
            Editar Rutina
          </Button>
        </HStack>
      </HStack>

      {!!rutina?.descripcion && (
        <Text mb={4} color="white" fontWeight="bold">{rutina.descripcion}</Text>
      )}

      <Box bg="white" p={4} borderRadius="lg" boxShadow="md">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Grupo Muscular</Th>
              <Th>Ejercicio</Th>
              <Th isNumeric>Series</Th>
              <Th isNumeric>Reps</Th>
              <Th>Observaciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {ejercicios.map((re, idx) => {
              
              const grupos = [
                ...(re?.ejercicio?.grupoMuscularPrincipal || []),
                ...(re?.ejercicio?.grupoMuscularSecundario || [])
              ];
              
              const textoGrupos = grupos.length > 0 
                ? grupos.join(", ") 
                : (re?.grupo_muscular || "-");

              return (
                <Tr key={re.id_rutina_ejercicio ?? `${idx}-${re?.ejercicio?.id_ejercicio ?? re?.id_ejercicio ?? ""}`}>
                  <Td>{textoGrupos}</Td>
                  <Td>{(re?.ejercicio?.nombre ?? re?.nombre) || `#${re?.ejercicio?.id_ejercicio ?? re?.id_ejercicio ?? ""}`}</Td>
                  <Td isNumeric>{re.series ?? "-"}</Td>
                  <Td isNumeric>{re.repeticiones ?? "-"}</Td>
                  <Td>{re.observaciones}</Td>
                </Tr>
              );
            })}
            
            {ejercicios.length === 0 && (
              <Tr>
                <Td colSpan={5}> 
                  <Center py={4}>
                    <VStack spacing={1}>
                      <Text>No hay ejercicios cargados.</Text>
                      <Text fontSize="sm" color="gray.500">
                        Puedes agregar ejercicios usando el botón "Editar Rutina".
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