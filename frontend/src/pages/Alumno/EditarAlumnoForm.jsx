import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Button, Card, CardBody, CardHeader, Container, Grid, GridItem,
  Heading, Input, Stack, Text, useToast, FormControl, FormLabel,
  FormErrorMessage, Checkbox, HStack, IconButton, Divider, Badge
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { getUsuario, getEntrenadorId } from "../../context/auth.js";

const API = import.meta?.env?.VITE_API_BASE_URL || "http://localhost:8080/api";

/* ---- helpers JSON <-> items ---- */
function parseNotes(raw) {
  if (!raw) return [];
  try {
    const j = JSON.parse(raw);
    if (Array.isArray(j?.items)) {
      return j.items
        .map(it => ({ text: String(it.text ?? "").trim(), important: !!it.important }))
        .filter(it => it.text);
    }
  } catch {}
  const t = String(raw).trim();
  return t ? [{ text: t, important: false }] : [];
}
function stringifyNotes(items) {
  const list = (items || [])
    .map(i => ({ text: String(i.text ?? "").trim(), important: !!i.important }))
    .filter(i => i.text);
  return JSON.stringify({ items: list });
}

export default function EditarAlumnoForm({ apiBaseUrl = API }) {
  const { id } = useParams();
  const toast = useToast();
  const navigate = useNavigate();

  const usuario = getUsuario();
  const entrenadorId = getEntrenadorId(usuario);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [useSnakeCase, setUseSnakeCase] = useState(false);

  const [alumno, setAlumno] = useState({
    nombre: "", apellido: "", documento: "", peso: "", altura: "",
    telefono: "", informeMedico: false, estado: undefined,
  });

  const [lesiones, setLesiones] = useState([]);
  const [enfermedades, setEnfermedades] = useState([]);

  function normalizeAlumno(data = {}) {
    const snake =
      Object.prototype.hasOwnProperty.call(data, "informe_medico") ||
      Object.prototype.hasOwnProperty.call(data, "id_estado");
    setUseSnakeCase(snake);

    const toStr = (v) => (v === null || v === undefined ? "" : String(v));

    setLesiones(parseNotes(data.lesiones));
    setEnfermedades(parseNotes(data.enfermedades));

    return {
      nombre: toStr(data.nombre),
      apellido: toStr(data.apellido),
      documento: toStr(data.documento ?? data.dni ?? data.doc ?? data.numero_documento),
      peso: toStr(data.peso),
      altura: toStr(data.altura),
      informeMedico: (data.informeMedico ?? data.informe_medico ?? false) ? true : false,
      telefono: toStr(data.telefono ?? data.contacto ?? data.telefono_contacto ?? data.phone),
      estado: data.estado ?? (snake && data.id_estado ? { id_estado: data.id_estado } : undefined),
    };
  }

  const buildPayload = () => {
    const entrenadorRef = entrenadorId ? { id_entrenador: entrenadorId, id: entrenadorId } : null;
    const peso = alumno.peso === "" ? null : Number(alumno.peso);
    const altura = alumno.altura === "" ? null : Number(alumno.altura);

    const base = {
      nombre: alumno.nombre.trim(),
      apellido: alumno.apellido.trim(),
      documento: alumno.documento,
      peso, altura,
      telefono: alumno.telefono?.trim(),
      lesiones: stringifyNotes(lesiones),
      enfermedades: stringifyNotes(enfermedades),
    };

    if (useSnakeCase) {
      return {
        ...base,
        informe_medico: !!alumno.informeMedico,
        id_estado: alumno.estado?.id_estado ?? 1,
        entrenador: entrenadorRef,
      };
    } else {
      return {
        ...base,
        informeMedico: !!alumno.informeMedico,
        estado: alumno.estado || { id_estado: 1 },
        entrenador: entrenadorRef,
      };
    }
  };

  useEffect(() => {
    const fetchAlumno = async () => {
      try {
        const { data } = await axios.get(`${apiBaseUrl}/alumnos/${id}`);
        setAlumno(normalizeAlumno(data));
      } catch (err) {
        toast({ status: "error", title: "Error al cargar alumno", description: err.message, position: "top" });
      }
    };
    fetchAlumno();
  }, [id, apiBaseUrl, toast]);

  const errors = useMemo(() => {
    const e = {};
    if (!alumno.nombre?.trim()) e.nombre = "El nombre es obligatorio";
    if (!alumno.apellido?.trim()) e.apellido = "El apellido es obligatorio";
    if (alumno.peso !== "" && !/^\d+(\.\d+)?$/.test(String(alumno.peso))) e.peso = "El peso debe ser numérico";
    if (alumno.altura !== "" && !/^\d+(\.\d+)?$/.test(String(alumno.altura))) e.altura = "La altura debe ser numérica";
    if (alumno.telefono && !/^\+?\d+$/.test(alumno.telefono)) e.telefono = "El teléfono debe ser numérico y puede incluir +";
    return e;
  }, [alumno]);

  const isValid = Object.keys(errors).length === 0;
  const handleChange = (e) => setAlumno((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (!isValid) {
      toast({ status: "warning", title: "Revisá los campos obligatorios", position: "top" });
      return;
    }
    setSubmitting(true);
    try {
      const payload = buildPayload();
      await axios.put(`${apiBaseUrl}/alumnos/${id}`, payload);
      toast({ status: "success", title: "Alumno actualizado", position: "top" });
      navigate("/alumnos");
    } catch (err) {
      toast({ status: "error", title: "No se pudo actualizar", description: err.message, position: "top" });
    } finally {
      setSubmitting(false);
    }
  };

  const addItem = (which) => {
    (which === "les") ? setLesiones((p) => [...p, { text: "", important: false }])
                      : setEnfermedades((p) => [...p, { text: "", important: false }]);
  };
  const setItem = (which, idx, patch) => {
    (which === "les")
      ? setLesiones(p => p.map((it,i)=> i===idx? {...it, ...patch}: it))
      : setEnfermedades(p => p.map((it,i)=> i===idx? {...it, ...patch}: it));
  };
  const removeItem = (which, idx) => {
    (which === "les")
      ? setLesiones(p => p.filter((_,i)=> i!==idx))
      : setEnfermedades(p => p.filter((_,i)=> i!==idx));
  };

  return (
    <Box py={{ base: 8, md: 12 }}>
      <Container maxW="container.md">
        <Card>
          <CardHeader textAlign="center" pb={0}>
            <Heading size="lg">Editar Alumno</Heading>
            <Text color="gray.600" mt={2}>Modificá los datos necesarios y guardá los cambios.</Text>
          </CardHeader>
          <CardBody pt={6} px={{ base: 6, md: 10 }} pb={8}>
            <Box as="form" onSubmit={onSubmit}>
              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={5}>
                <GridItem>
                  <FormControl isRequired isInvalid={submitted && !!errors.nombre}>
                    <FormLabel>Nombre</FormLabel>
                    <Input name="nombre" value={alumno.nombre} onChange={handleChange} />
                    {submitted && <FormErrorMessage>{errors.nombre}</FormErrorMessage>}
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl isRequired isInvalid={submitted && !!errors.apellido}>
                    <FormLabel>Apellido</FormLabel>
                    <Input name="apellido" value={alumno.apellido} onChange={handleChange} />
                    {submitted && <FormErrorMessage>{errors.apellido}</FormErrorMessage>}
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl isRequired>
                    <FormLabel>DNI</FormLabel>
                    <Input name="documento" value={alumno.documento} isDisabled />
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl isInvalid={submitted && !!errors.peso}>
                    <FormLabel>Peso (kg)</FormLabel>
                    <Input type="number" name="peso" value={alumno.peso === null ? "" : alumno.peso} onChange={handleChange} />
                    {submitted && <FormErrorMessage>{errors.peso}</FormErrorMessage>}
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl isInvalid={submitted && !!errors.altura}>
                    <FormLabel>Altura (cm)</FormLabel>
                    <Input type="number" name="altura" value={alumno.altura === null ? "" : alumno.altura} onChange={handleChange} />
                    {submitted && <FormErrorMessage>{errors.altura}</FormErrorMessage>}
                  </FormControl>
                </GridItem>
                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <FormControl isRequired isInvalid={submitted && !!errors.telefono}>
                    <FormLabel>Teléfono</FormLabel>
                    <Input name="telefono" placeholder="+541112345678" value={alumno.telefono} onChange={handleChange} />
                    {submitted && <FormErrorMessage>{errors.telefono}</FormErrorMessage>}
                  </FormControl>
                </GridItem>

                {/* Lesiones */}
                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <SectionHeader title="Lesiones" onAdd={() => addItem("les")} />
                  {lesiones.length === 0 && <Badge mt={2}>Sin registros</Badge>}
                  {lesiones.map((it, idx) => (
                    <HStack key={idx} mt={2} align="center">
                      <Input
                        placeholder="Detalle de la lesión…"
                        value={it.text}
                        onChange={(e)=>setItem("les", idx, { text: e.target.value })}
                      />
                      <Checkbox
                        isChecked={it.important}
                        onChange={(e)=>setItem("les", idx, { important: e.target.checked })}
                      >
                        Importante
                      </Checkbox>
                      <IconButton aria-label="Eliminar" icon={<DeleteIcon />} bg="#0f4d11ff" color="white" onClick={()=>removeItem("les", idx)} />
                    </HStack>
                  ))}
                </GridItem>

                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <Divider />
                </GridItem>

                {/* Enfermedades */}
                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <SectionHeader title="Enfermedades" onAdd={() => addItem("dis")} />
                  {enfermedades.length === 0 && <Badge mt={2}>Sin registros</Badge>}
                  {enfermedades.map((it, idx) => (
                    <HStack key={idx} mt={2} align="center">
                      <Input
                        placeholder="Detalle de la enfermedad…"
                        value={it.text}
                        onChange={(e)=>setItem("dis", idx, { text: e.target.value })}
                      />
                      <Checkbox
                        isChecked={it.important}
                        onChange={(e)=>setItem("dis", idx, { important: e.target.checked })}
                      >
                        Importante
                      </Checkbox>
                      <IconButton aria-label="Eliminar" icon={<DeleteIcon />} bg="#0f4d11ff" color="white" onClick={()=>removeItem("dis", idx)} />
                    </HStack>
                  ))}
                </GridItem>

                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <Checkbox
                    name="informeMedico"
                    isChecked={!!alumno.informeMedico}
                    onChange={(e) => setAlumno((p) => ({ ...p, informeMedico: e.target.checked }))}
                  >
                    Entregó informe médico
                  </Checkbox>
                </GridItem>
              </Grid>

              <Stack direction={{ base: "column", md: "row" }} spacing={4} mt={8} justify="center">
                <Button type="submit" isLoading={submitting} loadingText="Guardando" px={10} bg="#0f4d11ff" color="white">
                  Guardar cambios
                </Button>
                <Button variant="ghost" onClick={() => navigate("/alumnos")}>
                  Cancelar
                </Button>
              </Stack>
            </Box>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
}

function SectionHeader({ title, onAdd }) {
  return (
    <HStack justify="space-between">
      <FormLabel m={0}>{title}</FormLabel>
      <Button size="sm" leftIcon={<AddIcon />} onClick={onAdd} bg="#0f4d11ff" color="white">
        Agregar
      </Button>
    </HStack>
  );
}
