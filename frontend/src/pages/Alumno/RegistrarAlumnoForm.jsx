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
 * 📦 HOOK PARA DEBOUNCE
 * ========================================================================= */
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}


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

// 🛑 MODIFICADO: Función stringifyNotes para incluir la fecha para lesiones
function stringifyNotes(items, which) {
  const isLesion = which === "les";
  const list = (items || [])
    .map((i) => ({ 
      text: String(i.text ?? "").trim(), 
      important: !!i.important,
      // Incluir la fecha solo si es una lesión
      fecha: isLesion ? i.fecha : undefined 
    }))
    .filter((i) => i.text);
  return JSON.stringify({ items: list });
}

/* ⚡ Componente para Optimización de Rendimiento (React.memo) */
// 🛑 MODIFICADO: Componente DetalleItem para incluir la fecha de lesión
const DetalleItem = React.memo(
  function DetalleItem({ item, idx, which, setItem, removeItem, maxDate }) {
    const isLesion = which === "les";
    const placeholderText = isLesion ? "Detalle de la lesión..." : "Detalle de la enfermedad...";
    
    const handleTextChange = (e) => setItem(which, idx, { text: e.target.value });
    const handleCheckboxChange = (e) => setItem(which, idx, { important: e.target.checked });
    const handleDateChange = (e) => setItem(which, idx, { fecha: e.target.value });

    return (
      <Box p={3} border="1px" borderColor="gray.200" borderRadius="md" mt={2} bg="gray.50">
        <HStack justify="space-between" mb={3}>
            <Text fontWeight="bold" fontSize="sm">{isLesion ? `Lesión ${idx + 1}` : `Enfermedad ${idx + 1}`}</Text>
            <IconButton
                aria-label="Eliminar"
                icon={<DeleteIcon />}
                onClick={() => removeItem(which, idx)}
                bg="#258d19"
                color="white"
                _hover={{ bg: "#1f7a14" }}
                size="xs"
            />
        </HStack>
        <Stack spacing={2}>
            {/* 🛑 NUEVO CAMPO: Fecha de la lesión (solo para lesiones) */}
            {isLesion && (
                <FormControl isRequired={isLesion} isInvalid={isLesion && !item.fecha}>
                    <FormLabel fontSize="xs" mb={1}>Fecha de la lesión</FormLabel>
                    <Input 
                        type="date" 
                        max={maxDate}
                        value={item.fecha || ''} 
                        onChange={handleDateChange} 
                        size="sm"
                    />
                    {isLesion && !item.fecha && (
                        <FormErrorMessage fontSize="sm">La fecha es obligatoria</FormErrorMessage>
                    )}
                </FormControl>
            )}

            <FormControl isRequired>
                <FormLabel fontSize="xs" mb={1}>Descripción</FormLabel>
                <Input
                    placeholder={placeholderText}
                    value={item.text}
                    onChange={handleTextChange}
                    size="sm"
                />
            </FormControl>
            
            <Checkbox
                isChecked={item.important}
                onChange={handleCheckboxChange}
                size="sm"
            >
                Importante
            </Checkbox>
        </Stack>
      </Box>
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
    tipoDocumento: DOCUMENT_TYPES[0].code,
  });

  // Estados para el chequeo de DNI
  const [checkingDni, setCheckingDni] = useState(false); 
  const [dniDisponible, setDniDisponible] = useState(true); 

  // Estados para lesiones y enfermedades
  const [lesiones, setLesiones] = useState([]);
  const [enfermedades, setEnfermedades] = useState([]);
  
  // Estados para códigos de área
  const [codigos, setCodigos] = useState([]);
  const [loadingCodigos, setLoadingCodigos] = useState(true);
  
  const hoy = new Date().toISOString().split("T")[0];
  const documentoLimpio = form.documento?.trim();
  const debouncedDocumento = useDebounce(documentoLimpio, 500); 

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
    
    // 🛑 NUEVO: Validación de fecha de lesión
    lesiones.forEach((lesion, index) => {
        if (!lesion.text.trim() || (lesion.text.trim() && !lesion.fecha)) {
            // No creamos un error específico en el objeto errors, sino que confiamos en la validación inline del DetalleItem.
        }
    });

    return e;
  }, [form, hoy, lesiones]); // Añadir 'lesiones' a las dependencias

  /* -------------------------------------------------------------
  * 1. useEffect para activar el estado 'Verificando' (Visual Inmediata)
  * ------------------------------------------------------------- */
  useEffect(() => {
    const isReadyForCheck = documentoLimpio && !errors.documento && documentoLimpio.length >= 6;
    
    // Si el documento es válido y el valor actual es diferente del valor debounced,
    // significa que el usuario está escribiendo y la verificación está en curso (esperando debounce).
    if (isReadyForCheck && documentoLimpio !== debouncedDocumento) {
        setCheckingDni(true);
    } 
    // Si el campo se borra o es demasiado corto, reseteamos la disponibilidad y la verificación
    else if (!isReadyForCheck && documentoLimpio.length < 6) {
      setDniDisponible(true);
      setCheckingDni(false); 
    }
  }, [documentoLimpio, errors.documento, debouncedDocumento]); 


  /* -------------------------------------------------------------
  * 2. useEffect para realizar la llamada a la API (Debounce)
  * ------------------------------------------------------------- */
  useEffect(() => {
    // 1. Limpiar error de submit si el usuario edita
    if (submitted && dniDisponible === false) {
        setDniDisponible(true);
    }
    
    // 2. Solo ejecutar si el valor debounced es válido y tiene largo suficiente
    if (debouncedDocumento && !errors.documento && debouncedDocumento.length >= 6) {

      const checkDni = async () => {
        try {
          const res = await axios.get("/api/alumnos/exists", {
            params: { documento: debouncedDocumento },
          });
          const existe = res.data?.exists;
          
          setDniDisponible(!existe);
          
        } catch (err) {
          console.error("Error al chequear DNI en tiempo real", err);
        } finally {
          // 3. Setear a false *solo* después de que la API responde
          setCheckingDni(false); 
        }
      };

      checkDni();
    } else {
      // Si el valor debounced es vacío o inválido, nos aseguramos de que el spinner se oculte
      setCheckingDni(false);
    }
    
  }, [debouncedDocumento, errors.documento, submitted]); 

  // 🚀 NUEVA FUNCIÓN: Calcula la fecha de hoy en formato YYYY-MM-DD
    const maxDate = useMemo(() => {
        const d = new Date();
        const year = d.getFullYear();
        // Los meses de JS van de 0 a 11, por eso sumamos 1
        const month = String(d.getMonth() + 1).padStart(2, '0'); 
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }, []);

  const isValid = Object.keys(errors).length === 0;
  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleDocTypeChange = (code) => setForm((p) => ({ ...p, tipoDocumento: code }));


  const buildPayload = () => {
    const entrenadorRef = entrenadorId ? { id_entrenador: entrenadorId, id: entrenadorId } : null;
    return {
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      tipoDocumento: form.tipoDocumento, 
      documento: form.documento.trim(),
      fechaNacimiento: form.fechaNac,
      peso: form.peso ? Number(form.peso) : null,
      altura: form.altura ? Number(form.altura) : null,
      informeMedico: form.informeMedico,
      telefono: form.codigoArea + form.contactoNumero,
      // 🛑 MODIFICADO: Pasar 'which' para distinguir lesiones de enfermedades
      lesiones: stringifyNotes(lesiones, "les"), 
      enfermedades: stringifyNotes(enfermedades, "dis"),
      estado: { id_estado: 1 },
      entrenador: entrenadorRef,
    };
  };

  const submitMock = () => new Promise((r) => setTimeout(() => r({ ok: true }), 700));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    
    // Validar que todas las lesiones tengan descripción Y fecha.
    const hasIncompleteLesion = lesiones.some(l => !l.text.trim() || !l.fecha);
    
    if (!isValid || !dniDisponible || checkingDni || hasIncompleteLesion) {
      toast({ status: "warning", title: "Revisá los campos obligatorios o el documento", position: "top" });
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
      // 🛑 MODIFICADO: Añadir 'fecha' al inicializar la lesión
      setLesiones((p) => [...p, { text: "", important: false, fecha: "" }]); 
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
                {/* Nombre y Apellido */}
                <GridItem>
                  <FormControl isRequired isInvalid={submitted && !!errors.nombre}>
                    <FormLabel>Nombre</FormLabel>
                    <Input name="nombre" placeholder="Ej: Sofia" value={form.nombre} onChange={handleChange} />
                    {submitted && <FormErrorMessage>{errors.nombre}</FormErrorMessage>}
                  </FormControl>
                </GridItem>

                <GridItem>
                  <FormControl isRequired isInvalid={submitted && !!errors.apellido}>
                    <FormLabel>Apellido</FormLabel>
                    <Input name="apellido" placeholder="Ej: Perez" value={form.apellido} onChange={handleChange} />
                    {submitted && <FormErrorMessage>{errors.apellido}</FormErrorMessage>}
                  </FormControl>
                </GridItem>

                {/* Tipo de Documento */}
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

                {/* Documento (Número) */}
                <GridItem>
                  <FormControl
                    isRequired
                    isInvalid={(submitted && !!errors.documento) || (!dniDisponible && !checkingDni)}
                  >
                    <FormLabel>{docLabel}</FormLabel>
                    <Input name="documento" placeholder="Ej: 41059876" value={form.documento} onChange={handleChange} />
                    
                    {/* INDICADOR DE CARGA Y ESTADO (PRIORIZA CHECKING) */}
                    <HStack mt={1} spacing={2} align="center">
                        {/* Se muestra solo si checkingDni es true (Verificación Inmediata) */}
                        {checkingDni && (
                            <HStack color="green.500">
                                <Spinner size="sm" />
                                <Text fontSize="sm">Verificando...</Text>
                            </HStack>
                        )}
                        {/* Se muestra si NO está chequeando Y el campo no está vacío/inválido */}
                        {!checkingDni && documentoLimpio && !errors.documento && (
                            dniDisponible ? (
                                <Badge colorScheme="green">Disponible</Badge>
                            ) : (
                                <Badge colorScheme="red">Duplicado</Badge>
                            )
                        )}
                    </HStack>
                    
                    {/* MENSAJES DE ERROR */}
                    {(submitted && errors.documento) && (<FormErrorMessage>{errors.documento}</FormErrorMessage>)}
                    
                    {/* El mensaje de duplicado se activa si no está disponible Y no se está chequeando */}
                    {!dniDisponible && !checkingDni && (
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

                {/* Peso y Altura */}
                <GridItem>
                  <FormControl isInvalid={submitted && !!errors.peso}>
                    <FormLabel>Peso (kg)</FormLabel>
                    <Input type="number" name="peso" value={form.peso} onChange={handleChange} />
                  </FormControl>
                </GridItem>

                <GridItem>
                  <FormControl isInvalid={submitted && !!errors.altura}>
                    <FormLabel>Altura (m)</FormLabel>
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

                {/* Lesiones (Con Campo de Fecha) */}
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
                      maxDate={maxDate}
                    />
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
                  isLoading={submitting || checkingDni}
                  loadingText="Guardando"
                  px={10}
                  bg="#258d19"
                  color="white"
                  _hover={{ bg: "#1f7a14" }}
                  // Se deshabilita si está cargando, si el DNI está en proceso de chequeo, o si está duplicado
                  isDisabled={submitting || !entrenadorId || checkingDni || !dniDisponible} 
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