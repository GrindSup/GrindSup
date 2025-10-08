package com.grindsup.backend.controller;

import com.grindsup.backend.model.Estado;
import com.grindsup.backend.model.Sesion;
import com.grindsup.backend.model.Usuario;
import com.grindsup.backend.model.Rol;
import com.grindsup.backend.repository.EstadoRepository;
import com.grindsup.backend.repository.SesionRepository;
import com.grindsup.backend.repository.UsuarioRepository;
import com.grindsup.backend.repository.RolRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
        if (usuario.getRol() != null && usuario.getRol().getId_rol() != null) {
            Rol rol = rolRepository.findById(usuario.getRol().getId_rol()).orElse(null);
            usuario.setRol(rol);
        }
        if (usuario.getEstado() != null && usuario.getEstado().getId_estado() != null) {
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

            if (usuario.getRol() != null && usuario.getRol().getId_rol() != null) {
                Rol rol = rolRepository.findById(usuario.getRol().getId_rol()).orElse(null);
                existing.setRol(rol);
            }
            if (usuario.getEstado() != null && usuario.getEstado().getId_estado() != null) {
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

    // ===== LOGIN (único endpoint) =====
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String correo = body.get("correo");
        String contrasena = body.get("contrasena");

        Usuario usuario = usuarioRepository.findByCorreo(correo);
        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("exito", false, "mensaje", "Usuario no encontrado"));
        }
        if (!usuario.getContrasena().equals(contrasena)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("exito", false, "mensaje", "Contraseña incorrecta"));
        }

        // crear sesión
        Sesion sesion = new Sesion();
        sesion.setUsuario(usuario);
        sesion.setInicio(OffsetDateTime.now());
        sesion.setCreated_at(OffsetDateTime.now());
        sesion.setUpdated_at(OffsetDateTime.now());

        // Estado por defecto para la sesión (asegurate que exista id=1 “ACTIVA”)
        Estado estadoActivo = estadoRepository.findById(1L).orElse(null);
        sesion.setEstado(estadoActivo);

        sesionRepository.save(sesion);

        Map<String, Object> resp = new HashMap<>();
        resp.put("exito", true);
        resp.put("usuario", usuario);
        resp.put("idSesion", sesion.getId_sesion());

        return ResponseEntity.ok(resp);
    }
}
