// src/pages/Alumno/RegistrarAlumnoForm.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Button, Card, CardBody, CardHeader, Container, Grid, GridItem,
  Heading, Input, Stack, Text, useToast, FormControl, FormLabel,
  FormErrorMessage, Spinner, Menu, MenuButton, MenuList, MenuItem,
  Checkbox, HStack, IconButton, Divider, Badge, Alert, AlertIcon
} from "@chakra-ui/react";
import { ChevronDownIcon, AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { getUsuario, getEntrenadorId } from "../../context/auth.js";
import { useNavigate } from "react-router-dom";
// 🚀 Usamos el axios configurado
import axios from "../../config/axios.config.js";

/* helpers JSON */
function stringifyNotes(items) {
  const list = (items || [])
    .map((i) => ({ text: String(i.text ?? "").trim(), important: !!i.important }))
    .filter((i) => i.text);
  return JSON.stringify({ items: list });
}

export default function RegistrarAlumnoForm({ usarMock = false }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const usuario = getUsuario();
  const entrenadorId = getEntrenadorId(usuario);

  const [form, setForm] = useState({
    nombre: "", apellido: "", documento: "", fechaNac: "",
    peso: "", altura: "", telefono: "", informeMedico: false,
    codigoArea: "+54", contactoNumero: "",
  });

  const [dniDisponible, setDniDisponible] = useState(true);
  const [checkingDni, setCheckingDni] = useState(false);
  const [lesiones, setLesiones] = useState([]);
  const [enfermedades, setEnfermedades] = useState([]);
  const [codigos, setCodigos] = useState([]);
  const [loadingCodigos, setLoadingCodigos] = useState(true);

  // Códigos de área (fetch público)
  useEffect(() => {
    const fetchCodes = async () => {
      try {
        const res = await fetch("https://restcountries.com/v3.1/all?fields=cca2,idd,name");
        const data = await res.json();
        const parsed = data
          .filter((c) => c?.idd?.root)
          .flatMap((c) => {
            const root = c.idd.root;
            const suffixes = c.idd.suffixes?.length ? c.idd.suffixes : [""];
            return suffixes.map((suf) => ({ code: `${root}${suf}`, country: c.name?.common ?? "" }));
          })
          .filter((x) => x.code)
          .sort((a, b) => a.country.localeCompare(b.country, "es"));
        // Argentina arriba
        parsed.sort((a, b) => (a.country === "Argentina" ? -1 : b.country === "Argentina" ? 1 : 0));
        setCodigos(parsed);
      } catch (err) {
        console.error("Error al cargar códigos de área", err);
      } finally {
        setLoadingCodigos(false);
      }
    };
    fetchCodes();
  }, []);

  const errors = useMemo(() => {
    const e = {};
    if (!form.nombre?.trim()) e.nombre = "El nombre es obligatorio";
    if (!form.apellido?.trim()) e.apellido = "El apellido es obligatorio";
    if (!form.documento?.trim()) e.documento = "El documento es obligatorio";
    else if (!/^[0-9]+$/.test(form.documento)) e.documento = "El DNI debe contener solo números";
    if (!form.fechaNac?.trim()) e.fechaNac = "La fecha de nacimiento es obligatoria";
    else {
      const hoy = new Date().toISOString().split("T")[0];
      if (form.fechaNac > hoy) e.fechaNac = "La fecha no puede ser futura";
    }
    if (form.peso && !/^\d+(\.\d+)?$/.test(form.peso)) e.peso = "El peso debe ser numérico";
    if (form.altura && !/^\d+(\.\d+)?$/.test(form.altura)) e.altura = "La altura debe ser numérica";
    if (form.contactoNumero && !/^[0-9]+$/.test(form.contactoNumero)) e.contactoNumero = "El número debe ser numérico";
    return e;
  }, [form]);

  // Verificación de DNI con axios
  useEffect(() => {
    if (!form.documento?.trim() || !/^[0-9]+$/.test(form.documento)) {
      setDniDisponible(true);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        setCheckingDni(true);
        const res = await axios.get(
          `/api/alumnos?documento=${encodeURIComponent(form.documento.trim())}`,
          { signal: controller.signal }
        );
        const data = res.data;
        setDniDisponible(!(Array.isArray(data) && data.length > 0));
      } catch (_err) {
        // si falla, asumimos disponible y se valida al submit
        setDniDisponible(true);
      } finally {
        setCheckingDni(false);
      }
    }, 600);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [form.documento]);

  const isValid = Object.keys(errors).length === 0;
  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const hoy = new Date().toISOString().split("T")[0];

  const buildPayload = () => {
    const entrenadorRef = entrenadorId ? { id_entrenador: entrenadorId, id: entrenadorId } : null;
    return {
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      documento: form.documento.trim(),
      fechaNacimiento: form.fechaNac,
      peso: form.peso ? Number(form.peso) : null,
      altura: form.altura ? Number(form.altura) : null,
      informeMedico: form.informeMedico,
      telefono: form.codigoArea + form.contactoNumero,
      lesiones: stringifyNotes(lesiones),
      enfermedades: stringifyNotes(enfermedades),
      estado: { id_estado: 1 },
      entrenador: entrenadorRef,
    };
  };

  const submitMock = () => new Promise((r) => setTimeout(() => r({ ok: true }), 700));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    if (!isValid) {
      toast({ status: "warning", title: "Revisá los campos obligatorios", position: "top" });
      return;
    }
    if (!entrenadorId) {
      toast({
        status: "warning",
        title: "No hay entrenador asociado a la sesión",
        description: "Configurá tu entrenador antes de registrar alumnos.",
        position: "top",
      });
      return;
    }

    setSubmitting(true);
    try {
      // Doble chequeo de DNI
      const dupRes = await axios.get(
        `/api/alumnos?documento=${encodeURIComponent(form.documento.trim())}`
      );
      const posibles = dupRes.data;
      if (Array.isArray(posibles) && posibles.length > 0) {
        throw new Error("El documento ya está registrado.");
      }

      const payload = buildPayload();

      if (usarMock) {
        await submitMock();
      } else {
        await axios.post("/api/alumnos", payload);
      }

      toast({ status: "success", title: "Alumno registrado", position: "top" });
      navigate("/alumnos");
    } catch (err) {
      toast({
        status: "error",
        title: "No se pudo registrar",
        description: err?.response?.data?.message || err.message,
        position: "top",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const addItem = (which) => {
    if (which === "les") {
      setLesiones((p) => [...p, { text: "", important: false }]);
    } else {
      setEnfermedades((p) => [...p, { text: "", important: false }]);
    }
  };
  const setItem = (which, idx, patch) => {
    if (which === "les") {
      setLesiones((p) => p.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
    } else {
      setEnfermedades((p) => p.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
    }
  };
  const removeItem = (which, idx) => {
    if (which === "les") {
      setLesiones((p) => p.filter((_, i) => i !== idx));
    } else {
      setEnfermedades((p) => p.filter((_, i) => i !== idx));
    }
  };

  return (
    <Box py={{ base: 8, md: 12 }}>
      <Container maxW="container.sm">
        {!entrenadorId && (
          <Alert status="warning" mb={4} borderRadius="lg">
            <AlertIcon />
            Tu usuario no está vinculado a un entrenador. Definilo y volvé a intentar.
          </Alert>
        )}

        <Card>
          <CardHeader textAlign="center" pb={0}>
            <Heading size="lg">Registrar Alumno</Heading>
            <Text color="gray.600" mt={2}>
              Por favor, complete las casillas obligatorias para continuar.
            </Text>
          </CardHeader>

          <CardBody pt={6} px={{ base: 6, md: 10 }} pb={8}>
            <Box as="form" onSubmit={onSubmit}>
              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={5}>
                <GridItem>
                  <FormControl isRequired isInvalid={submitted && !!errors.nombre}>
                    <FormLabel>Nombre</FormLabel>
                    <Input name="nombre" placeholder="Ej: Betina" value={form.nombre} onChange={handleChange} />
                    {submitted && <FormErrorMessage>{errors.nombre}</FormErrorMessage>}
                  </FormControl>
                </GridItem>

                <GridItem>
                  <FormControl isRequired isInvalid={submitted && !!errors.apellido}>
                    <FormLabel>Apellido</FormLabel>
                    <Input name="apellido" placeholder="Ej: Yost" value={form.apellido} onChange={handleChange} />
                    {submitted && <FormErrorMessage>{errors.apellido}</FormErrorMessage>}
                  </FormControl>
                </GridItem>

                <GridItem>
                  <FormControl
                    isRequired
                    isInvalid={(submitted && !!errors.documento) || (!dniDisponible && form.documento.trim() !== "")}
                  >
                    <FormLabel>Documento (DNI)</FormLabel>
                    <Input name="documento" placeholder="Ej: 40123456" value={form.documento} onChange={handleChange} />
                    {checkingDni && <Text fontSize="sm" color="gray.500">Verificando DNI...</Text>}
                    {submitted && errors.documento && (<FormErrorMessage>{errors.documento}</FormErrorMessage>)}
                    {!dniDisponible && form.documento.trim() !== "" && (
                      <FormErrorMessage>El documento ya está registrado.</FormErrorMessage>
                    )}
                  </FormControl>
                </GridItem>

                <GridItem>
                  <FormControl isRequired isInvalid={submitted && !!errors.fechaNac}>
                    <FormLabel>Fecha de nacimiento</FormLabel>
                    <Input type="date" name="fechaNac" max={hoy} value={form.fechaNac} onChange={handleChange} />
                    {submitted && <FormErrorMessage>{errors.fechaNac}</FormErrorMessage>}
                  </FormControl>
                </GridItem>

                <GridItem>
                  <FormControl isInvalid={submitted && !!errors.peso}>
                    <FormLabel>Peso (kg)</FormLabel>
                    <Input type="number" name="peso" value={form.peso} onChange={handleChange} />
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl isInvalid={submitted && !!errors.altura}>
                    <FormLabel>Altura (cm)</FormLabel>
                    <Input type="number" name="altura" value={form.altura} onChange={handleChange} />
                  </FormControl>
                </GridItem>

                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <FormControl isInvalid={submitted && !!errors.contactoNumero}>
                    <FormLabel>Contacto</FormLabel>
                    <Stack direction="row" spacing={3} align="center">
                      {loadingCodigos ? (
                        <Button variant="outline" isDisabled rightIcon={<Spinner size="sm" />}>
                          {form.codigoArea}
                        </Button>
                      ) : (
                        <Menu>
                          <MenuButton as={Button} variant="outline" rightIcon={<ChevronDownIcon />} minW="120px">
                            {form.codigoArea}
                          </MenuButton>
                          <MenuList maxH="280px" overflowY="auto">
                            {codigos.map((c) => (
                              <MenuItem
                                key={c.code + c.country}
                                onClick={() => setForm((p) => ({ ...p, codigoArea: c.code }))}
                              >
                                {c.code} ({c.country})
                              </MenuItem>
                            ))}
                          </MenuList>
                        </Menu>
                      )}
                      <Input
                        name="contactoNumero"
                        placeholder="123456789"
                        value={form.contactoNumero}
                        onChange={handleChange}
                      />
                    </Stack>
                  </FormControl>
                </GridItem>

                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <SectionHeader title="Lesiones" onAdd={() => addItem("les")} />
                  {lesiones.length === 0 && <Badge mt={2}>Sin registros</Badge>}
                  {lesiones.map((it, idx) => (
                    <HStack key={`les-${idx}`} mt={2}>
                      <Input
                        placeholder="Detalle de la lesión…"
                        value={it.text}
                        onChange={(e) => setItem("les", idx, { text: e.target.value })}
                      />
                      <Checkbox
                        isChecked={it.important}
                        onChange={(e) => setItem("les", idx, { important: e.target.checked })}
                      >
                        Importante
                      </Checkbox>
                      <IconButton
                        aria-label="Eliminar"
                        icon={<DeleteIcon />}
                        onClick={() => removeItem("les", idx)}
                        bg="#258d19"
                        color="white"
                      />
                    </HStack>
                  ))}
                </GridItem>

                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <Divider />
                </GridItem>

                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <SectionHeader title="Enfermedades" onAdd={() => addItem("dis")} />
                  {enfermedades.length === 0 && <Badge mt={2}>Sin registros</Badge>}
                  {enfermedades.map((it, idx) => (
                    <HStack key={`dis-${idx}`} mt={2}>
                      <Input
                        placeholder="Detalle de la enfermedad…"
                        value={it.text}
                        onChange={(e) => setItem("dis", idx, { text: e.target.value })}
                      />
                      <Checkbox
                        isChecked={it.important}
                        onChange={(e) => setItem("dis", idx, { important: e.target.checked })}
                      >
                        Importante
                      </Checkbox>
                      <IconButton
                        aria-label="Eliminar"
                        icon={<DeleteIcon />}
                        onClick={() => removeItem("dis", idx)}
                        bg="#258d19"
                        color="white"
                      />
                    </HStack>
                  ))}
                </GridItem>

                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <Checkbox
                    name="informeMedico"
                    isChecked={form.informeMedico}
                    onChange={(e) => setForm((p) => ({ ...p, informeMedico: e.target.checked }))}
                  >
                    Entregó informe médico
                  </Checkbox>
                </GridItem>
              </Grid>

              <Stack direction={{ base: "column", md: "row" }} spacing={4} mt={8} justify="center">
                <Button
                  type="submit"
                  isLoading={submitting}
                  loadingText="Guardando"
                  px={10}
                  bg="#258d19"
                  color="white"
                  isDisabled={!dniDisponible || checkingDni}
                >
                  Registrar
                </Button>
                <Button variant="ghost" type="button" onClick={() => navigate(-1)}>
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
      <Button size="sm" leftIcon={<AddIcon />} onClick={onAdd} bg="#258d19" color="white">
        Agregar
      </Button>
    </HStack>
  );
}
