package com.grindsup.backend.service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.grindsup.backend.DTO.CrearPlanrequestDTO;
import com.grindsup.backend.model.Alumno;
import com.grindsup.backend.model.PlanEntrenamiento;
import com.grindsup.backend.repository.AlumnoRepository;
import com.grindsup.backend.repository.PlanEntrenamientoRepository;

@Service
public class PlanEntrenamientoService {

    @Autowired
    private PlanEntrenamientoRepository planRepository;

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

        return planRepository.save(plan);
    }

    public List<PlanEntrenamiento> listarPlanesPorAlumno(Long idAlumno) {
        return planRepository.findByAlumno_IdAlumno(idAlumno);
    }

    public Optional<PlanEntrenamiento> obtenerPlan(Long idPlan) {
        return planRepository.findById(idPlan);
    }
}
