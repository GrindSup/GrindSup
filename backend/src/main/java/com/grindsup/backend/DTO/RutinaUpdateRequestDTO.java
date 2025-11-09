package com.grindsup.backend.DTO;

import java.util.List;


public class RutinaUpdateRequestDTO {
    private String nombre;
    private String descripcion;
    private List<RutinaEjercicioRequestDTO> ejercicios;

    // Getters y Setters
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public List<RutinaEjercicioRequestDTO> getEjercicios() { return ejercicios; }
    public void setEjercicios(List<RutinaEjercicioRequestDTO> ejercicios) { this.ejercicios = ejercicios; }
}