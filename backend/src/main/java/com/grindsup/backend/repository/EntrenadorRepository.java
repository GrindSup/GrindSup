package com.grindsup.backend.repository;

import com.grindsup.backend.model.Entrenador;
import com.grindsup.backend.model.Usuario; // <--- 1. IMPORTA USUARIO
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional; // <--- 2. IMPORTA OPTIONAL

public interface EntrenadorRepository extends JpaRepository<Entrenador, Long> {

    // 🚀 3. ¡AGREGA ESTA LÍNEA!
    // Esto le enseña a Spring cómo buscar un Entrenador usando el objeto Usuario
    Optional<Entrenador> findByUsuario(Usuario usuario);

}