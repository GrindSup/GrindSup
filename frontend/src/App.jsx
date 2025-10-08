import { Box, Container } from "@chakra-ui/react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

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

export default function App() {
  const [usuario, setUsuario] = useState(() => {
    const saved = localStorage.getItem("usuario");
    return saved ? JSON.parse(saved) : null;
  });

  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (usuario) {
      localStorage.setItem("usuario", JSON.stringify(usuario));
      setShowLogin(false);
    } else {
      localStorage.removeItem("usuario");
      localStorage.removeItem("sesionId");
    }
  }, [usuario]);

  return (
    <BrowserRouter>
      <Box minH="100vh" display="flex" flexDirection="column">
        <Header usuario={usuario} setUsuario={setUsuario} setShowLogin={setShowLogin} />
        <Box as="main" flex="1" py={{ base: 6, md: 10 }}>
              <Routes>
                <Route path="/alumnos" element={<AlumnoList />} />
                <Route path="/alumno/registrar" element={<RegistrarAlumnoForm />} />
                <Route path="/alumno/editar/:id" element={<EditarAlumnoForm />} />
                <Route path="/turnos" element={<ListaTurnos />} />
                <Route path="/turnos/registrar" element={<RegistrarTurno />} />
                <Route path="/turnos/:id" element={<DetalleTurno />} />
                <Route path="/turnos/calendario" element={<CalendarioTurnos />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
        </Box>
        <Footer />
      </Box>
    </BrowserRouter>
  );
}
