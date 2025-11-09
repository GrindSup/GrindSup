//src\routes\router.jsx
import { Routes, Route } from "react-router-dom";

// Tablero
import PaginaTablero from "../pages/Tablero/PaginaTablero";

// Usuarios
import ListaUsuarios from "../pages/Usuarios/ListaUsuarios";
import FormularioUsuario from "../pages/Usuarios/FormularioUsuario";
import DetalleUsuario from "../pages/Usuarios/DetalleUsuario";

// Planes
import ListaPlanes from "../pages/Planes/ListaPlanes";
import FormularioPlan from "../pages/Planes/FormularioPlan";

// Tipos de entrenamiento
import ListaTiposEntrenamiento from "../pages/TiposEntrenamiento/ListaTiposEntrenamiento";
import FormularioTipoEntrenamiento from "../pages/TiposEntrenamiento/FormularioTipoEntrenamiento";

// Clientes
import ListaClientes from "../pages/Clientes/ListaClientes";
import FormularioCliente from "../pages/Clientes/FormularioCliente";
import DetalleCliente from "../pages/Clientes/DetalleCliente";

// Entrenadores
import ListaEntrenadores from "../pages/Entrenadores/ListaEntrenadores";
import RegistrarEntrenadores from "../components/RegistrarEntrenadores";
import EditarEntrenador from "../pages/Entrenadores/EditarEntrenador";
import PerfilEntrenador from "../pages/Entrenadores/PerfilEntrenador";

// Ejercicios
import ListaEjercicios from "../pages/Ejercicios/ListaEjercicios";
import FormularioEjercicio from "../pages/Ejercicios/FormularioEjercicio";

// Turnos
import CalendarioTurnos from "../pages/Turnos/CalendarioTurnos";
import FormularioTurno from "../pages/Turnos/FormularioTurno";

// Reportes
import ReporteSociosActivos from "../pages/Reportes/ReporteSociosActivos";
import ReporteProgreso from "../pages/Reportes/ReporteProgreso";

// Rutinas
import ListaRutinas from "../pages/Rutinas/ListaRutinas";
import ConstructorRutina from "../pages/Rutinas/ConstructorRutina";

// Notificaciones
import CentroNotificaciones from "../pages/Notificaciones/CentroNotificaciones";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<PaginaTablero />} />

      {/* Usuarios */}
      <Route path="/usuarios" element={<ListaUsuarios />} />
      <Route path="/usuarios/nuevo" element={<FormularioUsuario />} />
      <Route path="/usuarios/:id" element={<DetalleUsuario />} />

      {/* Planes */}
      <Route path="/planes" element={<ListaPlanes />} />
      <Route path="/planes/nuevo" element={<FormularioPlan />} />

      {/* Tipos de Entrenamiento */}
      <Route path="/tipos-entrenamiento" element={<ListaTiposEntrenamiento />} />
      <Route path="/tipos-entrenamiento/nuevo" element={<FormularioTipoEntrenamiento />} />

      {/* Clientes */}
      <Route path="/clientes" element={<ListaClientes />} />
      <Route path="/clientes/nuevo" element={<FormularioCliente />} />
      <Route path="/clientes/:id" element={<DetalleCliente />} />

      {/* Entrenadores */}
      <Route path="/entrenadores" element={<ListaEntrenadores />} />
      <Route path="/entrenadores/registrar" element={<RegistrarEntrenadores />} />
      <Route path="/entrenadores/perfil/:idEntrenador" element={<PerfilEntrenador />} />
      <Route path="/entrenadores/editar/:idEntrenador" element={<EditarEntrenador />} />
      

      {/* Ejercicios */}
      <Route path="/ejercicios" element={<ListaEjercicios />} />
      <Route path="/ejercicios/nuevo" element={<FormularioEjercicio />} />

      {/* Turnos */}
      <Route path="/turnos" element={<CalendarioTurnos />} />
      <Route path="/turnos/nuevo" element={<FormularioTurno />} />

      {/* Reportes */}
      <Route path="/reportes/socios" element={<ReporteSociosActivos />} />
      <Route path="/reportes/progreso" element={<ReporteProgreso />} />

      {/* Rutinas */}
      <Route path="/rutinas" element={<ListaRutinas />} />
      <Route path="/rutinas/constructor" element={<ConstructorRutina />} />

      {/* Notificaciones */}
      <Route path="/notificaciones" element={<CentroNotificaciones />} />
    </Routes>
  );
}
