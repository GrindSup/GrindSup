// frontend/src/App.jsx
import { Box, Container, Center, Spinner, Text } from "@chakra-ui/react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import api from "./config/axios.config.js";

// Pages
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
import HistorialTurnos from "./pages/Turnos/HistorialTurnos.jsx";
import CalendarioTurnos from "./pages/Turnos/CalendarioTurnos.jsx";
import EditarAlumnoForm from "./pages/Alumno/EditarAlumnoForm";
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

// 👇 IMPORTÁ TU DASHBOARD DE ADMIN
// ajustá el path según dónde lo tengas
import AdminDashboard from "./pages/Admin/AdminDashboards.jsx";
import AdminReportsGlobal from "./pages/Admin/AdminReportsGlobal.jsx";
import AdminReportsEntrenadores from "./pages/Admin/AdminReportsEntrenadores.jsx";

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

  // Marcamos cuando ya intentamos validar sesión
  const [authAttempted, setAuthAttempted] = useState(false);

  // Para evitar limpiar de más en la primera carga
  const isInitialMount = useRef(true);

  // 🔹 Cálculo del rol admin (según lo que nos manda /me)
  const isAdmin =
    usuario &&
    (
      usuario.rol === "administrador" ||
      usuario.rol === "ADMINISTRADOR" ||
      usuario.rol === "ADMIN" ||
      usuario.id_rol === 2 // por si en algún lado viene así
    );

  // Persistencia de usuario y limpieza cuando cambia
  useEffect(() => {
    const firstRun = isInitialMount.current;
    isInitialMount.current = false;

    if (usuario) {
      localStorage.setItem("usuario", JSON.stringify(usuario));

      // Guardamos ID/Correo para Google Calendar
      const id =
        usuario.id_usuario != null
          ? String(usuario.id_usuario)
          : usuario.correo || null;

      if (id) {
        localStorage.setItem("gs_user_id", id);
        localStorage.setItem("userId", id);
      }
    } else if (!firstRun) {
      // Limpiar todo si se desloguea
      localStorage.removeItem("usuario");
      localStorage.removeItem("gs_token");
      localStorage.removeItem("sesionId");
      localStorage.removeItem("gs_user_id");
      localStorage.removeItem("userId");
      clearSessionCache();
    }
  }, [usuario]);

  // Bootstrap de sesión (cuando ya hay gs_token, por ejemplo tras refrescar)
  useEffect(() => {
    let cancel = false;

    (async () => {
      try {
        const token = localStorage.getItem("gs_token");
        if (!token) {
          setAuthAttempted(true);
          return;
        }

        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        const { data } = await api.get("/api/usuarios/me");

        if (!cancel && data) {
          const user = data.usuario ?? data;

          if (user?.id_usuario != null) {
            const id = String(user.id_usuario);
            localStorage.setItem("gs_user_id", id);
            localStorage.setItem("userId", id);
          }

          localStorage.setItem("usuario", JSON.stringify(user));
          setUsuario(user);
        }
      } catch {
        localStorage.removeItem("gs_token");
        setUsuario(null);
      } finally {
        setAuthAttempted(true);
      }
    })();

    return () => {
      cancel = true;
    };
  }, []);

  // Pantalla mientras se carga sesión
  const LoadingScreen = () => (
    <Center flex="1" h="calc(100vh - 150px)">
      <Spinner size="xl" color="#258d19" />
      <Text ml={3} color="gray.700">
        Cargando sesión...
      </Text>
    </Center>
  );

  // Guard de rutas protegidas
  const guard = (el) =>
    usuario ? (
      el
    ) : authAttempted ? (
      <Navigate to="/login" replace />
    ) : (
      <LoadingScreen />
    );

  return (
    <BrowserRouter>
      <Box minH="100vh" display="flex" flexDirection="column" position="relative">
        {/* Fondo difuminado */}
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

        {/* Capa verde */}
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
                {/* Home: distinto para admin vs entrenador */}
                <Route
                  path="/"
                  element={
                    usuario
                      ? isAdmin
                        ? <AdminDashboard />
                        : <InicioDashboard />
                      : <PantallaInicio />
                  }
                />

                {/* OAuth Success */}
                <Route
                  path="/oauth/success"
                  element={<OAuthSuccess setUsuario={setUsuario} redirectTo="/dashboard" />}
                />

                {/* Públicas */}
                
                <Route
                  path="/reportes/admin/global"
                  element={guard(<AdminReportsGlobal />)}
                />
                <Route
                  path="/reportes/admin/entrenadores"
                  element={guard(<AdminReportsEntrenadores />)}
                />
                <Route path="/login" element={<Login setUsuario={setUsuario} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot" element={<ForgotPassword />} />
                <Route path="/reset" element={<ResetPassword />} />
                <Route path="/contacto" element={<Contacto />} />

                {/* Alumnos */}
                <Route path="/alumnos" element={guard(<AlumnoList />)} />
                <Route path="/alumno/registrar" element={guard(<RegistrarAlumnoForm />)} />
                <Route path="/alumno/editar/:id" element={guard(<EditarAlumnoForm />)} />

                {/* Turnos */}
                <Route path="/turnos" element={guard(<ListaTurnos />)} />
                <Route path="/turnos/registrar" element={guard(<RegistrarTurno />)} />
                <Route path="/turnos/historial" element={guard(<HistorialTurnos />)} />
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
                <Route
                  path="/planes/:idPlan/rutinas/:idRutina/editar"
                  element={guard(<EditarRutina />)}
                />
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

                {/* Reportes */}
                <Route path="/reportes" element={guard(<ReportesHome />)} />
                <Route path="/reportes/alumnos" element={guard(<ReportesPage />)} />
                <Route path="/reportes/planes" element={guard(<ReportesPlanes />)} />

                {/* Dashboard alias: también respeta admin vs entrenador */}
                <Route
                  path="/dashboard"
                  element={guard(isAdmin ? <AdminDashboard /> : <InicioDashboard />)}
                />

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
