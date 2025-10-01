package com.grindsup.backend.controller;

import com.grindsup.backend.model.Usuario;
import com.grindsup.backend.model.Rol;
import com.grindsup.backend.model.Sesion;
import com.grindsup.backend.model.Estado;
import com.grindsup.backend.repository.UsuarioRepository;
import com.grindsup.backend.repository.RolRepository;
import com.grindsup.backend.repository.EstadoRepository;
import com.grindsup.backend.repository.SesionRepository;
import org.springframework.beans.factory.annotation.Autowired;
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

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> body) {
        String correo = body.get("correo");
        String contrasena = body.get("contrasena");

        Map<String, Object> response = new HashMap<>();

        Usuario usuario = usuarioRepository.findByCorreo(correo);

        if (usuario != null && usuario.getContrasena().equals(contrasena)) {
            response.put("exito", true);
            response.put("usuario", usuario);

            // Crear sesión
            Sesion sesion = new Sesion();
            sesion.setUsuario(usuario);
            sesion.setInicio(OffsetDateTime.now());
            sesion.setCreated_at(OffsetDateTime.now());   // 👈 necesario
            sesion.setUpdated_at(OffsetDateTime.now());   // 👈 necesario

            // 👇 IMPORTANTE: asignar un estado por defecto (ej. "ACTIVA")
            Estado estadoActivo = estadoRepository.findById(1L).orElse(null); 
            sesion.setEstado(estadoActivo);
            sesionRepository.save(sesion);

            response.put("idSesion", sesion.getId_sesion());
        } else {
            response.put("exito", false);
            response.put("mensaje", "Correo o contraseña incorrectos");
        }

        return response;
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
}
