package com.grindsup.backend.service;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.grindsup.backend.DTO.CrearPlanrequestDTO;
import com.grindsup.backend.model.Alumno;
import com.grindsup.backend.model.Entrenador; // <-- Importación necesaria
import com.grindsup.backend.model.Estado;
import com.grindsup.backend.model.PlanEntrenamiento;
import com.grindsup.backend.repository.AlumnoRepository;
import com.grindsup.backend.repository.EstadoRepository;
import com.grindsup.backend.repository.PlanEntrenamientoRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class PlanEntrenamientoService {

    private final PlanEntrenamientoRepository planRepository;
    private final AlumnoRepository alumnoRepository;
    private final EstadoRepository estadoRepository;
    private final NotificacionService notificacionService;

    public PlanEntrenamientoService(
            PlanEntrenamientoRepository planRepository,
            AlumnoRepository alumnoRepository,
            EstadoRepository estadoRepository,
            NotificacionService notificacionService) {
        this.planRepository = planRepository;
        this.alumnoRepository = alumnoRepository;
        this.estadoRepository = estadoRepository;
        this.notificacionService = notificacionService;
    }

    public PlanEntrenamiento crearPlan(CrearPlanrequestDTO request) {
        Alumno alumno = alumnoRepository.findById(request.getIdAlumno())
                .orElseThrow(() -> new RuntimeException("Alumno no encontrado"));

        // 🎯 CORRECCIÓN CLAVE: Obtener y asignar el Entrenador del Alumno
        Entrenador entrenador = alumno.getEntrenador();
        if (entrenador == null) {
            throw new RuntimeException("El alumno no tiene un entrenador asociado. No se puede crear el plan.");
        }

        PlanEntrenamiento plan = new PlanEntrenamiento();
        plan.setAlumno(alumno);

        // Asignar el Entrenador al plan antes de guardar
        plan.setEntrenador(entrenador); // <-- ¡ESTO RESUELVE EL PROBLEMA DEL ID NULL!

        plan.setObjetivo(request.getObjetivo());
        // Asumiendo LocalDate en la entidad:
        plan.setFecha_inicio(request.getFechaInicio());
        plan.setFecha_fin(request.getFechaFin());
        plan.setCreated_at(OffsetDateTime.now());
        plan.setUpdated_at(OffsetDateTime.now());

        // probar sino findByName
        Estado estadoInicial = estadoRepository.findById((long) 3)
                .orElseThrow(() -> new EntityNotFoundException("Estado 'En proceso' no encontrado"));
        plan.setEstado(estadoInicial);

        return planRepository.save(plan);
    }

    public List<PlanEntrenamiento> listarPlanesPorAlumno(Long idAlumno) {
        return planRepository.findByAlumno_IdAlumno(idAlumno);
    }

    public Optional<PlanEntrenamiento> obtenerPlan(Long idPlan) {
        return planRepository.findById(idPlan);
    }

    @Transactional
    public void actualizarEstado(Long idPlan, Long idEstado) {
        // deberiamos asignar un valor por defecto en caso de no encontrar?
        Estado estado = estadoRepository.findById(idEstado)
                .orElseThrow(() -> new EntityNotFoundException("Estado no encontrado"));
        PlanEntrenamiento plan = planRepository.findById(idPlan)
                .orElseThrow(() -> new EntityNotFoundException("Plan de entrenamiento no encontrado"));
        plan.setEstado(estado);
        plan.setUpdated_at(OffsetDateTime.now());
        planRepository.save(plan);
    }

    public List<PlanEntrenamiento> listarPlanesPorAlumnoYEstado(Long idAlumno, Long idEstado) {
        return planRepository.findByAlumno_IdAlumnoAndEstado_IdEstado(idAlumno, idEstado);
    }

    public List<PlanEntrenamiento> listarPlanesPorEstado(Long idEstado) {
        return planRepository.findByEstado_IdEstado(idEstado);
    }

    /** Finaliza el plan: fecha_fin = hoy, y setea estado FINALIZADO si existe. */
    public PlanEntrenamiento finalizar(Long idPlan) {
        PlanEntrenamiento plan = planRepository.findById(idPlan)
                .orElseThrow(() -> new IllegalArgumentException("Plan no encontrado"));

        // ✅ LocalDate directamente (sin java.sql.Date)
        plan.setFecha_fin(LocalDate.now());

        // ✅ Estado FINALIZADO (si existe en la tabla estados)
        estadoRepository.findByNombreIgnoreCase("FINALIZADO")
                .ifPresent(plan::setEstado);

        plan.setUpdated_at(OffsetDateTime.now());
        PlanEntrenamiento planFinalizado = planRepository.save(plan);

        // ✔️ NOTIFICACIÓN SOLO PARA EL ENTRENADOR
        notificacionService.crearNotificacionParaEntrenador(
                "Plan finalizado",
                "El plan del alumno " + planFinalizado.getAlumno().getNombre() +
                        " (" + planFinalizado.getObjetivo() + ") ha sido finalizado. No te olvides de calificarlo",
                planFinalizado.getEntrenador());

        return planFinalizado;
    }
}