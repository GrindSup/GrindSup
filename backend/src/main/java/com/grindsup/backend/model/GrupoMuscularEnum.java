package com.grindsup.backend.model;

public enum GrupoMuscularEnum {
    CUADRICEPS("Cuádriceps", "Músculos frontales del muslo"),
    GLUTEOS("Glúteos", "Músculos posteriores de la cadera"),
    PECTORALES("Pectorales", "Músculos del pecho"),
    ESPALDA("Espalda", "Músculos dorsales y trapecios"),
    BICEPS("Bíceps", "Músculos anteriores del brazo"),
    TRICEPS("Tríceps", "Músculos posteriores del brazo"),
    HOMBROS("Hombros", "Deltoides y estabilizadores"),
    ABDOMINALES("Abdominales", "Zona media del cuerpo");

    private final String nombre;
    private final String descripcion;

    GrupoMuscularEnum(String nombre, String descripcion) {
        this.nombre = nombre;
        this.descripcion = descripcion;
    }

    public String getNombre() {
        return nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
