package com.grindsup.backend.service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.grindsup.backend.DTO.CrearPlanrequestDTO;
import com.grindsup.backend.model.Alumno;
import com.grindsup.backend.model.Estado;
import com.grindsup.backend.model.PlanEntrenamiento;
import com.grindsup.backend.model.Rutina;
import com.grindsup.backend.repository.AlumnoRepository;
import com.grindsup.backend.repository.EstadoRepository;
import com.grindsup.backend.repository.PlanEntrenamientoRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class PlanEntrenamientoService {

    @Autowired
    private PlanEntrenamientoRepository planRepository;
    // deberia ser final?
    @Autowired
    private EstadoRepository estadoRepository;

    @Autowired
    private AlumnoRepository alumnoRepository;

    public PlanEntrenamiento crearPlan(CrearPlanrequestDTO request) {
        Alumno alumno = alumnoRepository.findById(request.getIdAlumno())
                .orElseThrow(() -> new RuntimeException("Alumno no encontrado"));

        PlanEntrenamiento plan = new PlanEntrenamiento();
        plan.setAlumno(alumno);
        plan.setObjetivo(request.getObjetivo());
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
}
