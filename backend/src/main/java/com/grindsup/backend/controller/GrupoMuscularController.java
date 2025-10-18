package com.grindsup.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
public class GrupoMuscularController {

    @GetMapping("/api/grupos-musculares")
    public List<String> getGruposMusculares() {
        return List.of(
            "Pectorales",
            "Espalda",
            "Hombros",
            "Bíceps",
            "Tríceps",
            "Piernas",
            "Glúteos",
            "Abdominales"
        );
    }
}
