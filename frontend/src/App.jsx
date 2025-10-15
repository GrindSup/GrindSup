import { Box, Container } from "@chakra-ui/react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import InicioDashboard from "./pages/InicioDashboard";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Login from "./components/Login";
import PantallaInicio from "./components/Inicio";

import RegistrarAlumnoForm from "./pages/Alumno/RegistrarAlumnoForm";
import AlumnoList from "./components/AlumnoList";
import ListaTurnos from "./pages/Turnos/ListaTurnos.jsx";
import RegistrarTurno from "./pages/Turnos/RegistrarTurno.jsx";
import DetalleTurno from "./pages/Turnos/DetalleTurno.jsx";
import CalendarioTurnos from "./pages/Turnos/CalendarioTurnos.jsx";
import EditarAlumnoForm from "./pages/Alumno/EditarAlumnoForm";
import PerfilAlumno from "./pages/Alumno/PerfilAlumno";
import RegistrarEjercicio from "./pages/Ejercicios/RegistrarEjercicio.jsx"

import ForgotPassword from "./pages/Usuarios/ForgotPassword";
import ResetPassword from "./pages/Usuarios/ResetPassword";
import ListaEjercicios from "./pages/Ejercicios/ListaEjercicios.jsx";
import DetalleEjercicio from "./pages/Ejercicios/DetalleEjercicio.jsx";

export default function App() {
  const [usuario, setUsuario] = useState(() => {
    const saved = localStorage.getItem("usuario");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (usuario) {
      localStorage.setItem("usuario", JSON.stringify(usuario));
    } else {
      localStorage.removeItem("usuario");
      localStorage.removeItem("sesionId");
    }
  }, [usuario]);
// ... (imports y estados)

  return (
    <BrowserRouter>
      <Box minH="100vh" display="flex" flexDirection="column" bg="#228B22">
        <Header usuario={usuario} setUsuario={setUsuario} />
        <Box as="main" flex="1" py={{ base: 6, md: 10 }}>
          <Container maxW="container.xl">
            <Routes>
              {/* PÚBLICAS */}
              <Route path="/" element={<PantallaInicio usuario={usuario} />} />
              <Route path="/login" element={<Login setUsuario={setUsuario} />} />
              <Route path="/forgot" element={<ForgotPassword />} />
              <Route path="/reset" element={<ResetPassword />} />

              {/* PRIVADAS (si no hay usuario, redirige a /login) */}
              <Route
                path="/alumnos"
                element={usuario ? <AlumnoList /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/alumno/registrar"
                element={usuario ? <RegistrarAlumnoForm /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/alumno/editar/:id"
                element={usuario ? <EditarAlumnoForm /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/turnos"
                element={usuario ? <ListaTurnos /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/turnos/registrar"
                element={usuario ? <RegistrarTurno /> : <Navigate to="/login" replace />}
              />
              {/* ✅ RUTA CORREGIDA: Coincide con el `Maps` del botón "Editar" */}
              <Route
                path="/turnos/editar/:id"
                element={usuario ? <DetalleTurno /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/turnos/calendario"
                element={usuario ? <CalendarioTurnos /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/alumno/perfil/:id"
                element={usuario ? <PerfilAlumno /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/dashboard"
                element={usuario ? <InicioDashboard /> : <Navigate to="/login" replace />}
              />

              <Route
                path="/ejercicios"
                element={usuario ? <ListaEjercicios /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/ejercicio/registrar"
                element={usuario ? <RegistrarEjercicio /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/ejercicio/visualizar"
                element={usuario ? <DetalleEjercicio /> : <Navigate to="/login" replace />}
              />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Container>
        </Box>
        <Footer />
      </Box>
    </BrowserRouter>
  );
}