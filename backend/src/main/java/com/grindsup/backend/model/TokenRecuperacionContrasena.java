package com.grindsup.backend.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "tokens_recuperacion_contrasena")
public class TokenRecuperacionContrasena {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_token")
    private Long idToken;

    @Column(name = "id_usuario", nullable = false)
    private Long idUsuario;

    @Column(name = "hash_token", nullable = false, unique = true, length = 64)
    private String hashToken; // no es el token en texto plano, esta transformado con formula hash SHA-256 por seguridad

    @Column(name = "expired_at", nullable = false)
    private OffsetDateTime expired_at;

    @Column(name = "usado", nullable = false)
    private boolean usado;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime created_at;

    // -------------------- GETTERS Y SETTERS --------------------

    public Long getIdToken() {
        return idToken;
    }

    public void setIdToken(Long idToken) {
        this.idToken = idToken;
    }

    public Long getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }

    public String getHashToken() {
        return hashToken;
    }

    public void setHashToken(String hashToken) {
        this.hashToken = hashToken;
    }

    public OffsetDateTime getExpired_at() {
        return expired_at;
    }

    public void setExpired_at(OffsetDateTime expired_at) {
        this.expired_at = expired_at;
    }

    public boolean isUsado() {
        return usado;
    }

    public void setUsado(boolean usado) {
        this.usado = usado;
    }

    public OffsetDateTime getCreated_at() {
        return created_at;
    }

    public void setCreated_at(OffsetDateTime created_at) {
        this.created_at = created_at;
    }
}
