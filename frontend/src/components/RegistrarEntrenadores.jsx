import { useState, useEffect } from "react";
import {
  Box, Button, FormControl, FormLabel, Input, Stack, Heading,
  Text, InputGroup, InputLeftAddon, Alert, AlertIcon, Spinner,
  Grid, GridItem, FormErrorMessage
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../config/axios.config";

export default function RegistroEntrenador() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    documento: "",
    email: "",
    telefono: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [dniDisponible, setDniDisponible] = useState(true);
  const [checkingDni, setCheckingDni] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Validación en tiempo real del DNI
  useEffect(() => {
    const checkDni = async () => {
      if (!form.documento || form.documento.trim().length < 7) return;
      setCheckingDni(true);
      try {
        const resp = await axiosInstance.get(`/api/entrenadores/validar-dni/${form.documento}`);
        setDniDisponible(resp.data.disponible);
      } catch (e) {
        console.error("Error validando DNI:", e);
      } finally {
        setCheckingDni(false);
      }
    };
    const timeout = setTimeout(checkDni, 500);
    return () => clearTimeout(timeout);
  }, [form.documento]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const errs = {};
    if (!form.nombre.trim()) errs.nombre = "El nombre es obligatorio.";
    if (!form.apellido.trim()) errs.apellido = "El apellido es obligatorio.";
    if (!form.documento.trim()) errs.documento = "El documento es obligatorio.";
    else if (form.documento.trim().length < 7)
      errs.documento = "Debe tener al menos 7 dígitos.";
    if (!form.email.trim()) errs.email = "El correo es obligatorio.";
    if (!form.telefono.trim()) errs.telefono = "El teléfono es obligatorio.";
    if (!form.password.trim()) errs.password = "La contraseña es obligatoria.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0 || !dniDisponible) return;

    try {
      await axiosInstance.post("/api/entrenadores/registro", form);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (e) {
      console.error(e);
      setError("Ocurrió un error al registrar el entrenador.");
    }
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={6}
    >
      <Box
        bg="white"
        p={8}
        rounded="2xl"
        boxShadow="xl"
        w="100%"
        maxW="700px"
      >
        <Heading textAlign="center" mb={6}>
          Registro de Entrenador
        </Heading>

        <form onSubmit={handleSubmit}>
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
            <GridItem>
              <FormControl
                isRequired
                isInvalid={submitted && !!errors.nombre}
              >
                <FormLabel>Nombre</FormLabel>
                <Input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Marcos"
                />
                {submitted && errors.nombre && (
                  <FormErrorMessage>{errors.nombre}</FormErrorMessage>
                )}
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl
                isRequired
                isInvalid={submitted && !!errors.apellido}
              >
                <FormLabel>Apellido</FormLabel>
                <Input
                  name="apellido"
                  value={form.apellido}
                  onChange={handleChange}
                  placeholder="Ej: Gómez"
                />
                {submitted && errors.apellido && (
                  <FormErrorMessage>{errors.apellido}</FormErrorMessage>
                )}
              </FormControl>
            </GridItem>

            {/* 🧠 Validación DNI en tiempo real */}
            <GridItem colSpan={{ base: 1, md: 2 }}>
              <FormControl
                isRequired
                isInvalid={
                  (submitted && !!errors.documento) ||
                  (!dniDisponible && form.documento.trim() !== "")
                }
              >
                <FormLabel>Documento (DNI)</FormLabel>
                <Input
                  name="documento"
                  placeholder="Ej: 40123456"
                  value={form.documento}
                  onChange={handleChange}
                />
                {checkingDni && (
                  <Text fontSize="sm" color="gray.500">
                    Verificando DNI...
                  </Text>
                )}
                {submitted && errors.documento && (
                  <FormErrorMessage>{errors.documento}</FormErrorMessage>
                )}
                {!dniDisponible && form.documento.trim() !== "" && (
                  <FormErrorMessage>
                    El documento ya está registrado.
                  </FormErrorMessage>
                )}
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl
                isRequired
                isInvalid={submitted && !!errors.email}
              >
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Ej: entrenador@gmail.com"
                />
                {submitted && errors.email && (
                  <FormErrorMessage>{errors.email}</FormErrorMessage>
                )}
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl
                isRequired
                isInvalid={submitted && !!errors.telefono}
              >
                <FormLabel>Teléfono</FormLabel>
                <InputGroup>
                  <InputLeftAddon children="+54" />
                  <Input
                    type="tel"
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    placeholder="1123456789"
                  />
                </InputGroup>
                {submitted && errors.telefono && (
                  <FormErrorMessage>{errors.telefono}</FormErrorMessage>
                )}
              </FormControl>
            </GridItem>

            <GridItem colSpan={{ base: 1, md: 2 }}>
              <FormControl
                isRequired
                isInvalid={submitted && !!errors.password}
              >
                <FormLabel>Contraseña</FormLabel>
                <Input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                />
                {submitted && errors.password && (
                  <FormErrorMessage>{errors.password}</FormErrorMessage>
                )}
              </FormControl>
            </GridItem>
          </Grid>

          {error && (
            <Alert status="error" rounded="md" mt={4}>
              <AlertIcon />
              {error}
            </Alert>
          )}

          {success && (
            <Alert status="success" rounded="md" mt={4}>
              <AlertIcon />
              Registro exitoso. Redirigiendo al login...
            </Alert>
          )}

          <Stack
            direction={{ base: "column", md: "row" }}
            spacing={4}
            mt={8}
            justify="center"
          >
            <Button
              type="submit"
              size="lg"
              px={10}
              bg="#258d19"
              color="white"
              _hover={{ bg: "green.500" }}
              loadingText="Guardando"
              isDisabled={checkingDni || !dniDisponible}
            >
              Crear cuenta
            </Button>

            <Button
              variant="outline"
              colorScheme="gray"
              size="lg"
              px={10}
              onClick={() => navigate(-1)}
              _hover={{ bg: "gray.100" }}
            >
              Cancelar
            </Button>
          </Stack>

        </form>
      </Box>
    </Box>
  );
}
