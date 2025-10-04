package com.grindsup.backend.DTO;

import java.time.OffsetDateTime;
import java.util.List;

public class TurnoRequestDTO {
    private Long entrenadorId;          // ID del entrenador
    private Long tipoTurnoId;           // Ahora usamos el ID en lugar del nombre
    private OffsetDateTime fecha;       // Fecha y hora del turno
    private List<Long> alumnosIds;      // IDs de alumnos asignados
    private Long estadoId;              // Estado del turno (opcional)

    // Getters y Setters
    public Long getEntrenadorId() {
        return entrenadorId;
    }

    public void setEntrenadorId(Long entrenadorId) {
        this.entrenadorId = entrenadorId;
    }

    public Long getTipoTurnoId() {
        return tipoTurnoId;
    }

    public void setTipoTurnoId(Long tipoTurnoId) {
        this.tipoTurnoId = tipoTurnoId;
    }

    public OffsetDateTime getFecha() {
        return fecha;
    }

    public void setFecha(OffsetDateTime fecha) {
        this.fecha = fecha;
    }

    public List<Long> getAlumnosIds() {
        return alumnosIds;
    }

    public void setAlumnosIds(List<Long> alumnosIds) {
        this.alumnosIds = alumnosIds;
    }

    public Long getEstadoId() {
        return estadoId;
    }

    public void setEstadoId(Long estadoId) {
        this.estadoId = estadoId;
    }
}