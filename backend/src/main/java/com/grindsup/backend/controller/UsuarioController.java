package com.grindsup.backend.controller;

import com.grindsup.backend.DTO.LoginRequest;
import com.grindsup.backend.DTO.LoginResponse;
import com.grindsup.backend.DTO.LogoutResponse;
import com.grindsup.backend.DTO.UsuarioDTO;
import com.grindsup.backend.model.Estado;
import com.grindsup.backend.model.Rol;
import com.grindsup.backend.model.Sesion;
import com.grindsup.backend.model.Usuario;
import com.grindsup.backend.model.Entrenador; // <--- NUEVO
import com.grindsup.backend.repository.EstadoRepository;
import com.grindsup.backend.repository.RolRepository;
import com.grindsup.backend.repository.SesionRepository;
import com.grindsup.backend.repository.UsuarioRepository;
import com.grindsup.backend.repository.EntrenadorRepository; // <--- NUEVO
import com.grindsup.backend.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private RolRepository rolRepository;
    @Autowired private EstadoRepository estadoRepository;
    @Autowired private SesionRepository sesionRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtService jwtService;

    // 👇 NUEVO: repositorio de entrenadores
    @Autowired private EntrenadorRepository entrenadorRepository;

    // ========= HELPER: asegurar que el usuario tenga entrenador (NO admin) =========
    private void ensureEntrenadorForUsuario(Usuario usuario) {
        if (usuario == null || usuario.getId_usuario() == null) return;

        // 👉 Si es ADMIN, NO creamos entrenador
        Rol rol = usuario.getRol();
        if (rol != null) {
            Long idRol = rol.getId_rol();
            String nombreRol = rol.getNombre();
            if ((idRol != null && idRol == 2L) || // ID 2 = ADMIN
                (nombreRol != null && nombreRol.equalsIgnoreCase("ADMINISTRADOR"))) {
                return; // Es administrador, no debe ser entrenador
            }
        }

        // Si ya existe un entrenador para este usuario, no hacemos nada
        boolean yaExiste = entrenadorRepository.findByUsuario(usuario).isPresent();
        if (yaExiste) return;

        // Estado por defecto para entrenadores (ajustá el ID si hace falta)
        Estado estadoActivo = estadoRepository.findById(1L).orElse(null);

        Entrenador entrenador = new Entrenador();
        entrenador.setUsuario(usuario);
        entrenador.setEstado(estadoActivo);   // puede ser null si la columna admite null
        entrenador.setCreated_at(OffsetDateTime.now());
        entrenador.setUpdated_at(OffsetDateTime.now());

        entrenadorRepository.save(entrenador);
    }

    // ===== CRUD básico =====
    @GetMapping
    public List<Usuario> getAll() { return usuarioRepository.findAll(); }

    @GetMapping("/{id}")
    public Usuario getById(@PathVariable Long id) {
        return usuarioRepository.findById(id).orElse(null);
    }

    /**
     * Crea un nuevo usuario. Asigna Rol y Estado por defecto si no son proporcionados.
     * Además, asegura que el usuario tenga un Entrenador asociado (salvo admin).
     */
    @PostMapping
    public Usuario create(@RequestBody Usuario usuario) {
        // 1. Hashear contraseña si viene en texto plano
        if (usuario.getContrasena() != null && !usuario.getContrasena().isBlank()) {
            usuario.setContrasena(passwordEncoder.encode(usuario.getContrasena()));
        }

        // 2. ASIGNAR ROL POR DEFECTO: Si el usuario no tiene rol (registro normal)
        if (usuario.getRol() == null) {
            // Se asume que el ID 1 es el Rol 'CLIENTE' o 'ESTANDAR'
            Rol rolDefecto = rolRepository.findById(1L).orElseThrow(
                () -> new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "El rol por defecto (ID 1) no está configurado en la base de datos.")
            );
            usuario.setRol(rolDefecto);
        } else {
            // Si el rol viene en el request, se busca y se asigna.
            Rol rol = rolRepository.findById(usuario.getRol().getId_rol()).orElse(null);
            usuario.setRol(rol);
        }

        // 3. ASIGNAR ESTADO POR DEFECTO: Si el usuario no tiene estado (registro normal)
        if (usuario.getEstado() == null) {
            // Se asume que el ID 1 es el Estado 'ACTIVO'
            Estado estadoDefecto = estadoRepository.findById(1L).orElseThrow(
                () -> new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "El estado por defecto (ID 1) no está configurado en la base de datos.")
            );
            usuario.setEstado(estadoDefecto);
        } else {
            Estado estado = estadoRepository.findById(usuario.getEstado().getIdEstado()).orElse(null);
            usuario.setEstado(estado);
        }

        // 4. Asignar Foto de Perfil por defecto si es NOT NULL en DB y está vacía
        if (usuario.getFoto_perfil() == null) {
            usuario.setFoto_perfil(""); // o URL por defecto
        }

        // 5. Asignar fechas (si tu entidad JPA no lo hace sola)
        if (usuario.getCreated_at() == null)
            usuario.setCreated_at(OffsetDateTime.now());
        usuario.setUpdated_at(OffsetDateTime.now());

        // 6. Guardar usuario
        Usuario guardado = usuarioRepository.save(usuario);

        // 7. 🔥 Asegurar que también tenga Entrenador (si no es admin)
        ensureEntrenadorForUsuario(guardado);

        return guardado;
    }

    @PutMapping("/{id}")
    public Usuario update(@PathVariable Long id, @RequestBody Usuario usuario) {
        return usuarioRepository.findById(id).map(existing -> {
            existing.setNombre(usuario.getNombre());
            existing.setApellido(usuario.getApellido());
            existing.setCorreo(usuario.getCorreo());

            // si viene contraseña nueva en texto plano => hashear
            if (usuario.getContrasena() != null && !usuario.getContrasena().isBlank()) {
                String nueva = usuario.getContrasena();
                // si ya viene en formato bcrypt ($2...) no volvemos a hashear
                if (!nueva.startsWith("$2a$") && !nueva.startsWith("$2b$") && !nueva.startsWith("$2y$")) {
                    nueva = passwordEncoder.encode(nueva);
                }
                existing.setContrasena(nueva);
            }

            if (usuario.getRol() != null) {
                Rol rol = rolRepository.findById(usuario.getRol().getId_rol()).orElse(null);
                existing.setRol(rol);
            }
            if (usuario.getEstado() != null) {
                Estado estado = estadoRepository.findById(usuario.getEstado().getIdEstado()).orElse(null);
                existing.setEstado(estado);
            }

            existing.setFoto_perfil(usuario.getFoto_perfil());
            existing.setUpdated_at(OffsetDateTime.now());

            return usuarioRepository.save(existing);
        }).orElse(null);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        usuarioRepository.deleteById(id);
        return "Usuario eliminado con id " + id;
    }

    // ===== LOGIN con BCrypt + fallback texto plano =====
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        var opt = usuarioRepository.findByCorreoIgnoreCase(request.getCorreo());
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new LoginResponse("Usuario no encontrado", false, null, null, null));
        }

        Usuario usuario = opt.get();

        String stored = usuario.getContrasena();
        boolean ok = false;

        if (stored != null &&
                (stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$"))) {
            // Caso normal: contraseña en BCrypt
            ok = passwordEncoder.matches(request.getContrasena(), stored);
        } else {
            // Caso admin creado a mano: texto plano en DB
            ok = stored != null && stored.equals(request.getContrasena());
        }

        if (!ok) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new LoginResponse("Contraseña incorrecta", false, null, null, null));
        }

        // 🔥 Asegurar que este usuario tenga su entrenador asociado (si no es admin)
        ensureEntrenadorForUsuario(usuario);

        // Crear sesión (histórico)
        Sesion sesion = new Sesion();
        sesion.setUsuario(usuario);
        sesion.setInicio(OffsetDateTime.now());
        sesion.setCreated_at(OffsetDateTime.now());
        sesion.setUpdated_at(OffsetDateTime.now());
        sesionRepository.save(sesion);

        // --- GENERAR TOKEN JWT ---
        Map<String, Object> claims = Map.of(
                "uid", usuario.getId_usuario(),
                "rol", (usuario.getRol() != null ? usuario.getRol().getNombre() : "CLIENTE"),
                "prov", "credentials"
        );
        String token = jwtService.generate(usuario.getCorreo(), claims);

        UsuarioDTO usuarioDTO = new UsuarioDTO(
                usuario.getId_usuario(),
                usuario.getNombre(),
                usuario.getApellido(),
                usuario.getCorreo()
        );

        LoginResponse respuesta = new LoginResponse(
                "Sesión iniciada correctamente",
                true,
                sesion.getId_sesion(),
                usuarioDTO,
                token
        );

        return ResponseEntity.ok(respuesta);
    }

    // ===== LOGOUT (histórico por idSesion) =====
    @PutMapping("/logout/{idSesion}")
    public ResponseEntity<LogoutResponse> logout(@PathVariable Long idSesion) {
        return sesionRepository.findById(idSesion).map(sesion -> {
            if (sesion.getFin() != null) {
                return ResponseEntity.badRequest()
                        .body(new LogoutResponse("Sesión ya está cerrada", false));
            }
            sesion.setFin(OffsetDateTime.now());
            sesion.setUpdated_at(OffsetDateTime.now());
            sesionRepository.save(sesion);
            return ResponseEntity.ok(new LogoutResponse("Sesión cerrada correctamente", true));
        }).orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new LogoutResponse("Sesión no encontrada", false)));
    }

    // ===== QUIÉN SOY (para bootstrap con cookie/JWT) =====
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication auth) {
        if (auth == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("mensaje", "No autenticado"));
        }

        String email = auth.getName(); // subject del JWT
        var opt = usuarioRepository.findByCorreoIgnoreCase(email);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("mensaje", "Usuario no encontrado"));
        }

        Usuario u = opt.get();

        Long rolId = null;
        String rolNombre = null;
        if (u.getRol() != null) {
            rolId = u.getRol().getId_rol();
            rolNombre = u.getRol().getNombre();
        }

        Map<String, Object> usuarioMap = new HashMap<>();
        usuarioMap.put("id_usuario", u.getId_usuario());
        usuarioMap.put("nombre", u.getNombre());
        usuarioMap.put("apellido", u.getApellido());
        usuarioMap.put("correo", u.getCorreo());
        if (rolId != null) {
            usuarioMap.put("id_rol", rolId);
        }
        if (rolNombre != null) {
            usuarioMap.put("rol", rolNombre);
        }
        if (u.getFoto_perfil() != null) {
            usuarioMap.put("foto_perfil", u.getFoto_perfil());
        }

        return ResponseEntity.ok(Map.of(
                "usuario", usuarioMap
        ));
    }
}
