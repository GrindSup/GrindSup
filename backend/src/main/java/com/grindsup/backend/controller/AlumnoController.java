package com.grindsup.backend.controller;

import com.grindsup.backend.DTO.AlumnoListDTO; 
import com.grindsup.backend.model.Alumno;
import com.grindsup.backend.model.Entrenador;
import com.grindsup.backend.model.Estado;
import com.grindsup.backend.repository.AlumnoRepository;
import com.grindsup.backend.repository.EntrenadorRepository;
import com.grindsup.backend.repository.EstadoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/alumnos")
public class AlumnoController {

    private final AlumnoRepository alumnoRepository;
    private final EntrenadorRepository entrenadorRepository;
    private final EstadoRepository estadoRepository;

    public AlumnoController(
                AlumnoRepository alumnoRepository,
                EntrenadorRepository entrenadorRepository,
                EstadoRepository estadoRepository
    ) {
        this.alumnoRepository = alumnoRepository;
        this.entrenadorRepository = entrenadorRepository;
        this.estadoRepository = estadoRepository;
    }


    /* ----------------- GET ?documento=xxxx (para chequeo de DNI) ----------------- */
    @GetMapping
    public ResponseEntity<List<Alumno>> findByDocumento(@RequestParam(name = "documento", required = false) String documento) {
        if (documento == null || documento.isBlank()) {
            // Podés devolver vacio para el autocompletado del front
            return ResponseEntity.ok(List.of());
        }
        // solo activos
        Optional<Alumno> uno = alumnoRepository.findByDocumentoAndDeletedAtIsNull(documento.trim());
        return ResponseEntity.ok(uno.map(List::of).orElseGet(List::of));
    }

    /* ----------------- GET /exists?documento=xxxx (chequeo liviano) ----------------- */
    @GetMapping("/exists")
    public ResponseEntity<Map<String, Boolean>> existsByDocumento(
            @RequestParam(name = "documento") String documento) {

        if (documento == null || documento.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("exists", false));
        }

        boolean exists = alumnoRepository.existsByDocumentoAndDeletedAtIsNull(documento.trim());
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    // ✅ NUEVO: listar alumnos por entrenador
    @GetMapping(params = "entrenadorId")
    public ResponseEntity<List<AlumnoListDTO>> listarPorEntrenador( // <-- Retorna List<AlumnoListDTO>
                @RequestParam("entrenadorId") Long entrenadorId
    ) {
        // Usa el nuevo método que devuelve el DTO (findActivosDTOByEntrenador)
        List<AlumnoListDTO> lista = alumnoRepository.findActivosDTOByEntrenador(entrenadorId);
        return ResponseEntity.ok(lista); // <-- Ahora lista es un List<AlumnoListDTO>
    }

    // Opcional: GET by ID (Necesario para el formulario de edición)
    @GetMapping("/{id}")
    public ResponseEntity<Alumno> getById(@PathVariable Long id) {
        return alumnoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    /* ----------------- POST /api/alumnos ----------------- */
    @PostMapping
    public ResponseEntity<Alumno> create(@RequestBody Map<String, Object> body) {

        // Campos básicos
        String nombre = str(body.get("nombre"));
        String apellido = str(body.get("apellido"));
        String documento = str(body.get("documento"));
        String telefono = str(body.get("telefono"));
        Boolean informeMedico = bool(body.get("informeMedico"), false);

        if (nombre.isBlank() || apellido.isBlank() || documento.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Faltan campos obligatorios (nombre/apellido/documento)");
        }

        // Duplicado por documento (solo activos)
        if (alumnoRepository.findByDocumentoAndDeletedAtIsNull(documento).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El documento ya está registrado");
        }

        Alumno a = new Alumno();
        a.setNombre(nombre);
        a.setApellido(apellido);
        a.setDocumento(documento);
        a.setTelefono(telefono);
        a.setInformeMedico(informeMedico);

        // fechaNacimiento (yyyy-MM-dd)
        String fn = str(body.get("fechaNacimiento"));
        if (!fn.isBlank()) {
            a.setFechaNacimiento(java.time.LocalDate.parse(fn));
        }

        // peso / altura (opcionales)
        a.setPeso(toDouble(body.get("peso")));
        a.setAltura(toDouble(body.get("altura")));

        // lesiones / enfermedades (texto JSON que armás en el front)
        a.setLesiones(str(body.get("lesiones")));
        a.setEnfermedades(str(body.get("enfermedades")));

        // estado { id_estado: X }
        Long idEstado = nestedId(body.get("estado"), "id_estado");
        if (idEstado != null) {
            Estado estado = estadoRepository.findById(idEstado)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Estado inválido"));
            a.setEstado(estado);
        }

        // entrenador: { id_entrenador: X } ó { id: X }
        Long idEntrenador = nestedId(body.get("entrenador"), "id_entrenador");
        if (idEntrenador == null) {
            idEntrenador = nestedId(body.get("entrenador"), "id");
        }
        if (idEntrenador != null) {
            Entrenador e = entrenadorRepository.findById(idEntrenador)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Entrenador inválido"));
            a.setEntrenador(e);
        }

        // timestamps (por si no se llaman los callbacks, igual lo forzamos)
        a.setCreated_at(OffsetDateTime.now());
        a.setUpdated_at(OffsetDateTime.now());

        Alumno saved = alumnoRepository.save(a);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
    
    
    /* ----------------- PUT /api/alumnos/{id} ----------------- */
    @PutMapping("/{id}")
    public ResponseEntity<Alumno> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        
        Alumno existing = alumnoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alumno no encontrado"));

        // Campos básicos
        String nombre = str(body.get("nombre"));
        String apellido = str(body.get("apellido"));
        // El documento no se edita, se mantiene el existente
        String telefono = str(body.get("telefono"));
        Boolean informeMedico = bool(body.get("informeMedico"), false);

        if (nombre.isBlank() || apellido.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Faltan campos obligatorios (nombre/apellido)");
        }
        
        existing.setNombre(nombre);
        existing.setApellido(apellido);
        existing.setTelefono(telefono);
        existing.setInformeMedico(informeMedico);

        // ✅ CORRECCIÓN: Manejo seguro de fecha de nacimiento (permite enviar "" para limpiar o actualizar)
        String fn = str(body.get("fechaNacimiento"));
        if (!fn.isBlank()) {
             try {
                 existing.setFechaNacimiento(java.time.LocalDate.parse(fn));
             } catch (Exception e) {
                 // Si falla el parseo (ej: formato incorrecto), lanza un error legible.
                 throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Formato de fechaNacimiento inválido.");
             }
        } else {
             // Si se envía un String vacío, establece la fecha a null
             existing.setFechaNacimiento(null);
        }

        // peso / altura (opcionales)
        existing.setPeso(toDouble(body.get("peso")));
        existing.setAltura(toDouble(body.get("altura")));

        // lesiones / enfermedades (texto JSON)
        existing.setLesiones(str(body.get("lesiones")));
        existing.setEnfermedades(str(body.get("enfermedades")));

        // estado { id_estado: X } (Si se envía)
        Long idEstado = nestedId(body.get("estado"), "id_estado");
        if (idEstado != null) {
            Estado estado = estadoRepository.findById(idEstado)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Estado inválido"));
            existing.setEstado(estado);
        }

        // Actualizar timestamp
        existing.setUpdated_at(OffsetDateTime.now());

        Alumno saved = alumnoRepository.save(existing);
        return ResponseEntity.ok(saved);
    }
    
    /* ----------------- DELETE /api/alumnos/{id} ----------------- */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        
        Alumno alumno = alumnoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alumno no encontrado"));
                
        String motivo = str(body.get("motivo"));

        if (motivo.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Motivo de baja es obligatorio.");
        }
        
        // Ejecutar eliminación lógica (Soft Delete)
        alumno.setDeletedAt(java.time.LocalDateTime.now()); 
        alumno.setMotivoBaja(motivo); 
        alumno.setUpdated_at(OffsetDateTime.now());

        alumnoRepository.save(alumno);
        
        return ResponseEntity.ok(Map.of("message", "Alumno dado de baja correctamente"));
    }
    
    // Opcional: PATCH para informeMedico (si lo usas para la lista rápida)
    @PatchMapping("/{id}/informe")
    public ResponseEntity<?> updateInformeMedico(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        
        Alumno alumno = alumnoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alumno no encontrado"));
                
        Boolean informeMedico = body.get("informeMedico");
        if (informeMedico == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Falta el campo 'informeMedico'");
        }
        
        alumno.setInformeMedico(informeMedico);
        alumno.setUpdated_at(OffsetDateTime.now());
        alumnoRepository.save(alumno);
        
        return ResponseEntity.ok(Map.of("message", "Informe médico actualizado"));
    }
    


    /* ----------------- Helpers ----------------- */
    private static String str(Object o) { return o == null ? "" : String.valueOf(o).trim(); }
    private static Boolean bool(Object o, boolean dflt) {
        if (o == null) return dflt;
        if (o instanceof Boolean b) return b;
        return Boolean.parseBoolean(String.valueOf(o));
    }
    private static Double toDouble(Object o) {
        if (o == null) return null;
        try { return Double.valueOf(String.valueOf(o)); } catch (Exception e) { return null; }
    }
    @SuppressWarnings("unchecked")
    private static Long nestedId(Object node, String key) {
        if (node instanceof Map<?, ?> m) {
            Object v = m.get(key);
            if (v == null) return null;
            try { return Long.valueOf(String.valueOf(v)); } catch (Exception ignored) { return null; }
        }
        return null;
    }
}