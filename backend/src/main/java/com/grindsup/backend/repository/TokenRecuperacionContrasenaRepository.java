package com.grindsup.backend.repository;

import com.grindsup.backend.model.TokenRecuperacionContrasena;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TokenRecuperacionContrasenaRepository extends JpaRepository<TokenRecuperacionContrasena, Long> {

    // Busca un token por su hash
    Optional<TokenRecuperacionContrasena> findByHashToken(String hashToken);

    // Busca tokens activos de un usuario
    Optional<TokenRecuperacionContrasena> findByIdUsuarioAndUsadoFalse(Long idUsuario);
}