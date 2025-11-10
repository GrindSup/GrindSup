package com.grindsup.backend.DTO;

import java.time.OffsetDateTime;

public class AlumnoListDTO {
    private Long id_alumno;
    private String nombre;
    private String apellido;
    private String documento;
    private String telefono;
    
    // CAMPOS DE DETALLE
    private Double peso;
    private Double altura;
    private String lesiones;
    private String enfermedades;
    private Boolean informeMedico;
    
    private Long id_estado;
    private String estado;
    private Long id_entrenador;
    private OffsetDateTime created_at;
    private OffsetDateTime updated_at; // <-- Campo 15

    public AlumnoListDTO() {}

    // Constructor ACTUALIZADO (15 parámetros)
    public AlumnoListDTO(
            Long id_alumno, String nombre, String apellido, String documento,
            String telefono, Double peso, Double altura, String lesiones, 
            String enfermedades, Boolean informeMedico, Long id_estado, 
            String estado, Long id_entrenador, OffsetDateTime created_at, 
            OffsetDateTime updated_at) 
    {
        this.id_alumno = id_alumno;
        this.nombre = nombre;
        this.apellido = apellido;
        this.documento = documento;
        this.telefono = telefono;
        
        // Asignación de campos de detalle
        this.peso = peso;
        this.altura = altura;
        this.lesiones = lesiones;
        this.enfermedades = enfermedades;
        this.informeMedico = informeMedico;
        
        this.id_estado = id_estado;
        this.estado = estado;
        this.id_entrenador = id_entrenador;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    // ====== GETTERS Y SETTERS (Se mantienen completos) ======

    public Long getId_alumno() { return id_alumno; }
    public void setId_alumno(Long id_alumno) { this.id_alumno = id_alumno; }
    
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    
    public String getApellido() { return apellido; }
    public void setApellido(String apellido) { this.apellido = apellido; }
    
    public String getDocumento() { return documento; }
    public void setDocumento(String documento) { this.documento = documento; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public Double getPeso() { return peso; }
    public void setPeso(Double peso) { this.peso = peso; }

    public Double getAltura() { return altura; }
    public void setAltura(Double altura) { this.altura = altura; }
    
    public String getLesiones() { return lesiones; }
    public void setLesiones(String lesiones) { this.lesiones = lesiones; }
    
    public String getEnfermedades() { return enfermedades; }
    public void setEnfermedades(String enfermedades) { this.enfermedades = enfermedades; }

    public Boolean getInformeMedico() { return informeMedico; }
    public void setInformeMedico(Boolean informeMedico) { this.informeMedico = informeMedico; }
    
    public Long getId_estado() { return id_estado; }
    public void setId_estado(Long id_estado) { this.id_estado = id_estado; }
    
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    
    public Long getId_entrenador() { return id_entrenador; }
    public void setId_entrenador(Long id_entrenador) { this.id_entrenador = id_entrenador; }
    
    public OffsetDateTime getCreated_at() { return created_at; }
    public void setCreated_at(OffsetDateTime created_at) { this.created_at = created_at; }
    
    public OffsetDateTime getUpdated_at() { return updated_at; }
    public void setUpdated_at(OffsetDateTime updated_at) { this.updated_at = updated_at; }
}