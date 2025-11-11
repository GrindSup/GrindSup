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

/* =========================================================================
 * 📦 HELPERS
 * ========================================================================= */

/* TIPOS DE DOCUMENTO (API de ejemplo o mock) */
const DOCUMENT_TYPES = [
    { code: "DNI", name: "DNI" },
    { code: "LE", name: "Libreta de Enrolamiento" },
    { code: "LC", name: "Libreta Cívica" },
    { code: "PAS", name: "Pasaporte" },
    { code: "CI", name: "Cédula de Identidad" },
];
// NOTA: Usamos un mock de API libre ya que no hay una API universal para tipos de DNI.
// En un entorno real, esto vendría de tu backend.

function stringifyNotes(items) {
  const list = (items || [])
    .map((i) => ({ text: String(i.text ?? "").trim(), important: !!i.important }))
    .filter((i) => i.text);
  return JSON.stringify({ items: list });
}

/* ⚡ Componente para Optimización de Rendimiento (React.memo) */
// Se usa React.memo para evitar re-renders innecesarios en las listas
// de Lesiones y Enfermedades cuando otros campos del formulario cambian.
const DetalleItem = React.memo(
  function DetalleItem({ item, idx, which, setItem, removeItem }) {
    const isLesion = which === "les";
    const placeholderText = isLesion ? "Detalle de la lesión..." : "Detalle de la enfermedad...";
    
    // Función de cambio centralizada para manejar inputs y checkboxes
    const handleTextChange = (e) => setItem(which, idx, { text: e.target.value });
    const handleCheckboxChange = (e) => setItem(which, idx, { important: e.target.checked });

    return (
      <HStack key={`${which}-${idx}`} mt={2}>
        <Input
          placeholder={placeholderText}
          value={item.text}
          onChange={handleTextChange}
        />
        <Checkbox
          isChecked={item.important}
          onChange={handleCheckboxChange}
        >
          Importante
        </Checkbox>
        <IconButton
          aria-label="Eliminar"
          icon={<DeleteIcon />}
          onClick={() => removeItem(which, idx)}
          bg="#258d19"
          color="white"
          _hover={{ bg: "#1f7a14" }}
        />
      </HStack>
    );
  }
);

function SectionHeader({ title, onAdd }) {
  return (
    <HStack justify="space-between" mb={2}>
      <FormLabel m={0} fontSize="md" fontWeight="bold">{title}</FormLabel>
      <Button size="sm" leftIcon={<AddIcon />} onClick={onAdd} bg="#258d19" color="white" _hover={{ bg: "#1f7a14" }}>
        Agregar
      </Button>
    </HStack>
  );
}

/* =========================================================================
 * ⚙️ COMPONENTE PRINCIPAL
 * ========================================================================= */

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
    tipoDocumento: DOCUMENT_TYPES[0].code, // Nuevo campo
  });

  // Eliminamos checkingDni y setCheckingDni. dniDisponible solo se usará al hacer submit.
  const [dniDisponible, setDniDisponible] = useState(true); 
  const [lesiones, setLesiones] = useState([]);
  const [enfermedades, setEnfermedades] = useState([]);
  const [codigos, setCodigos] = useState([]);
  const [loadingCodigos, setLoadingCodigos] = useState(true);
  
  const hoy = new Date().toISOString().split("T")[0];
  const documentoLimpio = form.documento?.trim();

  // Códigos de área (fetch público) - Se mantiene igual
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

  // Validación de errores (uso de useMemo para optimizar)
  const errors = useMemo(() => {
    const e = {};
    if (!form.nombre?.trim()) e.nombre = "El nombre es obligatorio";
    if (!form.apellido?.trim()) e.apellido = "El apellido es obligatorio";
    
    // Nueva validación para Tipo de Documento
    if (!form.tipoDocumento) e.tipoDocumento = "Seleccioná el tipo de documento";
    
    if (!form.documento?.trim()) e.documento = "El número de documento es obligatorio";
    else if (!/^[0-9]+$/.test(form.documento)) e.documento = "El documento debe contener solo números";
    
    if (!form.fechaNac?.trim()) e.fechaNac = "La fecha de nacimiento es obligatoria";
    else {
      if (form.fechaNac > hoy) e.fechaNac = "La fecha no puede ser futura";
    }
    if (form.peso && !/^\d+(\.\d+)?$/.test(form.peso)) e.peso = "El peso debe ser numérico";
    if (form.altura && !/^\d+(\.\d+)?$/.test(form.altura)) e.altura = "La altura debe ser numérica";
    if (form.contactoNumero && !/^[0-9]+$/.test(form.contactoNumero)) e.contactoNumero = "El número debe ser numérico";
    return e;
  }, [form, hoy]);

  // 🛑 ELIMINAMOS EL useEffect DE VERIFICACIÓN DE DNI EN TIEMPO REAL 🛑
  // Esto es lo que causaba la lentitud. La verificación ahora solo se hace en onSubmit.
  // useEffect(() => { ... }, [form.documento]); // Código eliminado

  const isValid = Object.keys(errors).length === 0;
  // Handler para campos de formulario
  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  // Handler específico para Menú de Tipo de Documento
  const handleDocTypeChange = (code) => setForm((p) => ({ ...p, tipoDocumento: code }));


  const buildPayload = () => {
    const entrenadorRef = entrenadorId ? { id_entrenador: entrenadorId, id: entrenadorId } : null;
    return {
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      // ⚠️ Incluimos el tipo de documento en el payload
      tipoDocumento: form.tipoDocumento, 
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
    setDniDisponible(true); // Resetear estado antes del chequeo final
    try {
      // ✅ CHEQUEO DE DNI: SOLO AQUÍ (doble chequeo)
      // Usamos el tipo de documento en la consulta si el backend lo requiere.
      const dupRes = await axios.get(
        `/api/alumnos?documento=${encodeURIComponent(documentoLimpio)}&tipoDocumento=${form.tipoDocumento}`
      );
      const posibles = dupRes.data;
      if (Array.isArray(posibles) && posibles.length > 0) {
        setDniDisponible(false);
        toast({
          status: "error",
          title: "Documento duplicado",
          description: "El documento ya está registrado.",
          position: "top",
        });
        return; // Salir de la función si está duplicado
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

  // Lógica para añadir/modificar/eliminar ítems de Lesiones/Enfermedades
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

  // Buscamos el nombre del documento seleccionado para mostrarlo en la etiqueta
  const selectedDocType = DOCUMENT_TYPES.find(d => d.code === form.tipoDocumento);
  const docLabel = selectedDocType ? `${selectedDocType.name} (Número)` : "Documento (Número)";


  // =========================================================================
  // 🎨 RENDERIZADO
  // =========================================================================
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
                {/* Nombre */}
                <GridItem>
                  <FormControl isRequired isInvalid={submitted && !!errors.nombre}>
                    <FormLabel>Nombre</FormLabel>
                    <Input name="nombre" placeholder="Ej: Sofia" value={form.nombre} onChange={handleChange} />
                    {submitted && <FormErrorMessage>{errors.nombre}</FormErrorMessage>}
                  </FormControl>
                </GridItem>

                {/* Apellido */}
                <GridItem>
                  <FormControl isRequired isInvalid={submitted && !!errors.apellido}>
                    <FormLabel>Apellido</FormLabel>
                    <Input name="apellido" placeholder="Ej: Perez" value={form.apellido} onChange={handleChange} />
                    {submitted && <FormErrorMessage>{errors.apellido}</FormErrorMessage>}
                  </FormControl>
                </GridItem>

                {/* Tipo de Documento (NUEVO) */}
                <GridItem>
                    <FormControl isRequired isInvalid={submitted && !!errors.tipoDocumento}>
                        <FormLabel>Tipo de Documento</FormLabel>
                        <Menu>
                            <MenuButton 
                                as={Button} 
                                variant="outline" 
                                rightIcon={<ChevronDownIcon />} 
                                width="100%"
                                textAlign="left"
                            >
                                {selectedDocType?.name || "Seleccionar..."}
                            </MenuButton>
                            <MenuList zIndex={2000}>
                                {DOCUMENT_TYPES.map((d) => (
                                    <MenuItem 
                                        key={d.code}
                                        onClick={() => handleDocTypeChange(d.code)}
                                    >
                                        {d.name} ({d.code})
                                    </MenuItem>
                                ))}
                            </MenuList>
                        </Menu>
                        {submitted && <FormErrorMessage>{errors.tipoDocumento}</FormErrorMessage>}
                    </FormControl>
                </GridItem>

                {/* Documento (Número) - Área crítica de lentitud */}
                <GridItem>
                  <FormControl
                    isRequired
                    isInvalid={(submitted && !!errors.documento) || (submitted && !dniDisponible)}
                  >
                    {/* La etiqueta cambia dinámicamente */}
                    <FormLabel>{docLabel}</FormLabel>
                    <Input name="documento" placeholder="Ej: 41059876" value={form.documento} onChange={handleChange} />
                    
                    {/* Eliminamos el mensaje de 'Verificando' ya que se eliminó la verificación en tiempo real */}
                    
                    {submitted && errors.documento && (<FormErrorMessage>{errors.documento}</FormErrorMessage>)}
                    {/* El mensaje de duplicado se activa solo después de intentar submit */}
                    {submitted && !dniDisponible && (
                      <FormErrorMessage>Este documento ya está registrado.</FormErrorMessage>
                    )}
                  </FormControl>
                </GridItem>

                {/* Fecha de nacimiento */}
                <GridItem>
                  <FormControl isRequired isInvalid={submitted && !!errors.fechaNac}>
                    <FormLabel>Fecha de nacimiento</FormLabel>
                    <Input type="date" name="fechaNac" max={hoy} value={form.fechaNac} onChange={handleChange} />
                    {submitted && <FormErrorMessage>{errors.fechaNac}</FormErrorMessage>}
                  </FormControl>
                </GridItem>

                {/* Peso */}
                <GridItem>
                  <FormControl isInvalid={submitted && !!errors.peso}>
                    <FormLabel>Peso (kg)</FormLabel>
                    <Input type="number" name="peso" value={form.peso} onChange={handleChange} />
                  </FormControl>
                </GridItem>

                {/* Altura */}
                <GridItem>
                  <FormControl isInvalid={submitted && !!errors.altura}>
                    <FormLabel>Altura (cm)</FormLabel>
                    <Input type="number" name="altura" value={form.altura} onChange={handleChange} />
                  </FormControl>
                </GridItem>

                {/* Contacto */}
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
                          <MenuList maxH="280px" overflowY="auto" zIndex={2000}>
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
                    {submitted && errors.contactoNumero && (<FormErrorMessage>{errors.contactoNumero}</FormErrorMessage>)}
                  </FormControl>
                </GridItem>

                {/* Lesiones (Optimizadas con React.memo) */}
                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <SectionHeader title="Lesiones" onAdd={() => addItem("les")} />
                  {lesiones.length === 0 && <Badge mt={2}>Sin registros</Badge>}
                  {lesiones.map((it, idx) => (
                    <DetalleItem
                      key={`les-${idx}`}
                      item={it}
                      idx={idx}
                      which="les"
                      setItem={setItem}
                      removeItem={removeItem}
                    />
                  ))}
                </GridItem>

                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <Divider />
                </GridItem>

                {/* Enfermedades (Optimizadas con React.memo) */}
                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <SectionHeader title="Enfermedades" onAdd={() => addItem("dis")} />
                  {enfermedades.length === 0 && <Badge mt={2}>Sin registros</Badge>}
                  {enfermedades.map((it, idx) => (
                    <DetalleItem
                      key={`dis-${idx}`}
                      item={it}
                      idx={idx}
                      which="dis"
                      setItem={setItem}
                      removeItem={removeItem}
                    />
                  ))}
                </GridItem>

                {/* Informe Médico */}
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
                  _hover={{ bg: "#1f7a14" }}
                  // Solo se deshabilita por submit/cargando o si no hay entrenador. 
                  // El DNI duplicado es manejado por el chequeo de onSubmit.
                  isDisabled={submitting || !entrenadorId} 
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