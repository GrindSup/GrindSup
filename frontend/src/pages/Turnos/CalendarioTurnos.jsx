import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  GridItem,
  Heading,
  HStack,
  Text,
  Tag,
  VStack,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { listarTurnos } from "/src/services/turnos.servicio.js";
import { ensureEntrenadorId, getUsuario } from "/src/context/auth.js";

function getTurnoEntrenadorId(t) {
  return (
    t?.entrenador?.id_entrenador ??
    t?.entrenador?.id ??
    t?.id_entrenador ??
    t?.idEntrenador ??
    t?.entrenadorId ??
    t?.entrenador_id ??
    null
  );
}
function daysInMonth(y, m) {
  return new Date(y, m + 1, 0).getDate();
}
function firstWeekday(y, m) {
  return new Date(y, m, 1).getDay();
}

export default function CalendarioTurnos() {
  const navigate = useNavigate();
  const [entrenadorId, setEntrenadorId] = useState(null);
  const [turnos, setTurnos] = useState([]);
  const [y, setY] = useState(new Date().getFullYear());
  const [m, setM] = useState(new Date().getMonth());

  useEffect(() => {
    (async () => {
      const id = await ensureEntrenadorId();
      setEntrenadorId(id);
      if (!id) {
        setTurnos([]);
        return;
      }

      const { data } = await listarTurnos(id);
      const rows = Array.isArray(data) ? data : [];

      const usuario = getUsuario();
      const myName = `${usuario?.nombre ?? ""} ${usuario?.apellido ?? ""}`
        .trim()
        .toLowerCase();

      // Filtra por el entrenador actual
      const propios = rows.filter((t) => {
        const te = getTurnoEntrenadorId(t);
        if (te != null) return Number(te) === Number(id);
        const nombreEnt = (t?.entrenador?.nombre ?? t?.entrenadorNombre ?? "")
          .trim()
          .toLowerCase();
        if (nombreEnt && myName) return nombreEnt === myName;
        return true;
      });

      setTurnos(propios);
    })();
  }, []);

  const porDia = useMemo(() => {
    const map = new Map();
    (turnos || []).forEach((t) => {
      const k = new Date(t.fecha).toISOString().slice(0, 10);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(t);
    });
    return map;
  }, [turnos]);

  const dim = daysInMonth(y, m);
  const first = firstWeekday(y, m);
  const monthName = new Date(y, m, 1).toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });

  const prev = () => {
    const d = new Date(y, m, 1);
    d.setMonth(m - 1);
    setY(d.getFullYear());
    setM(d.getMonth());
  };
  const next = () => {
    const d = new Date(y, m, 1);
    d.setMonth(m + 1);
    setY(d.getFullYear());
    setM(d.getMonth());
  };

  return (
    <Container maxW="6xl" py={8}>
      {!entrenadorId && (
        <Alert status="warning" mb={6} borderRadius="lg">
          <AlertIcon />
          Tu usuario no está vinculado a un entrenador. El calendario está
          deshabilitado.
        </Alert>
      )}

      <HStack justify="space-between" mb={6} opacity={entrenadorId ? 1 : 0.5}>
        <Heading size="lg" color="gray.900">
          Calendario de Turnos
        </Heading>
        <HStack>
          <Button onClick={prev} bg="#38A169" color="white" isDisabled={!entrenadorId}>
            ◀
          </Button>
          <Text
            w="220px"
            textAlign="center"
            fontWeight="semibold"
            textTransform="capitalize"
          >
            {monthName}
          </Text>
          <Button onClick={next} bg="#38A169" color="white" isDisabled={!entrenadorId}>
            ▶
          </Button>
          <Button
            variant="solid"
            onClick={() => navigate("/turnos")}
            bg="#38A169"
            color="white"
            isDisabled={!entrenadorId}
          >
            Ver lista
          </Button>
          <Button
            colorScheme="brand"
            onClick={() => navigate("/turnos/registrar")}
            bg="#38A169"
            color="white"
            isDisabled={!entrenadorId}
          >
            + Nuevo turno
          </Button>
        </HStack>
      </HStack>

      <Grid
        templateColumns="repeat(7, 1fr)"
        gap={2}
        fontWeight="semibold"
        color="gray.900"
        mb={2}
      >
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((d) => (
          <Box key={d} textAlign="center">
            {d}
          </Box>
        ))}
      </Grid>

      <Grid
        templateColumns="repeat(7, 1fr)"
        gap={2}
        opacity={entrenadorId ? 1 : 0.3}
        pointerEvents={entrenadorId ? "auto" : "none"}
      >
        {Array.from({ length: first }).map((_, i) => (
          <GridItem key={`e-${i}`} />
        ))}

        {Array.from({ length: dim }).map((_, i) => {
          const day = i + 1;
          const date = new Date(y, m, day);
          const key = date.toISOString().slice(0, 10);
          const items = porDia.get(key) || [];

          return (
            <GridItem key={day}>
              <Box borderWidth="1px" borderRadius="md" p={2} minH="110px" bg="white">
                <Text fontSize="sm" color="gray.700" mb={1}>
                  {day}
                </Text>
                <VStack align="stretch" spacing={1}>
                  {items.slice(0, 4).map((t) => {
                    const hhmm = new Date(t.fecha).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    const tipoStr = (t.tipo_turno ?? t.tipoTurno ?? "")
                      .toString()
                      .toLowerCase();
                    const color = tipoStr === "grupal" ? "purple" : "teal";

                    return (
                      <Tag
                        key={t.id_turno}
                        size="sm"
                        colorScheme={color}
                        cursor="pointer"
                        // ✅ NAVEGA A LA RUTA CORRECTA DE EDICIÓN
                        onClick={() => navigate(`/turnos/editar/${t.id_turno}`)}
                      >
                        {hhmm} · {t.tipo_turno ?? t.tipoTurno ?? ""}
                      </Tag>
                    );
                  })}
                  {items.length > 4 && (
                    <Text fontSize="xs" color="gray.500">
                      +{items.length - 4} más…
                    </Text>
                  )}
                </VStack>
              </Box>
            </GridItem>
          );
        })}
      </Grid>
    </Container>
  );
}
