import { useEffect, useMemo, useState } from "react";
import {
  Box, Button, Container, Heading, HStack, VStack, Input, Select,
  Table, Thead, Tbody, Tr, Th, Td, Tag, Alert, AlertIcon, Text
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { listarTurnos } from "/src/services/turnos.servicio.js";

function fullName(a = {}) {
  return `${a.nombre ?? ""} ${a.apellido ?? ""}`.trim();
}

export default function ListaTurnos() {
  const navigate = useNavigate();
  const [turnos, setTurnos] = useState([]);
  const [error, setError] = useState("");

  // filtros
  const [desde, setDesde] = useState(() => new Date().toISOString().slice(0, 10)); // hoy
  const [hasta, setHasta] = useState("");
  const [tipo, setTipo] = useState(""); // "grupal"/"individual" o vacío

  useEffect(() => {
    (async () => {
      try {
        const { data } = await listarTurnos();
        setTurnos(data || []);
      } catch (e) {
        console.error(e);
        setError("No se pudieron cargar los turnos");
      }
    })();
  }, []);

  const filtrados = useMemo(() => {
    const hoy0000 = new Date();
    hoy0000.setHours(0, 0, 0, 0);

    return (turnos || [])
      // ocultar pasados
      .filter(t => new Date(t.fecha) >= hoy0000)
      // rango fecha
      .filter(t => !desde || new Date(t.fecha) >= new Date(`${desde}T00:00:00`))
      .filter(t => !hasta || new Date(t.fecha) <= new Date(`${hasta}T23:59:59`))
      // tipo
      .filter(t => !tipo || (t.tipo_turno || "").toLowerCase() === tipo)
      // opcional: ordenar por fecha asc
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  }, [turnos, desde, hasta, tipo]);

  return (
    <Container maxW="6xl" py={8}>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg" color="gray.900">Turnos</Heading>
        <HStack>
          <Button variant="solid" onClick={() => navigate("/turnos/calendario")} bg="#38A169" color="white">Calendario</Button>
          <Button colorScheme="brand" onClick={() => navigate("/turnos/registrar")} bg="#38A169" color="white">
            + Nuevo turno
          </Button>
        </HStack>
      </HStack>

      <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" mb={5}>
        <VStack align="stretch" spacing={3}>
          <HStack>
            <Box flex="1">
              <Text mb={1} fontSize="sm" color="gray.600">Desde</Text>
              <Input type="date" value={desde} onChange={e => setDesde(e.target.value)} />
            </Box>
            <Box flex="1">
              <Text mb={1} fontSize="sm" color="gray.600">Hasta</Text>
              <Input type="date" value={hasta} onChange={e => setHasta(e.target.value)} />
            </Box>
            <Box w="220px">
              <Text mb={1} fontSize="sm" color="gray.600">Tipo</Text>
              <Select placeholder="Todos" value={tipo} onChange={e => setTipo(e.target.value)}>
                <option value="individual">Individual</option>
                <option value="grupal">Grupal</option>
              </Select>
            </Box>
          </HStack>
        </VStack>
      </Box>

      {error && <Alert status="error" mb={4}><AlertIcon />{error}</Alert>}

      <Box borderWidth="1px" borderRadius="lg" overflowX="auto" bg="white">
        <Table size="md">
          <Thead>
            <Tr>
              <Th>Fecha</Th>
              <Th>Hora</Th>
              <Th>Tipo</Th>
              <Th>Entrenador</Th>
              <Th>Alumnos</Th>
              <Th isNumeric>Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filtrados.map(t => {
              const d = new Date(t.fecha);
              const fecha = d.toLocaleDateString();
              const hora = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

              // alumnos ahora son objetos: armamos texto amigable
              const alumnos = (t.alumnos || []);
              const primeros = alumnos.slice(0, 3).map(fullName).filter(Boolean).join(", ");
              const resto = alumnos.length > 3 ? `  +${alumnos.length - 3} más` : "";

              return (
                <Tr key={t.id_turno}>
                  <Td>{fecha}</Td>
                  <Td>{hora}</Td>
                  <Td>
                    <Tag colorScheme={(t.tipo_turno || "").toLowerCase() === "grupal" ? "purple" : "teal"}>
                      {t.tipo_turno}
                    </Tag>
                  </Td>
                  <Td>{t.entrenador}</Td>
                  <Td>{primeros}{resto}</Td>
                  <Td isNumeric>
                    <Button size="sm" onClick={() => navigate(`/turnos/${t.id_turno}`)}>
                      Editar
                    </Button>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>

        {filtrados.length === 0 && (
          <Box p={6}><Text color="gray.500">No hay turnos con los filtros seleccionados.</Text></Box>
        )}
      </Box>
    </Container>
  );
}
