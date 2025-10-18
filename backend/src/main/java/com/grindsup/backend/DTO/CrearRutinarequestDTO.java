package com.grindsup.backend.DTO;

import java.util.List;

public class CrearRutinarequestDTO {
    private Long planId;
    private String nombre;
    private String descripcion;
    private List<EjercicioRutinaDTO> ejercicios;
    private Long idEstado;
    public Long getPlanId() {
        return planId;
    }
    public void setPlanId(Long planId) {
        this.planId = planId;
    }
    public String getNombre() {
        return nombre;
    }
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
    public String getDescripcion() {
        return descripcion;
    }
    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
        public List<EjercicioRutinaDTO> getEjercicios() {
        return ejercicios;
    }
    public void setEjercicios(List<EjercicioRutinaDTO> ejercicios) {
        this.ejercicios = ejercicios;
    }
    public void getIdEstado(Long id_estado) {
        this.idEstado = id_estado;
    }
    public Long getIdEstado() {
        return idEstado;
    }

}
