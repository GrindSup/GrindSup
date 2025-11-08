// src/components/Contacto.jsx
import React, { useState, useMemo } from "react";
import {
  Box, Button, Container, FormControl, FormLabel, Input,
  Textarea, FormErrorMessage, Heading, Text, Stack, useToast,
  Card, CardBody, CardHeader, Flex, Icon
} from "@chakra-ui/react";
import { MdEmail } from "react-icons/md";

export default function Contacto() {
  const toast = useToast();

  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    mensaje: ""
  });

  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const errors = useMemo(() => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "El nombre es obligatorio";
    if (!form.correo.trim()) e.correo = "El correo es obligatorio";
    else if (!/^[\w.-]+@[\w.-]+\.\w{2,4}$/.test(form.correo))
      e.correo = "Correo no válido";
    if (!form.mensaje.trim()) e.mensaje = "El mensaje no puede estar vacío";
    return e;
  }, [form]);

  const isValid = Object.keys(errors).length === 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);

    if (!isValid) return;

    setSending(true);
    setTimeout(() => {
      toast({
        title: "Mensaje enviado",
        description: "Gracias por contactarnos, te responderemos pronto.",
        status: "success",
        position: "top",
        duration: 5000,
        isClosable: true,
      });
      setForm({ nombre: "", correo: "", mensaje: "" });
      setSubmitted(false);
      setSending(false);
    }, 1000);
  };

  return (
    <Box py={{ base: 4, md: 6 }}>
      <Container maxW="lg"> {/* Limita ancho para que sea más cuadrado */}
        <Card
          boxShadow="2xl"
          borderRadius="2xl"
          bg="white"
          border="none"
          overflow="hidden"
          p={0}
          minH="400px"  // Altura mínima para forma cuadrada
        >
          <CardHeader bg="#007000" color="white" textAlign="center" py={4}>
            <Flex align="center" justify="center" mb={2}>
              <Icon as={MdEmail} boxSize={6} mr={2} />
              <Heading size="lg">Contacto</Heading>
            </Flex>
            <Text color="white" fontSize="md">
              Si tienes alguna consulta o sugerencia, escribinos y te responderemos a la brevedad.
            </Text>
          </CardHeader>

          <CardBody pt={4} px={5} pb={4}>
            <Box as="form" onSubmit={handleSubmit}>
              <Stack spacing={4}>
                <FormControl isRequired isInvalid={submitted && !!errors.nombre}>
                  <FormLabel fontSize="md">Nombre</FormLabel>
                  <Input
                    size="sm"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="Carlos"
                    borderColor="gray.300"
                    _focus={{ borderColor: "#258d19", boxShadow: "0 0 0 1px #258d19" }} // al hacer focus
                  />
                  {submitted && <FormErrorMessage fontSize="xs">{errors.nombre}</FormErrorMessage>}
                </FormControl>

                <FormControl isRequired isInvalid={submitted && !!errors.correo}>
                  <FormLabel fontSize="md">Correo</FormLabel>
                  <Input
                    size="sm"
                    name="correo"
                    value={form.correo}
                    onChange={handleChange}
                    placeholder="******@gmail.com"
                    borderColor="gray.300"
                    _focus={{ borderColor: "#258d19", boxShadow: "0 0 0 1px #258d19" }} // al hacer focus
                  />
                  {submitted && <FormErrorMessage fontSize="xs">{errors.correo}</FormErrorMessage>}
                </FormControl>

                <FormControl isRequired isInvalid={submitted && !!errors.mensaje}>
                  <FormLabel fontSize="md">Mensaje</FormLabel>
                  <Textarea
                    size="sm"
                    name="mensaje"
                    value={form.mensaje}
                    onChange={handleChange}
                    placeholder="Escribí tu mensaje aquí..."
                    minH="120px"
                    borderColor="gray.300"
                    _focus={{ borderColor: "#258d19", boxShadow: "0 0 0 1px #258d19" }} // al hacer focus
                  />
                  {submitted && <FormErrorMessage fontSize="xs">{errors.mensaje}</FormErrorMessage>}
                </FormControl>

                <Button
                  type="submit"
                  bg="#258d19"
                  color="white"
                  isLoading={sending}
                  size="md"
                  mt={2}
                >
                  Enviar
                </Button>
              </Stack>
            </Box>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
}