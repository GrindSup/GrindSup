package com.grindsup.backend.repository;

import com.grindsup.backend.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Usuario findByCorreo(String correo);
}
