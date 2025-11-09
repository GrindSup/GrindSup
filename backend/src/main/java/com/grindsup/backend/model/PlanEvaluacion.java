package com.grindsup.backend.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "plan_evaluacion")
public class PlanEvaluacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_evaluacion;

    private Long id_plan;
    private Long id_alumno;
    private Long id_entrenador;

    // 0..5
    private Integer score;

    @Column(columnDefinition = "TEXT")
    private String comentario;

    @Temporal(TemporalType.TIMESTAMP)
    private Date created_at = new Date();

    // --- getters/setters ---
    public Long getId_evaluacion() { return id_evaluacion; }
    public void setId_evaluacion(Long id_evaluacion) { this.id_evaluacion = id_evaluacion; }

    public Long getId_plan() { return id_plan; }
    public void setId_plan(Long id_plan) { this.id_plan = id_plan; }

    public Long getId_alumno() { return id_alumno; }
    public void setId_alumno(Long id_alumno) { this.id_alumno = id_alumno; }

    public Long getId_entrenador() { return id_entrenador; }
    public void setId_entrenador(Long id_entrenador) { this.id_entrenador = id_entrenador; }

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }

    public String getComentario() { return comentario; }
    public void setComentario(String comentario) { this.comentario = comentario; }

    public Date getCreated_at() { return created_at; }
    public void setCreated_at(Date created_at) { this.created_at = created_at; }
}
