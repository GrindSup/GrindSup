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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private EstadoRepository estadoRepository;

    @Autowired
    private SesionRepository sesionRepository;

    // ===== CRUD básico =====
    @GetMapping
    public List<Usuario> getAll() {
        return usuarioRepository.findAll();
    }

    @GetMapping("/{id}")
    public Usuario getById(@PathVariable Long id) {
        return usuarioRepository.findById(id).orElse(null);
    }

    @PostMapping
    public Usuario create(@RequestBody Usuario usuario) {
        if (usuario.getRol() != null) {
            Rol rol = rolRepository.findById(usuario.getRol().getId_rol()).orElse(null);
            usuario.setRol(rol);
        }
        if (usuario.getEstado() != null) {
            Estado estado = estadoRepository.findById(usuario.getEstado().getId_estado()).orElse(null);
            usuario.setEstado(estado);
        }
        return usuarioRepository.save(usuario);
    }

    @PutMapping("/{id}")
    public Usuario update(@PathVariable Long id, @RequestBody Usuario usuario) {
        return usuarioRepository.findById(id).map(existing -> {
            existing.setNombre(usuario.getNombre());
            existing.setApellido(usuario.getApellido());
            existing.setCorreo(usuario.getCorreo());
            existing.setContrasena(usuario.getContrasena());

            if (usuario.getRol() != null) {
                Rol rol = rolRepository.findById(usuario.getRol().getId_rol()).orElse(null);
                existing.setRol(rol);
            }
            if (usuario.getEstado() != null) {
                Estado estado = estadoRepository.findById(usuario.getEstado().getId_estado()).orElse(null);
                existing.setEstado(estado);
            }

            existing.setFoto_perfil(usuario.getFoto_perfil());
            return usuarioRepository.save(existing);
        }).orElse(null);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        usuarioRepository.deleteById(id);
        return "Usuario eliminado con id " + id;
    }

    // ===== LOGIN =====
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        Usuario usuario = usuarioRepository.findByCorreo(request.getCorreo());

        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new LoginResponse("Usuario no encontrado", false, null, null));
        }

        if (!usuario.getContrasena().equals(request.getContrasena())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new LoginResponse("Contraseña incorrecta", false, null, null));
        }

        // Crear sesión
        Sesion sesion = new Sesion();
        sesion.setUsuario(usuario);
        sesion.setInicio(OffsetDateTime.now());
        sesion.setCreated_at(OffsetDateTime.now());
        sesion.setUpdated_at(OffsetDateTime.now());
        sesionRepository.save(sesion);

        UsuarioDTO usuarioDTO = new UsuarioDTO(
                usuario.getId_usuario(),
                usuario.getNombre(),
                usuario.getApellido(),
                usuario.getCorreo());

        LoginResponse respuesta = new LoginResponse(
                "Sesión iniciada correctamente",
                true,
                sesion.getId_sesion(),
                usuarioDTO);

        return ResponseEntity.ok(respuesta);
    }

    // ===== LOGOUT =====
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
}
