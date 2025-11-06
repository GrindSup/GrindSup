// src/pages/Rutinas/DetalleRutina.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Box, Heading, Text, Table, Thead, Tbody, Tr, Th, Td,
  HStack, Spinner, Button, useToast, Tag, VStack, Center
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import BotonVolver from "../../components/BotonVolver";
import rutinasService from "../../services/rutinas.servicio"; // Importación 'default' correcta

// --- Helpers (sin cambios) ---
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
  const params = useParams();
  const toast = useToast();
  const navigate = useNavigate();

  // IDs extraídos manualmente para soportar ambas rutas
  const idPlan = params.idPlan; // (Será 'undefined' en la ruta corta)
  const idRutina = params.idRutina ?? params.id; // (Acepta 'idRutina' O 'id')

  const [loading, setLoading] = useState(true);
  const [rutina, setRutina] = useState(null);
  const [ejercicios, setEjercicios] = useState([]);

  // --- useEffect CORREGIDO ---
  useEffect(() => {
    (async () => {
      try {
        setLoading(true); 
        
        // Usamos el servicio importado (rutinasService) y su método
        const detalle = await rutinasService.obtenerDetalleRutina(idPlan, idRutina);

        if (detalle === null) {
          throw new Error("No se pudo encontrar la rutina (Error 404 o 500)");
        }

        // 1. Obtener la información de la rutina (cabecera)
        const r =
          detalle?.rutina ?? // Si existe 'detalle.rutina', la usamos
          (Array.isArray(detalle) ? null : detalle); // Si 'detalle' es un objeto, lo usamos

        // 2. Obtener la lista de ejercicios (¡LA CORRECCIÓN!)
        const items =
          Array.isArray(detalle?.ejercicios) // <-- Primero buscamos 'detalle.ejercicios'
            ? detalle.ejercicios
            : Array.isArray(detalle) // <-- Si no, vemos si 'detalle' es el array en sí
              ? detalle
              : Array.isArray(r?.ejercicios) // <-- Como último fallback, buscamos en 'r.ejercicios'
                ? r.ejercicios
                : []; 

        // Normalizamos la cabecera
        setRutina({
          id_rutina: r?.id_rutina ?? r?.id ?? Number(idRutina),
          nombre: r?.nombre ?? `Rutina #${idRutina}`,
          descripcion: r?.descripcion ?? "",
        });
        
        // Seteamos los ejercicios encontrados
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
  }, [idPlan, idRutina, toast]); // El array de dependencias es correcto

  const totalSecs = useMemo(() => calcDurationSecs(ejercicios), [ejercicios]);

  const goToEdit = () => {
    if (idPlan) {
      // Ruta de edición CON plan
      navigate(`/planes/${idPlan}/rutinas/${idRutina}/editar`);
    } else {
      // Ruta de edición SIN plan
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
        {/* Sección Izquierda: Volver y Título */}
        <HStack gap={3}>
          <BotonVolver />
          <Heading size="lg" color="white">{rutina?.nombre || `Rutina #${idRutina}`}</Heading>
        </HStack>

        {/* Sección Derecha: Duración y Botón Editar */}
        <HStack>
          <Tag colorScheme="teal">Duración estimada: {humanizeSecs(totalSecs)}</Tag>
          
          {/* --- ¡AQUÍ ESTÁ EL BOTÓN MOVido! --- */}
          <Button
            size="sm"
            onClick={goToEdit} // Usa la función helper
            bg="#258d19" // Color del tema
            color="white"
          >
            Editar Rutina
          </Button>
        </HStack>
      </HStack>

      {/* Descripción (sin cambios) */}
      {!!rutina?.descripcion && (
        <Text mb={4} color="white" fontWeight="bold">{rutina.descripcion}</Text>
      )}

      {/* Tabla (con el estado vacío modificado) */}
      <Box bg="white" p={4} borderRadius="lg" boxShadow="md">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Grupo Muscular</Th>
              <Th>Ejercicio</Th>
              <Th isNumeric>Series</Th>
              <Th isNumeric>Reps</Th>
              <Th isNumeric>Descanso (min)</Th>
            </Tr>
          </Thead>
          <Tbody>
            {ejercicios.map((re, idx) => (
              <Tr key={re.id_rutina_ejercicio ?? `${idx}-${re?.ejercicio?.id_ejercicio ?? re?.id_ejercicio ?? ""}`}>
                <Td>{(re?.ejercicio?.gruposMusculares ?? re?.gruposMusculares)?.join(", ") || "-"}</Td>
                <Td>{(re?.ejercicio?.nombre ?? re?.nombre) || `#${re?.ejercicio?.id_ejercicio ?? re?.id_ejercicio ?? ""}`}</Td>
                <Td isNumeric>{re.series ?? "-"}</Td>
                <Td isNumeric>{re.repeticiones ?? "-"}</Td>
                <Td isNumeric>{re.descanso_segundos ?? re.descansoSegundos ?? "-"}</Td>
              </Tr>
            ))}
            
            {/* --- ESTADO VACÍO (AHORA SIN BOTÓN) --- */}
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