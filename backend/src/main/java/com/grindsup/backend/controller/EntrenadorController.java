package com.grindsup.backend.controller;

import com.grindsup.backend.model.Entrenador;
import com.grindsup.backend.model.Usuario;
import com.grindsup.backend.model.Estado;
import com.grindsup.backend.repository.RolRepository;
import com.grindsup.backend.repository.EntrenadorRepository;
import com.grindsup.backend.repository.UsuarioRepository;
import com.grindsup.backend.repository.EstadoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/entrenadores")
public class EntrenadorController {

    @Autowired
    private EntrenadorRepository entrenadorRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private EstadoRepository estadoRepository;

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    public List<Entrenador> getAll() {
        return entrenadorRepository.findAll();
    }

    @GetMapping("/{id}")
    public Entrenador getById(@PathVariable Long id) {
        return entrenadorRepository.findById(id).orElse(null);
    }

    @PostMapping
    public Entrenador create(@RequestBody Entrenador entrenador) {
        if (entrenador.getUsuario() != null) {
            Usuario usuario = usuarioRepository.findById(entrenador.getUsuario().getId_usuario()).orElse(null);
            entrenador.setUsuario(usuario);
        }
        if (entrenador.getEstado() != null) {
            Estado estado = estadoRepository.findById(entrenador.getEstado().getId_estado()).orElse(null);
            entrenador.setEstado(estado);
        }
        return entrenadorRepository.save(entrenador);
    }

    @PutMapping("/{id}")
    public Entrenador update(@PathVariable Long id, @RequestBody Entrenador entrenador) {
        return entrenadorRepository.findById(id).map(existing -> {
            existing.setExperiencia(entrenador.getExperiencia());
            existing.setTelefono(entrenador.getTelefono());

            if (entrenador.getUsuario() != null) {
                Usuario usuario = usuarioRepository.findById(entrenador.getUsuario().getId_usuario()).orElse(null);
                existing.setUsuario(usuario);
            }
            if (entrenador.getEstado() != null) {
                Estado estado = estadoRepository.findById(entrenador.getEstado().getId_estado()).orElse(null);
                existing.setEstado(estado);
            }
            return entrenadorRepository.save(existing);
        }).orElse(null);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        entrenadorRepository.deleteById(id);
        return "Entrenador eliminado con id " + id;
    }

    @PostMapping("/registrar")
    public ResponseEntity<?> registrarEntrenador(@RequestBody Usuario datosUsuario) {
        try {
            // 1️⃣ Validar que no exista el correo
            if (usuarioRepository.findByCorreoIgnoreCase(datosUsuario.getCorreo()).isPresent()) {
                return ResponseEntity.badRequest().body("El correo ya está registrado.");
            }

            // 2️⃣ Buscar el rol ENTRENADOR
            var rolEntrenador = rolRepository.findByNombreIgnoreCase("ENTRENADOR")
                    .orElseThrow(() -> new RuntimeException("No existe el rol 'ENTRENADOR'"));

            // 3️⃣ Buscar el estado activo
            var estadoActivo = estadoRepository.findByNombreIgnoreCase("activo")
                    .orElseThrow(() -> new RuntimeException("No existe el estado 'activo'"));

            // 4️⃣ Crear el usuario base
            Usuario nuevoUsuario = new Usuario();
            nuevoUsuario.setNombre(datosUsuario.getNombre());
            nuevoUsuario.setApellido(datosUsuario.getApellido());
            nuevoUsuario.setCorreo(datosUsuario.getCorreo());
            nuevoUsuario.setContrasena(passwordEncoder.encode(datosUsuario.getContrasena()));
            nuevoUsuario.setRol(rolEntrenador);
            nuevoUsuario.setEstado(estadoActivo);
            nuevoUsuario.setCreated_at(OffsetDateTime.now());
            nuevoUsuario.setUpdated_at(OffsetDateTime.now());
            usuarioRepository.save(nuevoUsuario);

            // 5️⃣ Crear el entrenador vinculado al usuario
            Entrenador nuevoEntrenador = new Entrenador();
            nuevoEntrenador.setUsuario(nuevoUsuario);
            nuevoEntrenador.setEstado(estadoActivo);
            nuevoEntrenador.setExperiencia("");
            nuevoEntrenador.setTelefono("");
            nuevoEntrenador.setCreated_at(OffsetDateTime.now());
            nuevoEntrenador.setUpdated_at(OffsetDateTime.now());

            entrenadorRepository.save(nuevoEntrenador);

            return ResponseEntity.ok(nuevoEntrenador);

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Error al registrar el entrenador: " + e.getMessage());
        }
    }
}
