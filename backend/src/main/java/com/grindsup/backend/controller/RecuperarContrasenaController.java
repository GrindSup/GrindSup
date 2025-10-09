package com.grindsup.backend.controller;

import com.grindsup.backend.DTO.RecuperarContrasenaDTO.ForgotRequest;
import com.grindsup.backend.DTO.RecuperarContrasenaDTO.ResetRequest;
import com.grindsup.backend.service.RecuperarContrasenaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth/password")
public class RecuperarContrasenaController {
      private final RecuperarContrasenaService service;

    public RecuperarContrasenaController(RecuperarContrasenaService service) {
        this.service = service;
    }

    // Paso 1: iniciar flujo (si el correo existe, envía mail; si no, igual responde 200)
    @PostMapping("/forgot")
    public ResponseEntity<Void> forgot(@Valid @RequestBody ForgotRequest req) {
        service.iniciarFlujo(req.getCorreo());
        return ResponseEntity.ok().build();
    }

    // Paso 2: canjear token y setear nueva contraseña
    @PostMapping("/reset")
    public ResponseEntity<Void> reset(@Valid @RequestBody ResetRequest req) {
        service.resetear(req.getToken(), req.getNuevaContrasena());
        return ResponseEntity.ok().build();
    }
    
}
