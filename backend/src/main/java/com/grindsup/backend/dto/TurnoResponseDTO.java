package com.grindsup.backend.DTO;

import java.time.OffsetDateTime;
import java.util.List;

public class TurnoResponseDTO {
    private Long id_turno;
    private String entrenador;
    private String tipo_turno;
    private OffsetDateTime fecha;
    private List<String> alumnos;

    public TurnoResponseDTO(Long id_turno, String entrenador, String tipo_turno,
            OffsetDateTime fecha, List<String> alumnos) {
        this.id_turno = id_turno;
        this.entrenador = entrenador;
        this.tipo_turno = tipo_turno;
        this.fecha = fecha;
        this.alumnos = alumnos;
    }

    public Long getId_turno() {
        return id_turno;
    }

    public String getEntrenador() {
        return entrenador;
    }

    public String getTipo_turno() {
        return tipo_turno;
    }

    public OffsetDateTime getFecha() {
        return fecha;
    }

    public List<String> getAlumnos() {
        return alumnos;
    }
}