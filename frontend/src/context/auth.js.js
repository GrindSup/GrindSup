// frontend/src/lib/auth.js
export function getUsuario() {
  try { return JSON.parse(localStorage.getItem("usuario") || "null"); }
  catch { return null; }
}

// Intenta varios nombres posibles de campos (camel/snake y modelos distintos)
export function getEntrenadorId(user) {
  if (!user) return null;
  return (
    user?.entrenador?.id_entrenador ??
    user?.entrenador?.id ??
    user?.id_entrenador ??
    user?.id_usuario ??
    user?.id ??
    null
  );
}
