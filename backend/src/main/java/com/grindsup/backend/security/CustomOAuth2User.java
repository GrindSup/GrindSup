package com.grindsup.backend.security;

import com.grindsup.backend.model.Usuario;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
// CAMBIO: Importar las nuevas clases OIDC
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;

// CAMBIO: Implementar OidcUser en lugar de OAuth2User
public class CustomOAuth2User implements OidcUser {

    private final Usuario usuario;
    // CAMBIO: Almacenar el OidcUser original para delegar llamadas
    private final OidcUser oidcUser;

    // CAMBIO: El constructor ahora recibe el OidcUser completo
    public CustomOAuth2User(Usuario usuario, OidcUser oidcUser) {
        this.usuario = usuario;
        this.oidcUser = oidcUser;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Mapea el Rol del usuario a una GrantedAuthority
        String rolNombre = usuario.getRol() != null ? usuario.getRol().getNombre() : "UNKNOWN";
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + rolNombre));
    }

    @Override
    public Map<String, Object> getAttributes() {
        // CAMBIO: Delegar al OidcUser original
        return oidcUser.getAttributes();
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

    // --- MÉTODOS REQUERIDOS POR OidcUser ---
    // Simplemente delegamos al OidcUser original que nos pasó Spring

    @Override
    public Map<String, Object> getClaims() {
        return oidcUser.getClaims();
    }

    @Override
    public OidcUserInfo getUserInfo() {
        return oidcUser.getUserInfo();
    }

    @Override
    public OidcIdToken getIdToken() {
        return oidcUser.getIdToken();
    }
}