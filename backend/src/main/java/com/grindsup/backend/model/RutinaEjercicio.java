package com.grindsup.backend.model;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "rutina_ejercicios")
@IdClass(RutinaEjercicioId.class) 
@EntityListeners(AuditingEntityListener.class) 
public class RutinaEjercicio {

    @Id
    @ManyToOne
    @JoinColumn(name = "id_ejercicio") 
    private Ejercicio ejercicio;

    @Id
    @ManyToOne
    @JoinColumn(name = "id_rutina") 
    private Rutina rutina;

    private Integer repeticiones;
    private Integer series;
    private Integer descanso_segundos;

    @ManyToOne
    @JoinColumn(name = "id_estado")
    private Estado estado;

    @CreationTimestamp 
    @Column(name = "created_at", nullable = false, updatable = false) 
    private OffsetDateTime created_at;

    @UpdateTimestamp 
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updated_at;
    
    @Column(name = "deleted_at")
    private OffsetDateTime deleted_at;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Column(length = 100)
    private String grupo_muscular;

    public Ejercicio getEjercicio() {
        return ejercicio;
    }

    public void setEjercicio(Ejercicio ejercicio) {
        this.ejercicio = ejercicio;
    }

    public Rutina getRutina() {
        return rutina;
    }

    public void setRutina(Rutina rutina) {
        this.rutina = rutina;
    }

    public Integer getRepeticiones() {
        return repeticiones;
    }

    public void setRepeticiones(Integer repeticiones) {
        this.repeticiones = repeticiones;
    }

    public Integer getSeries() {
        return series;
    }

    public void setSeries(Integer series) {
        this.series = series;
    }

    public Integer getDescanso_segundos() {
        return descanso_segundos;
    }

    public void setDescanso_segundos(Integer descanso_segundos) {
        this.descanso_segundos = descanso_segundos;
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

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public String getGrupo_muscular() { return grupo_muscular; }
    public void setGrupo_muscular(String grupo_muscular) { this.grupo_muscular = grupo_muscular; }
}