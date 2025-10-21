package com.grindsup.backend.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.List;

@Entity
@Table(name = "ejercicios")
public class Ejercicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_ejercicio;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(length = 50)
    private String dificultad;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "ejercicio_musculos_principales", joinColumns = @JoinColumn(name = "id_ejercicio"))
    @Column(name = "musculo")
    private List<String> grupoMuscularPrincipal;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "ejercicio_musculos_secundarios", joinColumns = @JoinColumn(name = "id_ejercicio"))
    @Column(name = "musculo")
    private List<String> grupoMuscularSecundario;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "ejercicio_equipamiento", joinColumns = @JoinColumn(name = "id_ejercicio"))
    @Column(name = "equipamiento")
    private List<String> equipamiento;

    @ManyToOne
    @JoinColumn(name = "id_estado")
    private Estado estado;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime created_at;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updated_at;

    @Column(name = "deleted_at")
    private OffsetDateTime deleted_at;

    // Getters y Setters 
    public Long getId_ejercicio() {
        return id_ejercicio;
    }

    public void setId_ejercicio(Long id_ejercicio) {
        this.id_ejercicio = id_ejercicio;
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

    public Estado getEstado() {
        return estado;
    }

    public void setEstado(Estado estado) {
        this.estado = estado;
    }

    public OffsetDateTime getCreated_at() {
        return created_at;
    }

    public void setCreated_at(OffsetDateTime created_at) {
        this.created_at = created_at;
    }

    public OffsetDateTime getUpdated_at() {
        return updated_at;
    }

    public void setUpdated_at(OffsetDateTime updated_at) {
        this.updated_at = updated_at;
    }

    public OffsetDateTime getDeleted_at() {
        return deleted_at;
    }

    public void setDeleted_at(OffsetDateTime deleted_at) {
        this.deleted_at = deleted_at;
    }

    public String getDificultad() {
        return dificultad;
    }

    public void setDificultad(String dificultad) {
        this.dificultad = dificultad;
    }

    public List<String> getGrupoMuscularPrincipal() {
        return grupoMuscularPrincipal;
    }

    public void setGrupoMuscularPrincipal(List<String> grupoMuscularPrincipal) {
        this.grupoMuscularPrincipal = grupoMuscularPrincipal;
    }

    public List<String> getGrupoMuscularSecundario() {
        return grupoMuscularSecundario;
    }

    public void setGrupoMuscularSecundario(List<String> grupoMuscularSecundario) {
        this.grupoMuscularSecundario = grupoMuscularSecundario;
    }

    public List<String> getEquipamiento() {
        return equipamiento;
    }

    public void setEquipamiento(List<String> equipamiento) {
        this.equipamiento = equipamiento;
    }
}