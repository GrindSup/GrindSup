// src/main/java/com/grindsup/backend/DTO/EvaluarPlanRequestDTO.java
package com.grindsup.backend.DTO;

public record EvaluarPlanRequestDTO(
    Integer score,          // 1..5
    String  comentario      // opcional
) {}
