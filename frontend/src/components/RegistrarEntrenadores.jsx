import { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Text,
  Stack,
  Alert,
  AlertIcon
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import api from "../config/axios.config";

export default function RegistrarEntrenadores() {
  const navigate = useNavigate();

  const [entrenador, setEntrenador] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    contrasena: "",
    telefono: "",
    experiencia: ""
  });

  const [errors, setErrors] = useState({ correo: "" });

  const validarGmail = (correo) => correo.endsWith("@gmail.com");

  const handleChange = (e) => {
    const { name, value } = e.target;

    // ✅ Para teléfono: solo números
    if (name === "telefono") {
      const soloNumeros = value.replace(/\D/g, "");
      return setEntrenador((prev) => ({ ...prev, telefono: soloNumeros }));
    }

    setEntrenador((prev) => ({ ...prev, [name]: value }));

    if (name === "correo") {
      setErrors((prev) => ({
        ...prev,
        correo: validarGmail(value) ? "" : "El correo debe ser @gmail.com"
      }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!entrenador.nombre || !entrenador.apellido || !entrenador.correo || !entrenador.contrasena) return;
    if (!validarGmail(entrenador.correo)) return;

    const payload = {
      usuario: {
        nombre: entrenador.nombre,
        apellido: entrenador.apellido,
        correo: entrenador.correo,
        contrasena: entrenador.contrasena
      },
      telefono: "+54 " + entrenador.telefono,
      experiencia: entrenador.experiencia
    };

    try {
      await api.post("/api/entrenadores", payload);
      navigate("/login");
    } catch (error) {
      console.log("Error:", error);
    }
  };

  const correoInvalido = !!errors.correo;

  return (
    <Box maxW="md" mx="auto" mt={10} p={8} borderWidth={1} borderRadius="lg" boxShadow="lg" bg="white">
      <Text fontSize="2xl" fontWeight="bold" mb={6} textAlign="center" color="black">
        Registrar Entrenador
      </Text>

      <form onSubmit={onSubmit}>

        <FormControl isRequired mb={4}>
          <FormLabel>Nombre</FormLabel>
          <Input name="nombre" value={entrenador.nombre} onChange={handleChange} />
        </FormControl>

        <FormControl isRequired mb={4}>
          <FormLabel>Apellido</FormLabel>
          <Input name="apellido" value={entrenador.apellido} onChange={handleChange} />
        </FormControl>

        <FormControl isRequired isInvalid={correoInvalido} mb={correoInvalido ? 2 : 4}>
          <FormLabel>Correo electrónico</FormLabel>
          <Input type="email" name="correo" value={entrenador.correo} onChange={handleChange} placeholder="*****@gmail.com" />
        </FormControl>

        {correoInvalido && (
          <Alert status="error" mb={4}>
            <AlertIcon />
            {errors.correo}
          </Alert>
        )}

        <FormControl isRequired mb={4}>
          <FormLabel>Contraseña</FormLabel>
          <Input type="password" name="contrasena" value={entrenador.contrasena} onChange={handleChange} />
        </FormControl>

        <FormControl mb={4}>
          <FormLabel>Teléfono</FormLabel>
          <Stack direction="row" spacing={2} align="center">
            <Text bg="gray.100" px={3} py={2} borderRadius="md" fontWeight="bold">
              +54
            </Text>

            <Input
              name="telefono"
              value={entrenador.telefono}
              onChange={handleChange}
              placeholder="1112345678"
            />
          </Stack>
        </FormControl>

        <FormControl mb={6}>
          <FormLabel>Experiencia</FormLabel>
          <Textarea
            name="experiencia"
            value={entrenador.experiencia}
            onChange={handleChange}
            placeholder="Ej: 2 años como entrenador de musculación"
          />
        </FormControl>

        <Stack direction="row" spacing={4} justify="center">
          <Button bg="#258d19" color="white" type="submit" isDisabled={correoInvalido}>
            Registrar
          </Button>
          <Button variant="outline" onClick={() => navigate("/")}>
            Cancelar
          </Button>
        </Stack>

      </form>
    </Box>
  );
}