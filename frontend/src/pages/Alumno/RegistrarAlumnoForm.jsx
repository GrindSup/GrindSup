import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Button, Card, CardBody, CardHeader, Container, Grid, GridItem,
  Heading, Input, Stack, Text, useToast, FormControl, FormLabel,
  FormErrorMessage, Spinner, Menu, MenuButton, MenuList, MenuItem,
  Checkbox, HStack, IconButton, Divider, Badge
} from "@chakra-ui/react";
import { ChevronDownIcon, AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { getUsuario, getEntrenadorId } from "../../context/auth.js";

const API = import.meta?.env?.VITE_API_BASE_URL || "http://localhost:8080/api";

/* helpers JSON */
function stringifyNotes(items) {
  const list = (items || [])
    .map(i => ({ text: String(i.text ?? "").trim(), important: !!i.important }))
    .filter(i => i.text);
  return JSON.stringify({ items: list });
}

export default function RegistrarAlumnoForm({
  apiBaseUrl = API,
  usarMock = false,
}) {
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

  const [lesiones, setLesiones] = useState([]);
  const [enfermedades, setEnfermedades] = useState([]);

  const [codigos, setCodigos] = useState([]);
  const [loadingCodigos, setLoadingCodigos] = useState(true);

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
    if (form.peso && !/^[0-9]+$/.test(form.peso)) e.peso = "El peso debe ser numérico";
    if (form.altura && !/^[0-9]+$/.test(form.altura)) e.altura = "La altura debe ser numérica";
    if (form.contactoNumero && !/^[0-9]+$/.test(form.contactoNumero)) e.contactoNumero = "El número debe ser numérico";
    return e;
  }, [form]);

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
      // guardamos JSON en TEXT:
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
      toast({ status: "error", title: "Sesión inválida", description: "No se encontró el entrenador logueado.", position: "top" });
      return;
    }

    setSubmitting(true);
    try {
      const payload = buildPayload();

      if (usarMock) {
        await submitMock();
      } else {
        const res = await fetch(`${apiBaseUrl}/alumnos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          let msg = "Error al registrar";
          try { const j = await res.json(); if (j?.message) msg = j.message; } catch {}
          throw new Error(msg);
        }
        await res.json();
      }

      toast({ status: "success", title: "Alumno registrado", position: "top" });
      setForm({
        nombre: "", apellido: "", documento: "", fechaNac: "",
        peso: "", altura: "", telefono: "", informeMedico: false,
        codigoArea: "+54", contactoNumero: "",
      });
      setLesiones([]); setEnfermedades([]);
      setSubmitted(false);
    } catch (err) {
      toast({ status: "error", title: "No se pudo registrar", description: err.message, position: "top" });
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
      <Container maxW="container.sm">
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
                  <FormControl isRequired isInvalid={submitted && !!errors.documento}>
                    <FormLabel>Documento (DNI)</FormLabel>
                    <Input name="documento" placeholder="Ej: 40123456" value={form.documento} onChange={handleChange} />
                    {submitted && <FormErrorMessage>{errors.documento}</FormErrorMessage>}
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

                {/* Teléfono con código */}
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
                              <MenuItem key={c.code + c.country} onClick={() => setForm((p) => ({ ...p, codigoArea: c.code }))}>
                                {c.code} ({c.country})
                              </MenuItem>
                            ))}
                          </MenuList>
                        </Menu>
                      )}
                      <Input name="contactoNumero" placeholder="123456789" value={form.contactoNumero} onChange={handleChange} />
                    </Stack>
                  </FormControl>
                </GridItem>

                {/* Lesiones */}
                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <SectionHeader title="Lesiones" onAdd={() => addItem("les")} />
                  {lesiones.length === 0 && <Badge mt={2}>Sin registros</Badge>}
                  {lesiones.map((it, idx) => (
                    <HStack key={idx} mt={2}>
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
                      <IconButton aria-label="Eliminar" icon={<DeleteIcon />} onClick={()=>removeItem("les", idx)} />
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
                    <HStack key={idx} mt={2}>
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
                      <IconButton aria-label="Eliminar" icon={<DeleteIcon />} onClick={()=>removeItem("dis", idx)} />
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
                <Button type="submit" isLoading={submitting} loadingText="Guardando" px={10}>
                  Registrar
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setForm({
                      nombre: "", apellido: "", documento: "", fechaNac: "",
                      peso: "", altura: "", telefono: "", informeMedico: false,
                      codigoArea:"+54", contactoNumero:""
                    });
                    setLesiones([]); setEnfermedades([]);
                    setSubmitted(false);
                  }}
                >
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
      <Button size="sm" leftIcon={<AddIcon />} onClick={onAdd}>Agregar</Button>
    </HStack>
  );
}
