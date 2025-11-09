package com.grindsup.backend.controller;

import com.grindsup.backend.DTO.LoginRequest;
import com.grindsup.backend.DTO.LoginResponse;
import com.grindsup.backend.DTO.LogoutResponse;
import com.grindsup.backend.DTO.UsuarioDTO;
import com.grindsup.backend.model.Estado;
import com.grindsup.backend.model.Rol;
import com.grindsup.backend.model.Sesion;
import com.grindsup.backend.model.Usuario;
import com.grindsup.backend.repository.EstadoRepository;
import com.grindsup.backend.repository.RolRepository;
import com.grindsup.backend.repository.SesionRepository;
import com.grindsup.backend.repository.UsuarioRepository;
import com.grindsup.backend.security.JwtService; // <-- IMPORTADO
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map; // <-- IMPORTADO

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private RolRepository rolRepository;
    @Autowired private EstadoRepository estadoRepository;
    @Autowired private SesionRepository sesionRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    
    @Autowired private JwtService jwtService; // <-- INYECTADO

    // ===== CRUD básico =====
    @GetMapping
    public List<Usuario> getAll() { return usuarioRepository.findAll(); }

    @GetMapping("/{id}")
    public Usuario getById(@PathVariable Long id) {
        return usuarioRepository.findById(id).orElse(null);
    }

    @PostMapping
    public Usuario create(@RequestBody Usuario usuario) {
        // hash si viene contraseña en texto plano
        if (usuario.getContrasena() != null && !usuario.getContrasena().isBlank()) {
            usuario.setContrasena(passwordEncoder.encode(usuario.getContrasena()));
        }

        if (usuario.getRol() != null) {
            Rol rol = rolRepository.findById(usuario.getRol().getId_rol()).orElse(null);
            usuario.setRol(rol);
        }
        if (usuario.getEstado() != null) {
            Estado estado = estadoRepository.findById(usuario.getEstado().getIdEstado()).orElse(null);
            usuario.setEstado(estado);
        }

        if (usuario.getCreated_at() == null)
            usuario.setCreated_at(OffsetDateTime.now());
        usuario.setUpdated_at(OffsetDateTime.now());

        return usuarioRepository.save(usuario);
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

    // ===== LOGIN con BCrypt =====
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        var opt = usuarioRepository.findByCorreoIgnoreCase(request.getCorreo());
        if (opt.isEmpty()) {
            // Ajustado para que siempre devuelva el DTO, incluso en error
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new LoginResponse("Usuario no encontrado", false, null, null, null));
        }

        Usuario usuario = opt.get();

        boolean ok = passwordEncoder.matches(request.getContrasena(), usuario.getContrasena());
        if (!ok) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new LoginResponse("Contraseña incorrecta", false, null, null, null));
        }

        // Crear sesión (tu manejo histórico de sesiones)
        Sesion sesion = new Sesion();
        sesion.setUsuario(usuario);
        sesion.setInicio(OffsetDateTime.now());
        sesion.setCreated_at(OffsetDateTime.now());
        sesion.setUpdated_at(OffsetDateTime.now());
        sesionRepository.save(sesion);

        // --- ✅ GENERAR TOKEN JWT ---
        Map<String, Object> claims = Map.of(
            "uid", usuario.getId_usuario(),
            "rol", (usuario.getRol() != null ? usuario.getRol().getNombre() : "CLIENTE"), // Asigna un rol default si es nulo
            "prov", "credentials" // Proveedor: email/pass
        );
        String token = jwtService.generate(usuario.getCorreo(), claims);
        // --- FIN DE LA GENERACIÓN ---

        UsuarioDTO usuarioDTO = new UsuarioDTO(
                usuario.getId_usuario(),
                usuario.getNombre(),
                usuario.getApellido(),
                usuario.getCorreo());

        LoginResponse respuesta = new LoginResponse(
                "Sesión iniciada correctamente",
                true,
                sesion.getId_sesion(),
                usuarioDTO,
                token // <-- ✅ TOKEN AÑADIDO A LA RESPUESTA
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

    // ===== QUIÉN SOY (para bootstrap con cookie JWT) =====
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
        return ResponseEntity.ok(Map.of(
            "usuario", Map.of(
                "id_usuario", u.getId_usuario(),
                "nombre", u.getNombre(),
                "apellido", u.getApellido(),
                "correo", u.getCorreo(),
                "rol", (u.getRol() != null ? u.getRol().getNombre() : null),
                "foto_perfil", u.getFoto_perfil()
            )
        ));
    }
}