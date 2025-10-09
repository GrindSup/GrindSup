package com.grindsup.backend.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class RecuperarContrasenaDTO {

    // Request de /auth/password/forgot
    public static class ForgotRequest {
        @NotBlank
        @Email
        private String correo;

        public String getCorreo() { return correo; }
        public void setCorreo(String correo) { this.correo = correo; }
    }

    // Request de /auth/password/reset
    public static class ResetRequest {
        @NotBlank
        private String token;

        @NotBlank
        private String nuevaContrasena;

        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        public String getNuevaContrasena() { return nuevaContrasena; }
        public void setNuevaContrasena(String nuevaContrasena) { this.nuevaContrasena = nuevaContrasena; }
    }
}