package com.grindsup.backend.model;

import java.io.Serializable;
import java.util.Objects;

public class RutinaEjercicioId implements Serializable {

    private Long ejercicio; 
    private Long rutina;

    public RutinaEjercicioId() {
    }

    public RutinaEjercicioId(Long ejercicio, Long rutina) {
        this.ejercicio = ejercicio;
        this.rutina = rutina;
    }

    // --- Getters y Setters ---

    public Long getEjercicio() {
        return ejercicio;
    }

    public void setEjercicio(Long ejercicio) {
        this.ejercicio = ejercicio;
    }

    public Long getRutina() {
        return rutina;
    }

    public void setRutina(Long rutina) {
        this.rutina = rutina;
    }


    // --- Equals y HashCode  ---

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        RutinaEjercicioId that = (RutinaEjercicioId) o;
        return Objects.equals(ejercicio, that.ejercicio) && 
                Objects.equals(rutina, that.rutina); 
    }

    @Override
    public int hashCode() {
        return Objects.hash(ejercicio, rutina); 
    }
}