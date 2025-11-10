package com.grindsup.backend.controller;

import com.grindsup.backend.model.PlanEntrenamiento;
import com.grindsup.backend.model.Rutina;
import com.grindsup.backend.model.RutinaEjercicio;
import com.grindsup.backend.DTO.CrearPlanrequestDTO;
import com.grindsup.backend.DTO.CrearRutinarequestDTO;
import com.grindsup.backend.DTO.EjercicioRutinaDTO;
import com.grindsup.backend.DTO.PlanListDTO; // <-- Importación necesaria
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
@CrossOrigin
public class PlanEntrenamientoController {

    private final PlanEntrenamientoRepository planRepository;
    private final AlumnoRepository alumnoRepository;
    private final EstadoRepository estadoRepository;
    private final PlanEntrenamientoService planService;
    private final RutinaRepository rutinaRepository;
    private final RutinaEjercicioRepository rutinaEjercicioRepository;
    private final EjercicioRepository ejercicioRepository;

    public PlanEntrenamientoController(
                PlanEntrenamientoRepository planRepository,
                AlumnoRepository alumnoRepository,
                EstadoRepository estadoRepository,
                PlanEntrenamientoService planService,
                RutinaRepository rutinaRepository,
                RutinaEjercicioRepository rutinaEjercicioRepository,
                EjercicioRepository ejercicioRepository
    ) {
        this.planRepository = planRepository;
        this.alumnoRepository = alumnoRepository;
        this.estadoRepository = estadoRepository;
        this.planService = planService;
        this.rutinaRepository = rutinaRepository;
        this.rutinaEjercicioRepository = rutinaEjercicioRepository;
        this.ejercicioRepository = ejercicioRepository;
    }

    /* ==========================
        LISTAR PLANES POR ENTRENADOR
        ========================== */
    @GetMapping
    public ResponseEntity<List<PlanListDTO>> listarPorEntrenador( // <-- Retorna List<PlanListDTO>
                @RequestParam Long entrenadorId
    ) {
        // Usa el método de proyección
        List<PlanListDTO> lista = planRepository.findPlanDTOByEntrenador(entrenadorId);
        return ResponseEntity.ok(lista);
    }

    /* ==========================
        OBTENER PLAN POR ID
        ========================== */
    @GetMapping("/{id}")
    public ResponseEntity<PlanEntrenamiento> obtenerPlan(@PathVariable Long id) {
        return planRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    /* ==========================
        ACTUALIZAR PLAN
        ========================== */
    @PutMapping("/{id}")
    public ResponseEntity<PlanEntrenamiento> update(
                @PathVariable Long id,
                @RequestBody PlanEntrenamiento plan
    ) {
        return planRepository.findById(id).map(existing -> {

            existing.setObjetivo(plan.getObjetivo());
            existing.setFecha_inicio(plan.getFecha_inicio());
            existing.setFecha_fin(plan.getFecha_fin());

            if (plan.getAlumno() != null) {
                Alumno alumno = alumnoRepository
                        .findById(plan.getAlumno().getId_alumno())
                        .orElse(null);
                existing.setAlumno(alumno);
            }

            if (plan.getEstado() != null) {
                Estado estado = estadoRepository
                        .findById(plan.getEstado().getIdEstado())
                        .orElse(null);
                existing.setEstado(estado);
            }

            existing.setUpdated_at(OffsetDateTime.now());
            return ResponseEntity.ok(planRepository.save(existing));

        }).orElse(ResponseEntity.notFound().build());
    }

    /* ==========================
        ELIMINAR PLAN
        ========================== */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        planRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("deleted", id));
    }

    /* ==========================
        CREAR PLAN
        ========================== */
    @PostMapping
    public ResponseEntity<PlanEntrenamiento> crearPlan(
                @RequestBody CrearPlanrequestDTO request
    ) {
        PlanEntrenamiento nuevoPlan = planService.crearPlan(request);
        return ResponseEntity.ok(nuevoPlan);
    }

    /* ==========================
        LISTAR PLANES POR ALUMNO
        ========================== */
    @GetMapping("/alumno/{idAlumno}")
    public ResponseEntity<List<PlanEntrenamiento>> obtenerPlanesPorAlumno(
                @PathVariable Long idAlumno
    ) {
        return ResponseEntity.ok(planService.listarPlanesPorAlumno(idAlumno));
    }

    /* ==========================
        FINALIZAR PLAN
        ========================== */
    @PostMapping("/{idPlan}/finalizar")
    public ResponseEntity<?> finalizarPlan(@PathVariable Long idPlan) {
        PlanEntrenamiento actualizado = planService.finalizar(idPlan);
        return ResponseEntity.ok(actualizado);
    }

    /* ==========================
        GRUPOS MUSCULARES
        ========================== */
    @GetMapping("/grupos-musculares")
    public List<Map<String, String>> listarGrupos() {
        return Arrays.stream(GrupoMuscularEnum.values())
                .map(g -> Map.of("nombre", g.getNombre(), "descripcion", g.getDescripcion()))
                .toList();
    }

    /* ==========================
        CREAR RUTINA EN UN PLAN
        ========================== */
    @PostMapping("/{idPlan}/rutinas")
    @Transactional
    public ResponseEntity<Rutina> crearRutina(
                @PathVariable Long idPlan,
                @RequestBody CrearRutinarequestDTO request
    ) {
        PlanEntrenamiento plan = planRepository.findById(idPlan)
                .orElseThrow(() -> new RuntimeException("Plan no encontrado"));

        Rutina rutina = new Rutina();
        rutina.setNombre(request.getNombre());
        rutina.setDescripcion(request.getDescripcion());
        rutina.setPlan(plan);

        Estado estadoRutina = estadoRepository.findById(
                        request.getIdEstado() != null ? request.getIdEstado() : 1L
                ).orElseThrow(() -> new RuntimeException("Estado no encontrado"));

        rutina.setEstado(estadoRutina);
        rutina.setCreated_at(OffsetDateTime.now());
        rutina.setUpdated_at(OffsetDateTime.now());

        Rutina nuevaRutina = rutinaRepository.save(rutina);

        if (request.getEjercicios() != null && !request.getEjercicios().isEmpty()) {

            List<RutinaEjercicio> lista = new ArrayList<>();

            for (EjercicioRutinaDTO dto : request.getEjercicios()) {

                Ejercicio ejercicio = ejercicioRepository.findById(dto.getIdEjercicio())
                        .orElseThrow(() -> new RuntimeException("Ejercicio no encontrado: " + dto.getIdEjercicio()));

                RutinaEjercicio re = new RutinaEjercicio();
                re.setRutina(nuevaRutina);
                re.setEjercicio(ejercicio);
                re.setSeries(dto.getSeries());
                re.setRepeticiones(dto.getRepeticiones());
                re.setObservaciones(dto.getObservaciones());
                re.setEstado(estadoRutina);
                re.setCreated_at(OffsetDateTime.now());
                re.setUpdated_at(OffsetDateTime.now());

                lista.add(re);
            }

            rutinaEjercicioRepository.saveAll(lista);
        }

        return ResponseEntity.ok(nuevaRutina);
    }
}