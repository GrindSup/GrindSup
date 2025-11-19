package com.grindsup.backend.repository;

import com.grindsup.backend.model.Entrenador;
import com.grindsup.backend.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EntrenadorRepository extends JpaRepository<Entrenador, Long> {

    // Buscar entrenador por el Usuario asociado
    Optional<Entrenador> findByUsuario(Usuario usuario);

    // (Opcional) si querés un exists también, usalo así:
    boolean existsByUsuario(Usuario usuario);
}
