package com.grindsup.backend.controller;

import com.grindsup.backend.model.Entrenador;
import com.grindsup.backend.model.Usuario;
import com.grindsup.backend.model.Estado;
import com.grindsup.backend.repository.EntrenadorRepository;
import com.grindsup.backend.repository.UsuarioRepository;
import com.grindsup.backend.repository.EstadoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/entrenadores")
@CrossOrigin(origins = "*")
public class EntrenadorController {

    @Autowired
    private EntrenadorRepository entrenadorRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private EstadoRepository estadoRepository;

    // -----------------------------
    // HU 38: Listado de entrenadores activos
    // -----------------------------
    @GetMapping
    public List<Entrenador> getAllActivos() {
        return entrenadorRepository.findAll()
                .stream()
                .filter(e -> e.getDeleted_at() == null) // solo entrenadores activos
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Entrenador> getById(@PathVariable Long id) {
        return entrenadorRepository.findById(id)
                .filter(e -> e.getDeleted_at() == null)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // -----------------------------
    // HU 82: Registrar entrenador
    // -----------------------------
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Entrenador entrenador) {
        // Validar usuario
        if (entrenador.getUsuario() != null) {
            Usuario usuario = usuarioRepository.findById(entrenador.getUsuario().getId_usuario()).orElse(null);
            if (usuario == null)
                return ResponseEntity.badRequest().body("Usuario no encontrado");
            entrenador.setUsuario(usuario);
        } else {
            return ResponseEntity.badRequest().body("Usuario es obligatorio");
        }

        // Validar estado
        if (entrenador.getEstado() != null) {
            Estado estado = estadoRepository.findById(entrenador.getEstado().getIdEstado()).orElse(null);
            if (estado == null)
                return ResponseEntity.badRequest().body("Estado no encontrado");
            entrenador.setEstado(estado);
        }

        // Timestamps
        OffsetDateTime ahora = OffsetDateTime.now();
        entrenador.setCreated_at(ahora);
        entrenador.setUpdated_at(ahora);

        Entrenador guardado = entrenadorRepository.save(entrenador);
        return ResponseEntity.status(201).body(guardado);
    }

    // -----------------------------
    // Actualizar entrenador
    // -----------------------------
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Entrenador entrenadorDetails) {
        return entrenadorRepository.findById(id)
                .filter(e -> e.getDeleted_at() == null)
                .map(existing -> {
                    existing.setExperiencia(entrenadorDetails.getExperiencia());
                    existing.setTelefono(entrenadorDetails.getTelefono());

                    // Usuario
                    if (entrenadorDetails.getUsuario() != null) {
                        Usuario usuario = usuarioRepository.findById(entrenadorDetails.getUsuario().getId_usuario())
                                .orElse(null);
                        if (usuario != null)
                            existing.setUsuario(usuario);
                    }

                    // Estado
                    if (entrenadorDetails.getEstado() != null) {
                        Estado estado = estadoRepository.findById(entrenadorDetails.getEstado().getIdEstado())
                                .orElse(null);
                        if (estado != null)
                            existing.setEstado(estado);
                    }

                    existing.setUpdated_at(OffsetDateTime.now());
                    return ResponseEntity.ok(entrenadorRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // -----------------------------
    // HU 39: Actualizar estado de entrenador
    // -----------------------------
    @PutMapping("/{id}/estado")
    public ResponseEntity<?> actualizarEstado(@PathVariable Long id, @RequestBody Estado nuevoEstado) {
        return entrenadorRepository.findById(id)
                .filter(e -> e.getDeleted_at() == null)
                .map(entrenador -> {
                    Estado estado = estadoRepository.findById(nuevoEstado.getIdEstado()).orElse(null);
                    if (estado == null)
                        return ResponseEntity.badRequest().body("Estado no encontrado");

                    entrenador.setEstado(estado);
                    entrenador.setUpdated_at(OffsetDateTime.now());
                    return ResponseEntity.ok(entrenadorRepository.save(entrenador));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // -----------------------------
    // Eliminación lógica
    // -----------------------------
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return entrenadorRepository.findById(id)
                .filter(e -> e.getDeleted_at() == null)
                .map(entrenador -> {
                    entrenador.setDeleted_at(OffsetDateTime.now());
                    entrenadorRepository.save(entrenador);
                    return ResponseEntity.ok("Entrenador eliminado correctamente (eliminación lógica).");
                })
                .orElse(ResponseEntity.notFound().build());
    }

// -----------------------------
// Listar planes por entrenador
// -----------------------------

@Autowired
private com.grindsup.backend.repository.PlanEntrenamientoRepository planRepository;

@GetMapping("/{id}/planes")
public ResponseEntity<?> obtenerPlanesPorEntrenador(@PathVariable Long id) {
    try {
        List<com.grindsup.backend.model.PlanEntrenamiento> planes =
                planRepository.findByEntrenador_IdEntrenador(id);

        return ResponseEntity.ok(planes);
    } catch (Exception e) {
        return ResponseEntity.internalServerError()
                .body("Error al obtener planes del entrenador: " + e.getMessage());
    }
}
}
