import axios from "axios";

const API_URL = "http://localhost:8080/api/turnos";

// 🔹 Crear turno
export async function crearTurno(turno) {
  return await axios.post(API_URL, turno);
}

// 🔹 Listar alumnos
export async function listarAlumnos() {
  return await axios.get("http://localhost:8080/api/alumnos");
}

// 🔹 Listar tipos de turno
export async function listarTiposTurno() {
  return await axios.get("http://localhost:8080/api/tipos-turno");
}
