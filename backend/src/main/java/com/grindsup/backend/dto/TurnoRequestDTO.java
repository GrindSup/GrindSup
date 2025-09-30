package com.grindsup.backend.dto;

import java.time.OffsetDateTime;

public class TurnoRequestDTO {
    private Long entrenadorId;       
    private String tipoTurno;        
    private OffsetDateTime fecha;    

    // Getters y Setters
    public Long getEntrenadorId() {
        return entrenadorId;
    }

    public void setEntrenadorId(Long entrenadorId) {
        this.entrenadorId = entrenadorId;
    }

    public String getTipoTurno() {
        return tipoTurno;
    }

    public void setTipoTurno(String tipoTurno) {
        this.tipoTurno = tipoTurno;
    }

    public OffsetDateTime getFecha() {
        return fecha;
    }

    public void setFecha(OffsetDateTime fecha) {
        this.fecha = fecha;
    }
}