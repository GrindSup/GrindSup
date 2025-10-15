import { useState } from "react";
import {
  Box, Card, CardBody, CardHeader, Heading,
  FormControl, FormLabel, Input, Button, Text, useToast
} from "@chakra-ui/react";
import { solicitarRecupero } from "../../services/recupero.servicio";

export default function ForgotPassword() {
  const [correo, setCorreo] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const onSubmit = async (e) => {
    e.preventDefault();
    const value = (correo || "").trim();
    if (!value) {
      toast({ status: "warning", title: "Ingresá tu correo." });
      return;
    }

    try {
      setLoading(true);
      await solicitarRecupero(value);
      toast({
        status: "success",
        title: "Si el correo existe, te enviamos un enlace",
        description: "Revisá tu bandeja de entrada o spam.",
      });
      setCorreo("");
    } catch {
      // Para no filtrar usuarios respondemos igual
      toast({ status: "success", title: "Si el correo existe, te enviamos un enlace" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="#228B22" display="flex" alignItems="center" justifyContent="center" p={4}>
      <Card w="full" maxW="420px" bg="white">
        <CardHeader><Heading size="lg" textAlign="center">Recuperar contraseña</Heading></CardHeader>
        <CardBody as="form" onSubmit={onSubmit}>
          <FormControl mb={4}>
            <FormLabel>Correo electrónico</FormLabel>
            <Input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="tucorreo@ejemplo.com"
              autoComplete="email"
            />
          </FormControl>
          <Button type="submit" colorScheme="green" isLoading={loading} w="full" bg="#0f4d11ff">Enviar enlace</Button>
          <Text mt={4} fontSize="sm" color="gray.600">
            Te enviaremos un enlace válido por unos minutos.
          </Text>
        </CardBody>
      </Card>
    </Box>
  );
}
