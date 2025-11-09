package com.grindsup.backend.DTO;

public class LoginResponse {
    private String mensaje;
    private boolean exito;
    private Long idSesion;
    private UsuarioDTO usuario;
    private String token; // <-- 1. CAMPO AÑADIDO

    // Constructor vacío (opcional pero recomendado)
    public LoginResponse() {
    }
    
    // 2. CONSTRUCTOR ACTUALIZADO PARA ACEPTAR EL TOKEN
    public LoginResponse(String mensaje, boolean exito, Long idSesion, UsuarioDTO usuario, String token) {
        this.mensaje = mensaje;
        this.exito = exito;
        this.idSesion = idSesion;
        this.usuario = usuario;
        this.token = token; // <-- Asignación del token
    }

    // Getters y setters
    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public boolean isExito() {
        return exito;
    }

    public void setExito(boolean exito) {
        this.exito = exito;
    }

    public Long getIdSesion() {
        return idSesion;
    }

    public void setIdSesion(Long idSesion) {
        this.idSesion = idSesion;
    }

    public UsuarioDTO getUsuario() {
        return usuario;
    }

    public void setUsuario(UsuarioDTO usuario) {
        this.usuario = usuario;
    }

    // --- 3. GETTER Y SETTER AÑADIDOS PARA EL TOKEN ---
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}