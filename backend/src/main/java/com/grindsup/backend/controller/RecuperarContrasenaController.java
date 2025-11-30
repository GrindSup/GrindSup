package com.grindsup.backend.controller;

import com.grindsup.backend.DTO.RecuperarContrasenaDTO.ForgotRequest;
import com.grindsup.backend.DTO.RecuperarContrasenaDTO.ResetRequest;
import com.grindsup.backend.service.RecuperarContrasenaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth/password")
public class RecuperarContrasenaController {

    private final RecuperarContrasenaService service;

    public RecuperarContrasenaController(RecuperarContrasenaService service) {
        this.service = service;
    }

    @PostMapping("/forgot")
    public ResponseEntity<Void> forgot(@Valid @RequestBody ForgotRequest req) {
        service.iniciarFlujo(req.getCorreo());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset")
    public ResponseEntity<Void> reset(@Valid @RequestBody ResetRequest req) {
        service.resetear(req.getToken(), req.getNuevaContrasena());
        return ResponseEntity.ok().build();
    }

    // Nuevo (necesario para el front)
    @GetMapping("/check")
    public ResponseEntity<?> checkPassword(
            @RequestParam String token,
            @RequestParam String nueva) {

        boolean misma = service.esPasswordActual(token, nueva);
        return ResponseEntity.ok(Map.of("misma", misma));
    }
}
