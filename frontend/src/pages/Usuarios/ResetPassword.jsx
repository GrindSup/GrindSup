import { useState } from "react";
import {
  Box, Card, CardBody, CardHeader, Heading,
  FormControl, FormLabel, Input, InputGroup, InputRightElement,
  Button, Text, useToast
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import { restablecerContrasena } from "../../services/recupero.servicio";

function CenteredCard({ title, children }) {
  return (
    <Box minH="100vh" bg="#007000" display="flex" alignItems="center" justifyContent="center" p={4}>
      <Card w="full" maxW="420px" bg="white">
        <CardHeader><Heading size="lg" textAlign="center">{title}</Heading></CardHeader>
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
      <CenteredCard title="Restablecer contraseña">
        <Text>Falta el token en el enlace.</Text>
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

    try {
      setLoading(true);
      const { ok } = await restablecerContrasena(token, pwd);
      if (ok) {
        toast({ status: "success", title: "Contraseña actualizada" });
        navigate("/login");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.mensaje
        || "El enlace pudo expirar o ser inválido.";
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
            />
            <InputRightElement>
              <Button size="sm" colorScheme="green" onClick={() => setShow((s) => !s)} bg="#258d19" color="white">
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
          />
        </FormControl>

        <Button type="submit" colorScheme="green" isLoading={loading} w="full" bg="#258d19" color="white">
          Guardar nueva contraseña
        </Button>
      </form>
    </CenteredCard>
  );
}
