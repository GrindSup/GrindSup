// frontend/src/App.jsx
import { Box, Container } from "@chakra-ui/react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import api from "./config/axios.config.js";

// ... (todos tus otros imports de páginas)
import InicioDashboard from "./pages/InicioDashboard";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Login from "./components/Login";
import PantallaInicio from "./components/Inicio";
import OAuthSuccess from "./pages/OAuthSuccess.jsx";
import RegistrarAlumnoForm from "./pages/Alumno/RegistrarAlumnoForm";
import AlumnoList from "./components/AlumnoList";
import ListaTurnos from "./pages/Turnos/ListaTurnos.jsx";
import RegistrarTurno from "./pages/Turnos/RegistrarTurno.jsx";
import DetalleTurno from "./pages/Turnos/DetalleTurno.jsx";
import CalendarioTurnos from "./pages/Turnos/CalendarioTurnos.jsx";
import EditarAlumnoForm from "./pages/Alumno/EditarAlumnoForm";
import PerfilAlumno from "./pages/Alumno/PerfilAlumno";
import Register from "./pages/Usuarios/Register.jsx";
import ForgotPassword from "./pages/Usuarios/ForgotPassword";
import ResetPassword from "./pages/Usuarios/ResetPassword";
import Contacto from "./components/Contacto.jsx";
import ListaPlanes from "./pages/Planes/ListaPlanes.jsx";
import RegistrarPlan from "./pages/Planes/RegistrarPlan.jsx";
import DetallePlan from "./pages/Planes/DetallePlan.jsx";
import EditarPlan from "./pages/Planes/EditarPlan.jsx";
import ListaRutinas from "./pages/Rutinas/ListaRutinas.jsx";
import NuevaRutina from "./pages/Rutinas/NuevaRutina.jsx";
import DetalleRutina from "./pages/Rutinas/DetalleRutina.jsx";
import EditarRutina from "./pages/Rutinas/EditarRutina.jsx";
import ListaEjercicios from "./pages/Ejercicios/ListaEjercicios.jsx";
import RegistrarEjercicio from "./pages/Ejercicios/RegistrarEjercicio.jsx";
import EditarEjercicio from "./pages/Ejercicios/EditarEjercicio.jsx";
import DetalleEjercicio from "./pages/Ejercicios/DetalleEjercicio.jsx";
import ListaEntrenadores from "./pages/Entrenadores/ListaEntrenadores.jsx";
import EditarEntrenador from "./pages/Entrenadores/EditarEntrenador.jsx";
import PerfilEntrenador from "./pages/Entrenadores/PerfilEntrenador.jsx";
import ReportesHome from "./pages/Reportes/ReportesHome.jsx";
import ReportesPage from "./pages/Reportes/ReportesPage";
import ReportesPlanes from "./pages/Reportes/ReportesPlanes.jsx";

import { clearSessionCache } from "./context/auth.js";

function Placeholder({ title }) {
  return (
    <Box bg="white" borderRadius="2xl" p={{ base: 6, md: 8 }}>
      {title}
    </Box>
  );
}

export default function App() {
  const [usuario, setUsuario] = useState(() => {
    const saved = localStorage.getItem("usuario");
    return saved ? JSON.parse(saved) : null;
  });

  // Controla la primera carga para evitar limpiar storage al volver de OAuth
  const isInitialMount = useRef(true);

  // Persistencia / limpieza cuando cambia 'usuario' (no corre en el primer render)
  useEffect(() => {
    // El 'useRef' que agregamos está perfecto.
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Esta lógica de limpieza se activa SÓLO cuando 
    // el usuario cambia (ej: al hacer logout)
    if (usuario) {
      localStorage.setItem("usuario", JSON.stringify(usuario));
    } else {
      // Si el usuario se setea a null, borramos todo.
      localStorage.removeItem("usuario");
      localStorage.removeItem("gs_token");
      localStorage.removeItem("sesionId");
      clearSessionCache();
    }
  }, [usuario]);

  // Bootstrap de sesión: ¡ESTE ES EL ARREGLO!
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        // LÍNEA CLAVE 1: Leer directamente el token de LocalStorage
            const token = localStorage.getItem("gs_token");
            if (!token) return; // Si no hay, salimos y el guardián te manda al login

            // LÍNEA CLAVE 2: Forzar el header de Axios (evita latencia del interceptor)
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        // 🚀 ¡SACAMOS EL "if (usuario) return;"!
        // Forzamos a que SIEMPRE valide el token con el backend al cargar.
        // El interceptor de axios usará el 'gs_token' (si existe).
        const { data } = await api.get("/api/usuarios/me");

        if (!cancel && data) {
          const user = data.usuario ?? data;
          setUsuario(user); // <-- Esto setea el usuario y dispara el hook de arriba
        }
      } catch {
        // Si la llamada a /me falla (401), seteamos usuario a null.
        localStorage.removeItem("gs_token");
        setUsuario(null);
        // Esto dispara el hook de arriba (limpieza), que borra 
        // el 'usuario' fantasma y el 'gs_token' (si lo había).
      }
    })();
    return () => {
      cancel = true;
    };
  }, []); // corre una sola vez

  const guard = (el) => (usuario ? el : <Navigate to="/login" replace />);
  const [authChecked, setAuthChecked] = useState(false);
  return (
    <BrowserRouter>
      <Box minH="100vh" display="flex" flexDirection="column" position="relative">
        {/* Fondo y Tinte */}
        <Box
          position="absolute"
          inset="0"
          bgImage="url('/img/gym.png')"
          bgSize="cover"
          bgPos="center"
          filter="blur(0.5px)"
          transform="scale(0.999)"
          opacity={0.55}
          borderRadius="2xl"
          zIndex={0}
        />
        <Box
          position="absolute"
          inset="0"
          bg="rgba(0, 126, 0, 0.45)"
          mixBlendMode="multiply"
          zIndex={0}
        />

        {/* Contenido */}
        <Box position="relative" zIndex={2} flex="1" display="flex" flexDirection="column">
          <Header usuario={usuario} setUsuario={setUsuario} />

          <Box as="main" flex="1" py={{ base: 6, md: 10 }}>
            <Container maxW="container.xl">
              <Routes>
                {/* Home → Dashboard si hay sesión; Landing si no */}
                <Route
                  path="/"
                  element={usuario ? <InicioDashboard /> : <PantallaInicio />}
                />

                {/* OAuth bridge */}
                <Route
                  path="/oauth/success"
                  element={<OAuthSuccess setUsuario={setUsuario} />}
                />

                {/* Públicas */}
                <Route path="/login" element={<Login setUsuario={setUsuario} />} />
                <Route path="/register" element={<Register />} />
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

                {/* Planes */}
                <Route path="/planes" element={guard(<ListaPlanes />)} />
                <Route path="/planes/nuevo" element={guard(<RegistrarPlan />)} />
                <Route path="/planes/:idPlan" element={guard(<DetallePlan />)} />
                <Route path="/planes/:idPlan/editar" element={guard(<EditarPlan />)} />

                {/* Rutinas */}
                <Route path="/rutinas" element={guard(<ListaRutinas />)} />
                <Route path="/planes/:idPlan/rutinas" element={guard(<ListaRutinas />)} />
                <Route path="/planes/:idPlan/rutinas/nueva" element={guard(<NuevaRutina />)} />
                <Route path="/rutinas/nueva" element={guard(<NuevaRutina />)} />
                <Route path="/planes/:idPlan/rutinas/:idRutina" element={guard(<DetalleRutina />)} />
                <Route path="/rutinas/:idRutina" element={guard(<DetalleRutina />)} />
                <Route path="/planes/:idPlan/rutinas/:idRutina/editar" element={guard(<EditarRutina />)} />
                <Route path="/rutinas/:idRutina/editar" element={guard(<EditarRutina />)} />

                {/* Ejercicios */}
                <Route path="/ejercicios" element={guard(<ListaEjercicios />)} />
                <Route path="/registrar" element={guard(<RegistrarEjercicio />)} />
                <Route path="/ejercicio/editar/:id" element={guard(<EditarEjercicio />)} />
                <Route path="/ejercicio/detalle/:id" element={guard(<DetalleEjercicio />)} />

                {/* Entrenadores */}
                <Route path="/entrenadores" element={guard(<ListaEntrenadores />)} />
                <Route
                  path="/entrenadores/editar/:idEntrenador"
                  element={guard(<EditarEntrenador />)}
                />
                <Route
                  path="/entrenadores/perfil/:idEntrenador"
                  element={guard(<PerfilEntrenador />)}
                />

                {/* Contacto */}
                <Route path="/contacto" element={<Contacto />} />

                {/* Reportes */}
                <Route path="/reportes" element={guard(<ReportesHome />)} />
                <Route path="/reportes/alumnos" element={guard(<ReportesPage />)} />
                <Route path="/reportes/planes" element={guard(<ReportesPlanes />)} />

                {/* Alias dashboard */}
                <Route path="/dashboard" element={guard(<InicioDashboard />)} />

                {/* Default */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Container>
          </Box>

          <Footer />
        </Box>
      </Box>
    </BrowserRouter>
  );
}
