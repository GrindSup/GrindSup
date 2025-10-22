// frontend/src/App.jsx
import { Box, Container } from "@chakra-ui/react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

// Páginas/Componentes
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

import ForgotPassword from "./pages/Usuarios/ForgotPassword";
import ResetPassword from "./pages/Usuarios/ResetPassword";

// ✅ Planes
import ListaPlanes from "./pages/Planes/ListaPlanes.jsx";
import RegistrarPlan from "./pages/Planes/RegistrarPlan.jsx";
import DetallePlan from "./pages/Planes/DetallePlan.jsx";
import EditarPlan from "./pages/Planes/EditarPlan.jsx"; // ⬅️ nuevo

// ✅ Rutinas
import ListaRutinas from "./pages/Rutinas/ListaRutinas.jsx";
import NuevaRutina from "./pages/Rutinas/NuevaRutina.jsx";
import DetalleRutina from "./pages/Rutinas/DetalleRutina.jsx";

// ✅ Ejercicios
import ListaEjercicios from "./pages/Ejercicios/ListaEjercicios.jsx";

// --- Placeholders mínimos para registrar/editar/detalle de ejercicio ---
// Reemplazá estos tres por tus páginas reales cuando las tengas.
function Placeholder({ title }) {
  return (
    <Box bg="white" borderRadius="2xl" p={{ base: 6, md: 8 }}>
      {title}
    </Box>
  );
}
const RegistrarEjercicio = () => <Placeholder title={"Registrar Ejercicio — próximamente"} />;
const EditarEjercicio = () => <Placeholder title={"Editar Ejercicio — próximamente"} />;
const DetalleEjercicio = () => <Placeholder title={"Detalle de Ejercicio — próximamente"} />;

// ✅ Ejercicios
import ListaEjercicios from "./pages/Ejercicios/ListaEjercicios.jsx";

// --- Placeholders mínimos para registrar/editar/detalle de ejercicio ---
// Reemplazá estos tres por tus páginas reales cuando las tengas.
function Placeholder({ title }) {
  return (
    <Box bg="white" borderRadius="2xl" p={{ base: 6, md: 8 }}>
      {title}
    </Box>
  );
}
const RegistrarEjercicio = () => <Placeholder title={"Registrar Ejercicio — próximamente"} />;
const EditarEjercicio = () => <Placeholder title={"Editar Ejercicio — próximamente"} />;
const DetalleEjercicio = () => <Placeholder title={"Detalle de Ejercicio — próximamente"} />;

export default function App() {
  const [usuario, setUsuario] = useState(() => {
    const saved = localStorage.getItem("usuario");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (usuario) localStorage.setItem("usuario", JSON.stringify(usuario));
    else {
      localStorage.removeItem("usuario");
      localStorage.removeItem("sesionId");
    }
  }, [usuario]);

  const guard = (el) => (usuario ? el : <Navigate to="/login" replace />);

  return (
    <BrowserRouter>
      <Box minH="100vh" display="flex" flexDirection="column" bg="#228B22">
        <Header usuario={usuario} setUsuario={setUsuario} />
        <Box as="main" flex="1" py={{ base: 6, md: 10 }}>
          <Container maxW="container.xl">
            <Routes>
              {/* Home → Dashboard si hay sesión; Landing si no */}
              <Route path="/" element={usuario ? <InicioDashboard /> : <PantallaInicio />} />

              {/* Públicas */}
              <Route path="/login" element={<Login setUsuario={setUsuario} />} />
              <Route path="/forgot" element={<ForgotPassword />} />
              <Route path="/reset" element={<ResetPassword />} />

              {/* Alumnos */}
              <Route path="/alumnos" element={guard(<AlumnoList />)} />
              <Route path="/alumno/registrar" element={guard(<RegistrarAlumnoForm />)} />
              <Route path="/alumno/editar/:id" element={guard(<EditarAlumnoForm />)} />
              <Route path="/alumno/perfil/:id" element={guard(<PerfilAlumno />)} />

              {/* Turnos */}
              <Route path="/turnos" element={guard(<ListaTurnos />)} />
              <Route path="/turnos/registrar" element={guard(<RegistrarTurno />)} />
              <Route path="/turnos/editar/:id" element={guard(<DetalleTurno />)} />
              <Route path="/turnos/calendario" element={guard(<CalendarioTurnos />)} />

              {/* ✅ Planes */}
              <Route path="/planes" element={guard(<ListaPlanes />)} />
              <Route path="/planes/nuevo" element={guard(<RegistrarPlan />)} />
              <Route path="/planes/:idPlan" element={guard(<DetallePlan />)} />
<<<<<<< HEAD
              <Route path="/planes/:idPlan/editar" element={guard(<EditarPlan />)} /> {/* ⬅️ ahora funciona */}
=======
>>>>>>> b9eb8b0d452b931b230a40358fd08cd6218041df

              {/* ✅ Rutinas (global + por plan) */}
              <Route path="/rutinas" element={guard(<ListaRutinas />)} />
              <Route path="/planes/:idPlan/rutinas" element={guard(<ListaRutinas />)} />
              <Route path="/planes/:idPlan/rutinas/nueva" element={guard(<NuevaRutina />)} />
              <Route path="/planes/:idPlan/rutinas/:idRutina" element={guard(<DetalleRutina />)} />
<<<<<<< HEAD
              <Route path="/planes/:idPlan/rutinas/:idRutina/editar" element={guard(<EditarRutina />)} /> {/* ⬅️ ahora funciona */}
=======
>>>>>>> b9eb8b0d452b931b230a40358fd08cd6218041df

              {/* ✅ Ejercicios */}
              <Route path="/ejercicios" element={guard(<ListaEjercicios />)} />
              <Route path="/ejercicio/registrar" element={guard(<RegistrarEjercicio />)} />
              <Route path="/ejercicio/editar/:id" element={guard(<EditarEjercicio />)} />
              <Route path="/ejercicio/detalle/:id" element={guard(<DetalleEjercicio />)} />

              {/* Alias dashboard */}
              <Route path="/dashboard" element={guard(<InicioDashboard />)} />

              {/* Default */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Container>
        </Box>
        <Footer />
      </Box>
    </BrowserRouter>
  );
}
