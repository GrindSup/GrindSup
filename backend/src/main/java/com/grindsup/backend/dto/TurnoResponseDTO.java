package com.grindsup.backend.DTO;

import java.time.OffsetDateTime;

public class TurnoResponseDTO {
    private Long id_turno;
    private String entrenador;
    private String tipo_turno;
    private OffsetDateTime fecha;

    // Constructor
    public TurnoResponseDTO(Long id_turno, String entrenador, String tipo_turno, OffsetDateTime fecha) {
        this.id_turno = id_turno;
        this.entrenador = entrenador;
        this.tipo_turno = tipo_turno;
        this.fecha = fecha;
    }

    // Getters
    public Long getId_turno() { return id_turno; }
    public String getEntrenador() { return entrenador; }
    public String getTipo_turno() { return tipo_turno; }
    public OffsetDateTime getFecha() { return fecha; }
}