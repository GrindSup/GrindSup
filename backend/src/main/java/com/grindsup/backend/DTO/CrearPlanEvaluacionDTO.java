package com.grindsup.backend.DTO;

public class CrearPlanEvaluacionDTO {
    private Integer score;     // 1..5
    private String comentario; // opcional
    private Long id_entrenador; // opcional si querés pasarlo

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }

    public String getComentario() { return comentario; }
    public void setComentario(String comentario) { this.comentario = comentario; }

    public Long getId_entrenador() { return id_entrenador; }
    public void setId_entrenador(Long id_entrenador) { this.id_entrenador = id_entrenador; }
}
