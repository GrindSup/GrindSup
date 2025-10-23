package com.grindsup.backend.DTO;

import java.time.OffsetDateTime;
import java.util.List;

public class TurnoRequestDTO {
    private Long entrenadorId;
    private Long tipoTurnoId;
    private OffsetDateTime fecha;
    private List<Long> alumnosIds;
    private Long estadoId;
    private String userId;

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

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