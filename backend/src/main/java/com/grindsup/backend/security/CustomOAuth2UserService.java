package com.grindsup.backend.security;

import com.grindsup.backend.model.Estado;
import com.grindsup.backend.model.Rol;
import com.grindsup.backend.model.Usuario;
import com.grindsup.backend.repository.EstadoRepository;
import com.grindsup.backend.repository.RolRepository;
import com.grindsup.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // <- opcional, o deja jakarta si preferís

// ✅ OIDC correcto (NO existe DefaultOidcUserService)
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

import java.time.OffsetDateTime;
import java.util.Map;

@Service
public class CustomOAuth2UserService extends OidcUserService { // ✅ extiende OidcUserService

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final EstadoRepository estadoRepository;

    @Value("${grindsup.oauth2.default-role:USUARIO}")
    private String defaultRoleName;

    @Value("${grindsup.oauth2.default-estado-id:1}")
    private Long defaultEstadoId;

    public CustomOAuth2UserService(
            UsuarioRepository usuarioRepository,
            RolRepository rolRepository,
            EstadoRepository estadoRepository
    ) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.estadoRepository = estadoRepository;
    }

    @Override
    @Transactional
    public OidcUser loadUser(OidcUserRequest req) throws OAuth2AuthenticationException { // ✅ firma correcta
        // Trae el usuario de Google como OidcUser
        OidcUser o = super.loadUser(req);
        Map<String, Object> a = o.getAttributes();

        String email = (String) a.get("email");
        String nombre = (String) a.getOrDefault("given_name", "");
        String apellido = (String) a.getOrDefault("family_name", "");
        String nombreCompleto = (String) a.getOrDefault("name", "");
        String picture = (String) a.getOrDefault("picture", "");

        if ((nombre == null || nombre.isBlank()) && nombreCompleto != null) {
            String[] parts = nombreCompleto.trim().split("\\s+", 2);
            nombre = parts.length > 0 ? parts[0] : "";
            apellido = parts.length > 1 ? parts[1] : "";
        }

        Rol rolPorDefecto = rolRepository.findByNombreIgnoreCase(defaultRoleName)
                .orElseGet(() -> rolRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new IllegalStateException("No hay roles cargados")));
        Estado estadoPorDefecto = estadoRepository.findById(defaultEstadoId)
                .orElseThrow(() -> new IllegalStateException("Estado por defecto no encontrado"));

        OffsetDateTime now = OffsetDateTime.now();
        Usuario u = usuarioRepository.findByCorreoIgnoreCase(email).orElseGet(() -> {
            Usuario nue = new Usuario();
            nue.setCorreo(email);
            // contraseña dummy para cuentas Google
            nue.setContrasena("$2a$10$8dummy.dummy.dummy.dummy.dummy.dummy12");
            nue.setRol(rolPorDefecto);
            nue.setEstado(estadoPorDefecto);
            nue.setCreated_at(now);
            nue.setUpdated_at(now);
            return nue;
        });

        if (nombre != null && !nombre.isBlank()) u.setNombre(nombre);
        if (apellido != null && !apellido.isBlank()) u.setApellido(apellido);
        if (picture != null && !picture.isBlank()) u.setFoto_perfil(picture);
        if (u.getRol() == null) u.setRol(rolPorDefecto);
        if (u.getEstado() == null) u.setEstado(estadoPorDefecto);
        u.setUpdated_at(now);

        usuarioRepository.save(u);

        // Devuelve tu principal unificado basado en OIDC
        return new CustomOAuth2User(u, o); // asegúrate que tu CustomOAuth2User acepte (Usuario, OidcUser)
    }
}
