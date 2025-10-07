package com.grindsup.backend.dto;

public class LoginResponse {
    private String mensaje;
    private boolean exito;
    private Long idSesion;
    private UsuarioDTO usuario;

    public LoginResponse(String mensaje, boolean exito, Long idSesion, UsuarioDTO usuario) {
        this.mensaje = mensaje;
        this.exito = exito;
        this.idSesion = idSesion;
        this.usuario = usuario;
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
}