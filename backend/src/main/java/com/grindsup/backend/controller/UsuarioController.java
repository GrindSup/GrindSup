package com.grindsup.backend.controller;

import com.grindsup.backend.model.Usuario;
import com.grindsup.backend.model.Rol;
import com.grindsup.backend.model.Estado;
import com.grindsup.backend.repository.UsuarioRepository;
import com.grindsup.backend.repository.RolRepository;
import com.grindsup.backend.repository.EstadoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        String correo = loginData.get("correo");
        String contrasena = loginData.get("contrasena");

        Usuario usuario = usuarioRepository.findByCorreo(correo);

        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuario no encontrado");
        }

        if (!usuario.getContrasena().equals(contrasena)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Contraseña incorrecta");
        }

        return ResponseEntity.ok(usuario);
    }
}
