import { useState } from "react";
import {
  Box, Card, CardBody, CardHeader, Heading,
  FormControl, FormLabel, Input, InputGroup, InputRightElement,
  Button, Text, useToast
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import { restablecerContrasena, verifPasswordActual } from "../../services/recupero.servicio";

function CenteredCard({ title, children }) {
  return (
    <Box
      minH="100vh"
      bgImage="url('/img/gym-bg.jpg')"
      bgSize="cover"
      bgPosition="center"
      sx={{ backdropFilter: "brightness(0.47)" }}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Card w="full" maxW="420px" bg="white" borderRadius="2xl" boxShadow="2xl">
        <CardHeader>
          <Heading size="lg" textAlign="center" color="#258d19">
            {title}
          </Heading>
        </CardHeader>
        <CardBody>{children}</CardBody>
      </Card>
    </Box>
  );
}

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const navigate = useNavigate();

  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  if (!token) {
    return (
      <CenteredCard title="Error">
        <Text>No se encontró el token para restablecer la contraseña.</Text>
      </CenteredCard>
    );
  }

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!pwd || !pwd2) {
      toast({ status: "warning", title: "Completá ambos campos" });
      return;
    }
    if (pwd !== pwd2) {
      toast({ status: "error", title: "Las contraseñas no coinciden" });
      return;
    }
    if (pwd.length < 6) {
      toast({ status: "warning", title: "La contraseña debe tener al menos 6 caracteres" });
      return;
    }

    try {
      setLoading(true);

      const { misma } = await verifPasswordActual(token, pwd);
      if (misma) {
        toast({ status: "error", title: "No podés usar tu contraseña anterior." });
        setLoading(false);
        return;
      }

      const { ok } = await restablecerContrasena(token, pwd);

      if (ok) {
        toast({ status: "success", title: "Contraseña actualizada" });
        navigate("/login");
      }

    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.mensaje ||
        "El enlace pudo expirar o ser inválido.";
      toast({ status: "error", title: "No se pudo restablecer", description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <CenteredCard title="Restablecer contraseña">
      <form onSubmit={onSubmit}>
        <FormControl mb={4}>
          <FormLabel>Nueva contraseña</FormLabel>
          <InputGroup>
            <Input
              type={show ? "text" : "password"}
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              autoComplete="new-password"
              bg="gray.50"
            />
            <InputRightElement>
              <Button size="sm" onClick={() => setShow((s) => !s)} bg="#258d19" color="white">
                {show ? <ViewOffIcon /> : <ViewIcon />}
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>

        <FormControl mb={6}>
          <FormLabel>Repetir contraseña</FormLabel>
          <Input
            type={show ? "text" : "password"}
            value={pwd2}
            onChange={(e) => setPwd2(e.target.value)}
            autoComplete="new-password"
            bg="gray.50"
          />
        </FormControl>

        <Button
          type="submit"
          isLoading={loading}
          w="full"
          bg="#258d19"
          color="white"
          borderRadius="full"
          _hover={{ bg: "#1e7416" }}
        >
          Guardar nueva contraseña
        </Button>
      </form>
    </CenteredCard>
  );
}
