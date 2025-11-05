package com.grindsup.backend.controller;

import com.grindsup.backend.model.PlanEntrenamiento;
import com.grindsup.backend.model.Rutina;
import com.grindsup.backend.model.RutinaEjercicio;
import com.grindsup.backend.DTO.CrearPlanrequestDTO;
import com.grindsup.backend.DTO.CrearRutinarequestDTO;
import com.grindsup.backend.DTO.EjercicioRutinaDTO;
import com.grindsup.backend.model.Alumno;
import com.grindsup.backend.model.Ejercicio;
import com.grindsup.backend.model.Estado;
import com.grindsup.backend.model.GrupoMuscularEnum;
import com.grindsup.backend.repository.PlanEntrenamientoRepository;
import com.grindsup.backend.repository.RutinaEjercicioRepository;
import com.grindsup.backend.repository.RutinaRepository;
import com.grindsup.backend.service.PlanEntrenamientoService;
import com.grindsup.backend.repository.AlumnoRepository;
import com.grindsup.backend.repository.EjercicioRepository;
import com.grindsup.backend.repository.EstadoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/planes")
public class PlanEntrenamientoController {

    @Autowired
    private PlanEntrenamientoRepository planRepository;

    @Autowired
    private AlumnoRepository alumnoRepository;

    @Autowired
    private EstadoRepository estadoRepository;

    @Autowired
    private PlanEntrenamientoService planService;

    @Autowired
    private RutinaRepository rutinaRepository;

    @Autowired
    private RutinaEjercicioRepository rutinaEjercicioRepository;

    @Autowired
    private EjercicioRepository ejercicioRepository;

    // ==========================
    // CRUD Planes
    // ==========================
    @GetMapping
    public List<PlanEntrenamiento> getAll() {
        return planRepository.findAll();
    }

    @GetMapping("/{id}")
    public PlanEntrenamiento getById(@PathVariable Long id) {
        return planRepository.findById(id).orElse(null);
    }

    @PutMapping("/{id}")
    public PlanEntrenamiento update(@PathVariable Long id, @RequestBody PlanEntrenamiento plan) {
        return planRepository.findById(id).map(existing -> {
            existing.setObjetivo(plan.getObjetivo());
            existing.setFecha_inicio(plan.getFecha_inicio());
            existing.setFecha_fin(plan.getFecha_fin());

            if (plan.getAlumno() != null) {
                Alumno alumno = alumnoRepository.findById(plan.getAlumno().getId_alumno()).orElse(null);
                existing.setAlumno(alumno);
            }
            if (plan.getEstado() != null) {
                Estado estado = estadoRepository.findById(plan.getEstado().getId_estado()).orElse(null);
                existing.setEstado(estado);
            }

            return planRepository.save(existing);
        }).orElse(null);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        planRepository.deleteById(id);
        return "Plan eliminado con id " + id;
    }

    @PostMapping
    public ResponseEntity<PlanEntrenamiento> crearPlan(@RequestBody CrearPlanrequestDTO request) {
        PlanEntrenamiento nuevoPlan = planService.crearPlan(request);
        return ResponseEntity.ok(nuevoPlan);
    }

    @GetMapping("/alumno/{idAlumno}")
    public ResponseEntity<List<PlanEntrenamiento>> obtenerPlanesPorAlumno(@PathVariable Long idAlumno) {
        return ResponseEntity.ok(planService.listarPlanesPorAlumno(idAlumno));
    }

    @GetMapping("/{idPlan}")
    public ResponseEntity<PlanEntrenamiento> obtenerPlan(@PathVariable Long idPlan) {
        return planService.obtenerPlan(idPlan)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ==========================
    // Grupos musculares (provisional)
    // ==========================
    @GetMapping("/grupos-musculares")
    public List<Map<String, String>> listarGrupos() {
        return Arrays.stream(GrupoMuscularEnum.values())
                .map(g -> Map.of("nombre", g.getNombre(), "descripcion", g.getDescripcion()))
                .toList();
    }

    // ==========================
    // Crear rutina asociada a un plan
    // ==========================
    @PostMapping("/{idPlan}/rutinas")
    @Transactional
    public ResponseEntity<Rutina> crearRutina(@PathVariable Long idPlan, @RequestBody CrearRutinarequestDTO request) {
        // 1) buscar plan
        PlanEntrenamiento plan = planRepository.findById(idPlan)
                .orElseThrow(() -> new RuntimeException("Plan no encontrado"));

        // 2) crear rutina y setear metadatos
        Rutina rutina = new Rutina();
        rutina.setNombre(request.getNombre());
        rutina.setDescripcion(request.getDescripcion());
        rutina.setPlan(plan);

        // estado por defecto (o usar request si viene)
        Estado estadoRutina = estadoRepository.findById(
                request.getIdEstado() != null ? request.getIdEstado() : 1L)
            .orElseThrow(() -> new RuntimeException("Estado no encontrado"));
        rutina.setEstado(estadoRutina);

        rutina.setCreated_at(OffsetDateTime.now());
        rutina.setUpdated_at(OffsetDateTime.now());

        // 3) primero guardo la rutina (para tener id_rutina)
        Rutina nuevaRutina = rutinaRepository.save(rutina);

        // 4) ahora guardo los ejercicios asociados (si los hay)
        if (request.getEjercicios() != null && !request.getEjercicios().isEmpty()) {
            List<RutinaEjercicio> lista = new ArrayList<>();
            for (EjercicioRutinaDTO dto : request.getEjercicios()) {
                // buscar ejercicio
                Ejercicio ejercicio = ejercicioRepository.findById(dto.getIdEjercicio())
                        .orElseThrow(() -> new RuntimeException("Ejercicio no encontrado: " + dto.getIdEjercicio()));

                RutinaEjercicio re = new RutinaEjercicio();

                // --- Muy importante: setear LOS IDS de la PK compuesta ---
                re.setId_rutina(nuevaRutina.getId_rutina());      // campo primario en la entidad
                re.setId_ejercicio(ejercicio.getId_ejercicio()); // campo primario en la entidad

                // y además mantener las referencias para JPA/Hibernate
                re.setRutina(nuevaRutina);
                re.setEjercicio(ejercicio);

                // campos del DTO
                re.setSeries(dto.getSeries());
                re.setRepeticiones(dto.getRepeticiones());
                re.setDescanso_segundos(dto.getDescansoSegundos());
                re.setObservaciones(dto.getObservaciones());
                // si tenés campo grupo_muscular en la entidad:
                // re.setGrupo_muscular(dto.getGrupoMuscular());

                re.setEstado(estadoRutina); // o buscá otro estado si corresponde
                re.setCreated_at(OffsetDateTime.now());
                re.setUpdated_at(OffsetDateTime.now());

                lista.add(re);
            }
            rutinaEjercicioRepository.saveAll(lista);
        }

        return ResponseEntity.ok(nuevaRutina);
    }
    @PutMapping("/{id}/estado")
    public ResponseEntity<?> actualizarEstadoRutina(
        @PathVariable Long id,
        @RequestParam Long idEstado) {
    planService.actualizarEstado(id, idEstado);
    return ResponseEntity.ok("Estado actualizado correctamente");
    }

    @GetMapping("/alumno/{idAlumno}/estado/{idEstado}")
    public ResponseEntity<List<PlanEntrenamiento>> obtenerPlanesPorAlumnoYEstado(
            @PathVariable Long idAlumno,
            @PathVariable Long idEstado) {

        List<PlanEntrenamiento> planes = planService.listarPlanesPorAlumnoYEstado(idAlumno, idEstado);
        return ResponseEntity.ok(planes);
    }
    
    @GetMapping("/estado/{idEstado}")
    public ResponseEntity<List<PlanEntrenamiento>> obtenerPlanesPorEstado(
            @PathVariable Long idEstado) {

        List<PlanEntrenamiento> planes = planService.listarPlanesPorEstado(idEstado);
        return ResponseEntity.ok(planes);
    }
}
