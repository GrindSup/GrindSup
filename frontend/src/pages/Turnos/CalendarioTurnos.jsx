import { useEffect, useMemo, useState } from "react";
import {
  Box, Button, Container, Grid, GridItem, Heading, HStack, Text, Tag, VStack
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { listarTurnos } from "/src/services/turnos.servicio.js";

function daysInMonth(year, month){ // month 0..11
  return new Date(year, month+1, 0).getDate();
}
function firstWeekday(year, month){ // 0=Sun..6=Sat
  return new Date(year, month, 1).getDay();
}

export default function CalendarioTurnos() {
  const navigate = useNavigate();
  const [turnos, setTurnos] = useState([]);
  const [y, setY] = useState(new Date().getFullYear());
  const [m, setM] = useState(new Date().getMonth());

  useEffect(() => {
    (async () => {
      const { data } = await listarTurnos();
      setTurnos(data || []);
    })();
  }, []);

  const porDia = useMemo(() => {
    const map = new Map();
    (turnos||[]).forEach(t => {
      const d = new Date(t.fecha);
      const key = d.toISOString().slice(0,10); // YYYY-MM-DD
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(t);
    });
    return map;
  }, [turnos]);

  const dim = daysInMonth(y, m);
  const first = firstWeekday(y, m); // 0..6
  const monthName = new Date(y, m, 1).toLocaleString(undefined, {month:"long", year:"numeric"});

  const prevMonth = () => {
    const d = new Date(y, m, 1); d.setMonth(m-1);
    setY(d.getFullYear()); setM(d.getMonth());
  };
  const nextMonth = () => {
    const d = new Date(y, m, 1); d.setMonth(m+1);
    setY(d.getFullYear()); setM(d.getMonth());
  };

  return (
    <Container maxW="6xl" py={8}>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg" color="brand.600">Calendario de Turnos</Heading>
        <HStack>
          <Button onClick={prevMonth}>◀</Button>
          <Text w="220px" textAlign="center" fontWeight="semibold" textTransform="capitalize">
            {monthName}
          </Text>
          <Button onClick={nextMonth}>▶</Button>
          <Button variant="outline" onClick={()=>navigate("/turnos")}>Ver lista</Button>
          <Button colorScheme="brand" onClick={()=>navigate("/turnos/registrar")}>+ Nuevo turno</Button>
        </HStack>
      </HStack>

      <Grid templateColumns="repeat(7, 1fr)" gap={2} fontWeight="semibold" color="gray.600" mb={2}>
        {["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"].map(d => <Box key={d} textAlign="center">{d}</Box>)}
      </Grid>

      <Grid templateColumns="repeat(7, 1fr)" gap={2}>
        {Array.from({length:first}).map((_,i)=>(<GridItem key={`e-${i}`} />))}
        {Array.from({length:dim}).map((_,i)=>{
          const day = i+1;
          const date = new Date(y, m, day);
          const key = date.toISOString().slice(0,10);
          const items = porDia.get(key)||[];
          return (
            <GridItem key={day}>
              <Box borderWidth="1px" borderRadius="md" p={2} minH="110px" bg="white">
                <Text fontSize="sm" color="gray.500" mb={1}>{day}</Text>
                <VStack align="stretch" spacing={1}>
                  {items.slice(0,4).map(t=>{
                    const hhmm = new Date(t.fecha).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
                    const label = (t.tipo_turno||"").toLowerCase()==="grupal" ? "purple" : "teal";
                    return (
                      <Tag key={t.id_turno} size="sm" colorScheme={label} cursor="pointer"
                           onClick={()=>navigate(`/turnos/${t.id_turno}`)}>
                        {hhmm} · {t.tipo_turno}
                      </Tag>
                    );
                  })}
                  {items.length>4 && <Text fontSize="xs" color="gray.500">+{items.length-4} más…</Text>}
                </VStack>
              </Box>
            </GridItem>
          );
        })}
      </Grid>
    </Container>
  );
}
