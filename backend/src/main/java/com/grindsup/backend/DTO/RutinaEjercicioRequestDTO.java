package com.grindsup.backend.DTO;

public class RutinaEjercicioRequestDTO {
    private Long idEjercicio;
    private Integer series;
    private Integer repeticiones;
    private Integer descansoSegundos;

    // Getters y Setters
    public Long getIdEjercicio() { return idEjercicio; }
    public void setIdEjercicio(Long idEjercicio) { this.idEjercicio = idEjercicio; }

    public Integer getSeries() { return series; }
    public void setSeries(Integer series) { this.series = series; }

    public Integer getRepeticiones() { return repeticiones; }
    public void setRepeticiones(Integer repeticiones) { this.repeticiones = repeticiones; }

    public Integer getDescansoSegundos() { return descansoSegundos; }
    public void setDescansoSegundos(Integer descansoSegundos) { this.descansoSegundos = descansoSegundos; }
}
