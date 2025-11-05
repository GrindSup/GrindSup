package com.grindsup.backend.DTO;
import java.time.LocalDate;

public class ReporteProgresoDTO {
    private Long idAlumno;
    private String nombreCompleto;
    private int diasPlanificados;
    private int diasEntrenados;
    private double cumplimientoSemanal;
    private double cumplimientoMensual;
    private String ultimaRutina;
    private LocalDate fechaUltimaRutina;
}
