package com.grindsup.backend.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "turnos")
public class Turno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_turno;

    @ManyToOne
    @JoinColumn(name = "id_entrenador", nullable = false)
    private Entrenador entrenador;

    @ManyToOne
    @JoinColumn(name = "id_tipoturno")
    private TipoTurno tipoTurno;

    @Column(nullable = false)
    private OffsetDateTime fecha;

    @ManyToOne
    @JoinColumn(name = "id_estado")
    private Estado estado;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime created_at;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updated_at;

    @Column(name = "deleted_at")
    private OffsetDateTime deleted_at;

    @Column(name = "google_event_id")
    private String googleEventId;

    @ManyToMany
    @JoinTable(name = "turno_alumno", joinColumns = @JoinColumn(name = "id_turno"), inverseJoinColumns = @JoinColumn(name = "id_alumno"))

    private List<Alumno> alumnos = new ArrayList<>();

    // 🆕 NUEVO: Campo para controlar si ya se envió la notificación previa de 1hr
    @Column(name = "notificacion_previa_enviada", nullable = false)
    private boolean notificacionPreviaEnviada = false;

    // Getters y Setters
    public Long getId_turno() {
        return id_turno;
    }

    public void setId_turno(Long id_turno) {
        this.id_turno = id_turno;
    }

    public Entrenador getEntrenador() {
        return entrenador;
    }

    public void setEntrenador(Entrenador entrenador) {
        this.entrenador = entrenador;
    }

    public TipoTurno getTipoTurno() {
        return tipoTurno;
    }

    public void setTipoTurno(TipoTurno tipoTurno) {
        this.tipoTurno = tipoTurno;
    }

    public OffsetDateTime getFecha() {
        return fecha;
    }

    public void setFecha(OffsetDateTime fecha) {
        this.fecha = fecha;
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

    public List<Alumno> getAlumnos() {
        return alumnos;
    }

    public void setAlumnos(List<Alumno> alumnos) {
        this.alumnos = alumnos;
    }

    public String getGoogleEventId() {
        return googleEventId;
    }

    public void setGoogleEventId(String googleEventId) {
        this.googleEventId = googleEventId;
    }

    // 🆕 NUEVO: Getter y Setter para el nuevo campo
    public boolean isNotificacionPreviaEnviada() {
        return notificacionPreviaEnviada;
    }

    public void setNotificacionPreviaEnviada(boolean notificacionPreviaEnviada) {
        this.notificacionPreviaEnviada = notificacionPreviaEnviada;
    }
}