package com.grindsup.backend.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "notificacion")
public class Notificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_notificaciones")
    private Long id;

    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String mensaje;

    private boolean leida = false;

    // 🆕 NUEVO: ID de la entidad relacionada (e.g., id_turno)
    @Column(name = "id_referencia")
    private Long idReferencia;

    // 🆕 NUEVO: Tipo de entidad (e.g., 'TURNO', 'PLAN_ENTRENAMIENTO')
    @Column(name = "tipo_referencia", length = 50)
    private String tipoReferencia;

    // ✔️ El único receptor: el entrenador logueado
    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "id_entrenador", nullable = false)
    private Entrenador entrenador;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public boolean isLeida() {
        return leida;
    }

    public void setLeida(boolean leida) {
        this.leida = leida;
    }

    public Long getIdReferencia() {
        return idReferencia;
    }

    public void setIdReferencia(Long idReferencia) {
        this.idReferencia = idReferencia;
    }

    public String getTipoReferencia() {
        return tipoReferencia;
    }

    public void setTipoReferencia(String tipoReferencia) {
        this.tipoReferencia = tipoReferencia;
    }

    public Entrenador getEntrenador() {
        return entrenador;
    }

    public void setEntrenador(Entrenador entrenador) {
        this.entrenador = entrenador;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}