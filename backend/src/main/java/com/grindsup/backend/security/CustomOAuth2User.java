package com.grindsup.backend.security;

import com.grindsup.backend.model.Usuario;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;

public class CustomOAuth2User implements OAuth2User {

    private final Usuario usuario;
    private final Map<String, Object> attributes;

    public CustomOAuth2User(Usuario usuario, Map<String, Object> attributes) {
        this.usuario = usuario;
        this.attributes = attributes;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Mapea el Rol del usuario a una GrantedAuthority
        String rolNombre = usuario.getRol() != null ? usuario.getRol().getNombre() : "UNKNOWN";
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + rolNombre));
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public String getName() {
        // Usa el ID de usuario como el 'name' principal, o el correo si el ID es null
        return usuario.getId_usuario() != null ? usuario.getId_usuario().toString() : usuario.getCorreo();
    }

    // Método para exponer el objeto Usuario al SuccessHandler
    public Usuario getUsuario() {
        return usuario;
    }
}
