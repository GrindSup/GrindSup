package com.grindsup.backend.DTO;

import java.time.LocalDate;
import java.time.OffsetDateTime;

public class PlanListDTO {
    private Long idPlan;
    private String objetivo;
    private LocalDate fechaInicio; 
    private LocalDate fechaFin;    
    private Long idAlumno;
    private String nombreAlumno;
    private String apellidoAlumno;
    private Long idEstado;
    private String nombreEstado;
    private OffsetDateTime created_at;

    public PlanListDTO() {}

    // Constructor que coincide exactamente con la proyección HQL (usando snake_case para las fechas)
    public PlanListDTO(
        Long idPlan, String objetivo, 
        LocalDate fecha_inicio, // Parámetro snake_case (viene de la Entidad JPA)
        LocalDate fecha_fin,    // Parámetro snake_case (viene de la Entidad JPA)
        Long idAlumno, String nombreAlumno, String apellidoAlumno,
        Long idEstado, String nombreEstado, OffsetDateTime created_at
    ) {
        this.idPlan = idPlan;
        this.objetivo = objetivo;
        this.fechaInicio = fecha_inicio; // Mapeo interno
        this.fechaFin = fecha_fin;       // Mapeo interno
        this.idAlumno = idAlumno;
        this.nombreAlumno = nombreAlumno;
        this.apellidoAlumno = apellidoAlumno;
        this.idEstado = idEstado;
        this.nombreEstado = nombreEstado;
        this.created_at = created_at;
    }

    // ====== GETTERS ======
    
    public Long getIdPlan() { return idPlan; }
    public String getObjetivo() { return objetivo; }
    public LocalDate getFechaInicio() { return fechaInicio; }
    public LocalDate getFechaFin() { return fechaFin; }
    public Long getIdAlumno() { return idAlumno; }
    public String getNombreAlumno() { return nombreAlumno; }
    public String getApellidoAlumno() { return apellidoAlumno; }
    public Long getIdEstado() { return idEstado; }
    public String getNombreEstado() { return nombreEstado; }
    public OffsetDateTime getCreated_at() { return created_at; }

    // ====== SETTERS (Completados) ======

    public void setIdPlan(Long idPlan) { this.idPlan = idPlan; }
    public void setObjetivo(String objetivo) { this.objetivo = objetivo; }
    public void setFechaInicio(LocalDate fechaInicio) { this.fechaInicio = fechaInicio; }
    public void setFechaFin(LocalDate fechaFin) { this.fechaFin = fechaFin; }
    public void setIdAlumno(Long idAlumno) { this.idAlumno = idAlumno; }
    public void setNombreAlumno(String nombreAlumno) { this.nombreAlumno = nombreAlumno; }
    public void setApellidoAlumno(String apellidoAlumno) { this.apellidoAlumno = apellidoAlumno; }
    public void setIdEstado(Long idEstado) { this.idEstado = idEstado; }
    public void setNombreEstado(String nombreEstado) { this.nombreEstado = nombreEstado; }
    public void setCreated_at(OffsetDateTime created_at) { this.created_at = created_at; }
}