import { useEffect, useMemo, useState, useRef } from "react";
import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Input,
  Select,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  Tag,
  Alert,
  AlertIcon,
  Spacer,
  InputGroup,
  InputLeftElement,
  useToast,
  // 🚀 Nuevas importaciones para el diálogo
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { SearchIcon, CalendarIcon, AddIcon, TimeIcon, ArrowBackIcon } from "@chakra-ui/icons";
import { listarTurnos, eliminarTurno } from "../../services/turnos.servicio.js";
import { ensureEntrenadorId } from "../../context/auth.js";

/* ============================================================
 * 📦 HELPERS
 * ============================================================ */

function alumnosToString(alumnos, fallback = "—") {
  if (!alumnos) return fallback;
  if (Array.isArray(alumnos)) {
    if (alumnos.length === 0) return fallback;
    if (typeof alumnos[0] === "string") return alumnos.join(", "); // DTO actual: List<String>
    // soporta [{nombre, apellido}]
    const s = alumnos
      .map((a) => `${a?.nombre ?? ""} ${a?.apellido ?? ""}`.trim())
      .filter(Boolean)
      .join(", ");
    return s || fallback;
  }
  if (typeof alumnos === "string") return alumnos || fallback; // alumnosNombres
  return fallback;
}

// 🔹 Agrupa turnos que parecen "fijos" (mismo tipo, entrenador, alumnos y hora)
function agruparTurnosFijos(turnos, normalizarTipo) {
  const ahora = new Date();
  const grupos = new Map();

  for (const t of turnos) {
    const fechaObj = new Date(t.fecha);
    if (Number.isNaN(fechaObj.getTime())) continue;

    const tipoStr = normalizarTipo(t.tipoTurno ?? t.tipo_turno);
    const entrenadorNombre = t?.entrenador || "";
    const alumnosNombres = alumnosToString(t.alumnos ?? t.alumnosNombres, "");
    const horaStr = fechaObj.toTimeString().slice(0, 5); // HH:MM

    const key = [tipoStr, entrenadorNombre, alumnosNombres, horaStr].join("|");

    const enriched = {
      ...t,
      _fechaObj: fechaObj,
      _tipoStr: tipoStr,
      _entrenadorNombre: entrenadorNombre,
      _alumnosNombres: alumnosNombres,
    };

    if (!grupos.has(key)) grupos.set(key, []);
    grupos.get(key).push(enriched);
  }

  const rows = [];

  for (const [, lista] of grupos.entries()) {
    lista.sort((a, b) => a._fechaObj - b._fechaObj);

    if (lista.length === 1) {
      // Turno suelto (no fijo)
      rows.push({ tipo: "simple", turno: lista[0] });
    } else {
      // Turno fijo (varias sesiones)
      const sesiones = lista.length;
      const desde = lista[0]._fechaObj.toISOString();
      const hasta = lista[lista.length - 1]._fechaObj.toISOString();
      const proximo = lista.find((x) => x._fechaObj >= ahora) ?? lista[0];

      rows.push({
        tipo: "fijo",
        turnoBase: proximo,
        sesiones,
        desde,
        hasta,
        idsSerie: lista.map((x) => x.id_turno),
        tipoStr: lista[0]._tipoStr,
        entrenadorNombre: lista[0]._entrenadorNombre || "—",
        alumnosNombres: lista[0]._alumnosNombres || "—",
      });
    }
  }

  // Ordenar por fecha del turno base
  rows.sort((a, b) => {
    const fa =
      a.tipo === "simple" ? a.turno._fechaObj : new Date(a.desde);
    const fb =
      b.tipo === "simple" ? b.turno._fechaObj : new Date(b.desde);
    return fa - fb;
  });

  return rows;
}

/* ============================================================
 * ⚛️ COMPONENTE PRINCIPAL
 * ============================================================ */

export default function ListaTurnos() {
  const navigate = useNavigate();
  const toast = useToast();
  const cancelRef = useRef();

  const [entrenadorId, setEntrenadorId] = useState(null);
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🚀 ESTADO PARA EL DIÁLOGO DE CONFIRMACIÓN
  const [turnoAEliminar, setTurnoAEliminar] = useState(null); // Contiene { id: number, tipo: 'simple' | 'serie', data: turno | row }

  // filtros
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [tipo, setTipo] = useState("");
  const [q, setQ] = useState("");

  const normalizarTipo = (t) =>
    (t?.nombre ?? t?.tipo ?? t ?? "").toString().trim().toLowerCase();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const id = await ensureEntrenadorId();
      setEntrenadorId(id);

      if (!id) {
        setTurnos([]);
        setLoading(false);
        return;
      }

      try {
        const { data } = await listarTurnos(id, {
          desde: desde || undefined,
          hasta: hasta || undefined,
          tipo: tipo || undefined,
        });

        const rows = Array.isArray(data) ? data : [];
        const ahora = new Date();

        // 🔹 Sólo turnos PENDIENTES (fecha/hora >= ahora)
        const pendientes = rows.filter((t) => {
          const f = new Date(t.fecha);
          return !Number.isNaN(f.getTime()) && f >= ahora;
        });

        setTurnos(pendientes);
      } catch {
        setTurnos([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [desde, hasta, tipo]);

  // 🔹 Primero filtramos por texto, luego agrupamos en "simple" / "fijo"
  const view = useMemo(() => {
    const needle = q.trim().toLowerCase();

    const filtrados = turnos.filter((t) => {
      if (!needle) return true;

      const alumnosStr = alumnosToString(
        t.alumnos ?? t.alumnosNombres,
        ""
      );
      const entrenadorNombre = t?.entrenador ?? "";
      const tipoStr = normalizarTipo(t.tipoTurno ?? t.tipo_turno);

      const hay = [
        alumnosStr,
        entrenadorNombre,
        tipoStr,
        new Date(t.fecha).toLocaleDateString(),
        new Date(t.fecha).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      ]
        .join(" ")
        .toLowerCase();

      return hay.includes(needle);
    });

    return agruparTurnosFijos(filtrados, normalizarTipo);
  }, [turnos, q]);

  const fmtFecha = (iso) => new Date(iso).toLocaleDateString();
  const fmtHora = (iso) =>
    new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  /* ==============================================================
   * LÓGICA DE ELIMINACIÓN CON ALERT DIALOG
   * ============================================================== */

  // Función que realiza la eliminación de un turno simple (LÓGICA DE API)
  async function ejecutarEliminarSimple(t) {
    try {
      await eliminarTurno(t.id_turno);
      
      toast({
        title: "Turno eliminado",
        description: `El turno ha sido eliminado con éxito.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      setTurnos((prev) => prev.filter((x) => x.id_turno !== t.id_turno));
    } catch (e) {
      const errorMsg = e?.response?.data?.mensaje || e.message || "Error desconocido al eliminar.";
      
      toast({
        title: "Error al eliminar turno",
        description: errorMsg,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    } finally {
      setTurnoAEliminar(null); // Cerrar el modal
    }
  }

  // Función que realiza la eliminación de la serie fija (LÓGICA DE API)
  async function ejecutarEliminarSerie(row) {
    try {
      for (const id of row.idsSerie) {
        await eliminarTurno(id);
      }

      toast({
        title: "Serie de turnos eliminada",
        description: `Se eliminaron ${row.sesiones} sesiones de la serie fija.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      setTurnos((prev) =>
        prev.filter((x) => !row.idsSerie.includes(x.id_turno))
      );
    } catch (e) {
      const errorMsg = e?.response?.data?.mensaje || e.message || "Error desconocido al eliminar la serie.";

      toast({
        title: "Error al eliminar serie",
        description: errorMsg,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    } finally {
      setTurnoAEliminar(null); // Cerrar el modal
    }
  }


  // 🔹 Función que abre el modal para un turno simple (SIN window.confirm)
  function handleEliminar(t) {
    setTurnoAEliminar({
        id: t.id_turno,
        tipo: 'simple',
        data: t
    });
  }

  // 🔹 Función que abre el modal para una serie fija (SIN window.confirm)
  function handleEliminarSerie(row) {
    setTurnoAEliminar({
        id: row.idsSerie[0],
        tipo: 'serie',
        data: row
    });
  }

  // 🔹 Función llamada al hacer clic en "Eliminar" DENTRO del modal
  async function confirmarEliminar() {
    if (!turnoAEliminar) return;

    if (turnoAEliminar.tipo === 'simple') {
        await ejecutarEliminarSimple(turnoAEliminar.data);
    } else {
        await ejecutarEliminarSerie(turnoAEliminar.data);
    }
  }


  /* ==============================================================
   * RENDERIZADO
   * ============================================================== */

  return (
    <Container maxW="7xl" py={8}>
      {!entrenadorId && (
        <Alert status="warning" mb={6} borderRadius="lg">
          <AlertIcon />
          Tu usuario no está vinculado a un entrenador. Por eso no se muestran turnos.
        </Alert>
      )}

      <HStack mb={6} gap={3} wrap="wrap">
        <Button leftIcon={<ArrowBackIcon />} onClick={() => navigate("/InicioDashboard")} bg="#258d19" color="white">
          Volver
        </Button>
        <Heading size="lg" color="white">
          Turnos pendientes
        </Heading>
        <Spacer />
        <Button
          leftIcon={<TimeIcon />}
          onClick={() => navigate("/turnos/historial")}
          bg="whiteAlpha.900"
          color="#258d19"
          variant="outline"
          _hover={{
            bg: "#87c987ff",   // color cuando pasás el mouse
            color: "white",    // opcional: texto blanco
          }}
          _active={{
            bg: "#87c987ff",   // color al hacer clic
            color: "white",
          }}
          _focus={{
            bg: "#87c987ff",   // por si lo seleccionás con teclado
            color: "white",
          }}
          isDisabled={!entrenadorId}
        >
          Historial de turnos
        </Button>
        <Button
          leftIcon={<CalendarIcon />}
          onClick={() => navigate("/turnos/calendario")}
          bg="#258d19"
          color="white"
          isDisabled={!entrenadorId}
        >
          Calendario
        </Button>
        <Button
          leftIcon={<AddIcon />}
          onClick={() => navigate("/turnos/registrar")}
          bg="#258d19"
          color="white"
          isDisabled={!entrenadorId}
        >
          Nuevo turno
        </Button>
      </HStack>

      <HStack gap={3} mb={4} wrap="wrap">
        <Box>
          <Text fontSize="xm" mb={1} fontWeight="bold" color="white">
            Desde
          </Text>
          <Input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            bg="white"
          />
        </Box>

        <Box>
          <Text fontSize="xm" mb={1} fontWeight="bold" color="white">
            Hasta
          </Text>
          <Input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            bg="white"
          />
        </Box>

        <Box>
          <Text fontSize="xm" mb={1} fontWeight="bold" color="white">
            Tipo
          </Text>
          <Select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            bg="white"
          >
            <option value="">Todos</option>
            <option value="individual">Individual</option>
            <option value="grupal">Grupal</option>
          </Select>
        </Box>

        <Spacer />

        <Box minW="280px" flex="1">
          <Text fontSize="xm" mb={1} fontWeight="bold" color="white">
            Buscar
          </Text>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.500" />
            </InputLeftElement>
            <Input
              placeholder="Alumno, entrenador, tipo…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              bg="white"
            />
          </InputGroup>
        </Box>
      </HStack>

      <Box
        borderWidth="1px"
        borderRadius="lg"
        bg="white"
        overflow="hidden"
        opacity={entrenadorId ? 1 : 0.6}
      >
        <Table variant="simple">
          <Thead bg="gray.50">
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
            {!loading &&
              view.map((row) => {
                // 🔹 Caso 1: turno simple (como antes)
                if (row.tipo === "simple") {
                  const t = row.turno;
                  const tipoStr = normalizarTipo(
                    t.tipoTurno ?? t.tipo_turno
                  );
                  const color =
                    tipoStr === "grupal" ? "purple" : "teal";
                  const entrenadorNombre = t?.entrenador || "—";
                  const alumnosNombres = alumnosToString(
                    t.alumnos ?? t.alumnosNombres,
                    "—"
                  );

                  return (
                    <Tr key={t.id_turno}>
                      <Td>{fmtFecha(t.fecha)}</Td>
                      <Td>{fmtHora(t.fecha)}</Td>
                      <Td>
                        <Tag size="sm" colorScheme={color}>
                          {tipoStr || "—"}
                        </Tag>
                      </Td>
                      <Td>{entrenadorNombre}</Td>
                      <Td>{alumnosNombres}</Td>
                      <Td isNumeric>
                        <HStack justify="flex-end" spacing={2}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              navigate(`/turnos/editar/${t.id_turno}`)
                            }
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            bg="#258d19"
                            color="white"
                            colorScheme="red"
                            // 🚀 LLAMA A LA FUNCIÓN QUE ABRE EL MODAL
                            onClick={() => handleEliminar(t)}
                          >
                            Eliminar
                          </Button>
                        </HStack>
                      </Td>
                    </Tr>
                  );
                }

                // 🔹 Caso 2: turno fijo (serie)
                const { turnoBase: t } = row;
                const color =
                  row.tipoStr === "grupal" ? "purple" : "teal";

                return (
                  <Tr key={`serie-${row.idsSerie[0]}`}>
                    <Td>
                      {fmtFecha(row.desde)}
                      <Text fontSize="xs" color="gray.500">
                        Turno fijo · {row.sesiones} sesiones (hasta{" "}
                        {fmtFecha(row.hasta)})
                      </Text>
                    </Td>
                    <Td>{fmtHora(t.fecha)}</Td>
                    <Td>
                      <HStack spacing={1}>
                        <Tag size="sm" colorScheme={color}>
                          {row.tipoStr || "—"}
                        </Tag>
                        <Tag
                          size="sm"
                          colorScheme="gray"
                          variant="subtle"
                        >
                          Fijo
                        </Tag>
                      </HStack>
                    </Td>
                    <Td>{row.entrenadorNombre}</Td>
                    <Td>{row.alumnosNombres}</Td>
                    <Td isNumeric>
                      <HStack justify="flex-end" spacing={2}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            navigate(`/turnos/editar/${t.id_turno}`)
                          }
                        >
                          Editar próximo
                        </Button>
                        <Button
                          size="sm"
                          bg="#258d19"
                          color="white"
                          colorScheme="red"
                          // 🚀 LLAMA A LA FUNCIÓN QUE ABRE EL MODAL
                          onClick={() => handleEliminarSerie(row)}
                        >
                          Eliminar serie
                        </Button>
                      </HStack>
                    </Td>
                  </Tr>
                );
              })}

            {!loading && view.length === 0 && (
              <Tr>
                <Td colSpan={6}>
                  <Text p={4} color="gray.500">
                    No hay turnos pendientes con los filtros seleccionados.
                  </Text>
                </Td>
              </Tr>
            )}

            {loading && (
              <Tr>
                <Td colSpan={6}>
                  <Text p={4}>Cargando…</Text>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
      
      {/* 🚀 DIÁLOGO DE CONFIRMACIÓN - AlertDialog */}
      <AlertDialog
        isOpen={turnoAEliminar !== null}
        leastDestructiveRef={cancelRef}
        onClose={() => setTurnoAEliminar(null)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {turnoAEliminar?.tipo === 'simple'
                ? `Eliminar Turno`
                : `Eliminar Serie de Turnos Fijos`}
            </AlertDialogHeader>

            <AlertDialogBody>
              {turnoAEliminar?.tipo === 'simple' ? (
                // 🔹 Caso 1: Turno simple - CON SEPARACIÓN Y FECHA EN NEGRITA
                <Box>
                  <Text>
                    ¿Estás seguro de que quieres eliminar el turno del{' '}
                    <Text as="span" fontWeight="bold">
                      {/* Usamos toLocaleString() para la fecha y hora completas */}
                      {new Date(turnoAEliminar.data.fecha).toLocaleString()}
                    </Text>
                    ?
                  </Text>
                  {/* Separación con mt={2} */}
                  <Text mt={2}>
                    Esta acción no se puede deshacer.
                  </Text>
                </Box>
              ) : (
                // 🔹 Caso 2: Serie Fija - CON SEPARACIÓN Y FECHAS EN NEGRITA
                <Box>
                  <Text>
                    ¿Está seguro de que quiere eliminar las {turnoAEliminar?.data.sesiones} sesiones del turno fijo, desde el{' '}
                    <Text as="span" fontWeight="bold">
                      {fmtFecha(turnoAEliminar?.data.desde)}
                    </Text>{' '}
                    hasta el{' '}
                    <Text as="span" fontWeight="bold">
                      {fmtFecha(turnoAEliminar?.data.hasta)}
                    </Text>
                    ?
                  </Text>
                  {/* ✨ Aquí se usa mt={2} sin asteriscos para la separación */}
                  <Text mt={2}>
                    Esta acción no se puede deshacer.
                  </Text>
                </Box>
              )}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} bg="#258d19" color="white" onClick={() => setTurnoAEliminar(null)}>
                Cancelar
              </Button>
              <Button
                bg="red.600"
                color="white"
                _hover={{ bg: "red.600" }}
                onClick={confirmarEliminar}
                ml={3}
              >
                Eliminar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
}