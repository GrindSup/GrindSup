package com.grindsup.backend.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.grindsup.backend.DTO.ReporteProgresoDTO;
import com.grindsup.backend.model.Alumno;
import com.grindsup.backend.model.Estado;
import com.grindsup.backend.model.Rutina;
import com.grindsup.backend.repository.AlumnoRepository;
import com.grindsup.backend.repository.EstadoRepository;
import com.grindsup.backend.repository.RutinaRepository;
import com.grindsup.backend.repository.TurnoRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class ReporteProgresoService {

    @Autowired
    private TurnoRepository turnoRepository;

    @Autowired
    private RutinaRepository rutinaRepository;

    @Autowired
    private AlumnoRepository alumnoRepository;

    @Autowired
    private EstadoRepository estadoRepository;

    public List<ReporteProgresoDTO> generarReporteProgreso(long alumnoId) {
        Alumno alumno = alumnoRepository.findById(alumnoId).orElseThrow(() -> new EntityNotFoundException("Estado no encontrado"));
        // Estado estadoCompletado = estadoRepository.findByNombre("Completado")
        //         .orElseThrow(() -> new EntityNotFoundException("Estado 'Completado' no encontrado"));
        Estado estadoCompletado = estadoRepository.findById((long) 3)
                .orElseThrow(() -> new EntityNotFoundException("Estado 'Completado' no encontrado"));        

        // Ejemplo de cálculo: se pueden ajustar luego según tus reglas reales
        int diasPlanificados = turnoRepository.countTurnosByAlumnoId(alumno);
        int diasEntrenados = rutinaRepository.countRutinasByAlumnoAndEstado(alumno, estadoCompletado.getId_estado());

        double cumplimientoSemanal = (diasEntrenados * 100.0) / Math.max(1, diasPlanificados);
        double cumplimientoMensual = cumplimientoSemanal; // se puede ajustar con otro rango temporal

        Rutina ultimaRutina = rutinaRepository.findUltimaRutinaCompletada(alumno.getId(), estadoCompletado.getId())
                .orElse(null);

        reportes.add(new ReporteProgresoDTO(
                alumno.getId(),
                alumno.getNombre() + " " + alumno.getApellido(),
                diasPlanificados,
                diasEntrenados,
                cumplimientoSemanal,
                cumplimientoMensual,
                ultimaRutina != null ? ultimaRutina.getNombre() : "—",
                ultimaRutina != null ? ultimaRutina.getUpdatedAt().toLocalDateTime().toLocalDate() : null
        ));

        return reportes;
    }
}
