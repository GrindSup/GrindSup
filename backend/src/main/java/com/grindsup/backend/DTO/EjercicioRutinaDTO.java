package com.grindsup.backend.DTO;

public class EjercicioRutinaDTO {
    private Long idEjercicio;
    private String grupoMuscular;
    private Integer series;
    private Integer repeticiones;
    private Integer descansoSegundos;
    private String observaciones;
    
    public Long getIdEjercicio() {
        return idEjercicio;
    }
    public void setIdEjercicio(Long idEjercicio) {
        this.idEjercicio = idEjercicio;
    }
    public String getGrupoMuscular() {
        return grupoMuscular;
    }
    public void setGrupoMuscular(String grupoMuscular) {
        this.grupoMuscular = grupoMuscular;
    }
    public Integer getSeries() {
        return series;
    }
    public void setSeries(Integer series) {
        this.series = series;
    }
    public Integer getRepeticiones() {
        return repeticiones;
    }
    public void setRepeticiones(Integer repeticiones) {
        this.repeticiones = repeticiones;
    }   
    public Integer getDescansoSegundos() {
        return descansoSegundos;
    }
    public void setDescansoSegundos(Integer descansoSegundos) {
        this.descansoSegundos = descansoSegundos;
    }
    public String getObservaciones() {
        return observaciones;
    }
    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }
}
