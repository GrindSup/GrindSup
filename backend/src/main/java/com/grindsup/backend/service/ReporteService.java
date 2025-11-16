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

        float completadas =
                planEntrenamientoRepository.findByAlumno_IdAlumnoAndEstado_Nombre(idAlumno, "Completada").size();

        float incompletas =
                planEntrenamientoRepository.findByAlumno_IdAlumnoAndEstado_Nombre(idAlumno, "Incompleta").size();

        float enProceso =
                planEntrenamientoRepository.findByAlumno_IdAlumnoAndEstado_Nombre(idAlumno, "En Proceso").size();

        float porcentaje = (total > 0) ? ((float) completadas / total) * 100 : 0;

        // =======================
        // Datos del Entrenador
        // =======================
        Long idEntrenador = null;
        String nombreEntrenador = null;
        String correoEntrenador = null;
        String telefonoEntrenador = null;

        if (alumno.getEntrenador() != null) {
            idEntrenador = alumno.getEntrenador().getIdEntrenador();

            if (alumno.getEntrenador().getUsuario() != null) {
                nombreEntrenador =
                        alumno.getEntrenador().getUsuario().getNombre() + " " +
                        alumno.getEntrenador().getUsuario().getApellido();

                correoEntrenador = alumno.getEntrenador().getUsuario().getCorreo();
            }

            telefonoEntrenador = alumno.getEntrenador().getTelefono();
        }

        return new ReporteProgresoPlanesDTO(
                alumno.getId_alumno(),
                alumno.getNombre() + " " + alumno.getApellido(),
                total,
                completadas,
                incompletas,
                enProceso,
                porcentaje,
                idEntrenador,
                nombreEntrenador,
                correoEntrenador,
                telefonoEntrenador
        );
    }
}
