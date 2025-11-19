package com.grindsup.backend.controller;

import com.grindsup.backend.model.Entrenador;
import com.grindsup.backend.model.Usuario;
import com.grindsup.backend.model.Estado;
import com.grindsup.backend.DTO.PlanListDTO; // <-- Importación necesaria
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

    // Inyección del PlanRepository para el endpoint de planes
    @Autowired
    private com.grindsup.backend.repository.PlanEntrenamientoRepository planRepository;

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
    // Actualizar entrenador y su usuario
    // -----------------------------
    @PutMapping("/{id}")
    public ResponseEntity<Entrenador> updateEntrenador(
            @PathVariable Long id, @RequestBody Entrenador entrenadorDetails) {

        Entrenador entrenador = entrenadorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Entrenador no encontrado"));

        // Actualizar campos del entrenador
        entrenador.setExperiencia(entrenadorDetails.getExperiencia());
        entrenador.setTelefono(entrenadorDetails.getTelefono());

        // Actualizar estado si se envía
        if (entrenadorDetails.getEstado() != null) {
            Estado estadoExistente = estadoRepository.findById(entrenadorDetails.getEstado().getIdEstado())
                    .orElseThrow(() -> new RuntimeException("Estado no encontrado"));
            entrenador.setEstado(estadoExistente);
        }

        // Actualizar datos del usuario asociado
        if (entrenadorDetails.getUsuario() != null) {
            Usuario usuario = entrenador.getUsuario();
            Usuario usuarioDetalles = entrenadorDetails.getUsuario();

            if (usuarioDetalles.getNombre() != null)
                usuario.setNombre(usuarioDetalles.getNombre());
            if (usuarioDetalles.getApellido() != null)
                usuario.setApellido(usuarioDetalles.getApellido());
            if (usuarioDetalles.getCorreo() != null)
                usuario.setCorreo(usuarioDetalles.getCorreo());

            // 👇 NUEVO: actualizar foto_perfil si vino en el payload
            if (usuarioDetalles.getFoto_perfil() != null) {
                usuario.setFoto_perfil(usuarioDetalles.getFoto_perfil());
            }

            usuarioRepository.save(usuario); // guardar cambios en usuario
        }

        entrenadorRepository.save(entrenador);
        return ResponseEntity.ok(entrenador);
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
    @GetMapping("/{id}/planes")
    public ResponseEntity<List<PlanListDTO>> obtenerPlanesPorEntrenador(@PathVariable Long id) {
        try {
            // Se usa el nuevo método de proyección DTO
            List<PlanListDTO> planes = planRepository.findPlanDTOByEntrenador(id);

            return ResponseEntity.ok(planes);
        } catch (Exception e) {
            // Loguea el error internamente y retorna un 500 con una lista vacía para
            // cumplir con el tipo de retorno.
            System.err.println("Error al obtener planes del entrenador: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(List.of());
        }
    }
}
