package com.grindsup.backend.dto;

public class AlumnoMinDTO {
    private Long id_alumno;
    private String nombre;
    private String apellido;

    public AlumnoMinDTO(Long id_alumno, String nombre, String apellido) {
        this.id_alumno = id_alumno;
        this.nombre = nombre;
        this.apellido = apellido;
    }

    public Long getId_alumno() { return id_alumno; }
    public String getNombre() { return nombre; }
    public String getApellido() { return apellido; }
}
