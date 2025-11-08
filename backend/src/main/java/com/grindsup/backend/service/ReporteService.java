package com.grindsup.backend.service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.grindsup.backend.DTO.ReporteProgresoPlanesDTO;
import com.grindsup.backend.model.Alumno;
import com.grindsup.backend.repository.AlumnoRepository;
import com.grindsup.backend.repository.PlanEntrenamientoRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class ReporteService {

    @Autowired
    private PlanEntrenamientoRepository planEntrenamientoRepository;

    @Autowired
    private AlumnoRepository alumnoRepository;

    public ReporteProgresoPlanesDTO generarReporteProgresoPlanesDeAlumno(Long idAlumno) {
        Alumno alumno = alumnoRepository.findById(idAlumno)
                .orElseThrow(() -> new EntityNotFoundException("Alumno no encontrado"));

        float total = planEntrenamientoRepository.findByAlumno_IdAlumno(idAlumno).size();
        //revisar nomrbes
        float completadas = planEntrenamientoRepository.findByAlumno_IdAlumnoAndEstado_nombre(idAlumno, "Completada").size();
        float incompletas = planEntrenamientoRepository.findByAlumno_IdAlumnoAndEstado_nombre(idAlumno, "Incompleta").size();
        float enProceso = planEntrenamientoRepository.findByAlumno_IdAlumnoAndEstado_nombre(idAlumno, "En Proceso").size();

        float porcentaje = (total > 0) ? ((float) completadas / total) * 100 : 0;

        return new ReporteProgresoPlanesDTO(
                alumno.getId_alumno(),
                alumno.getNombre() + " " + alumno.getApellido(),
                total,
                completadas,
                incompletas,
                enProceso,
                porcentaje
        );
    }
    
}
