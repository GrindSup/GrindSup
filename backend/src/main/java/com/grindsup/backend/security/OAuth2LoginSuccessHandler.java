package com.grindsup.backend.security;

import com.grindsup.backend.model.Usuario;
import com.grindsup.backend.model.Entrenador;
import com.grindsup.backend.model.Estado;
import com.grindsup.backend.repository.EntrenadorRepository;
import com.grindsup.backend.repository.EstadoRepository;
import com.grindsup.backend.security.JwtService;
import com.grindsup.backend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.Optional;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final OAuth2AuthorizedClientService authorizedClientService;
    private final UserService userService;

    private final EntrenadorRepository entrenadorRepository;
    private final EstadoRepository estadoRepository;

    public OAuth2LoginSuccessHandler(
            JwtService jwtService,
            OAuth2AuthorizedClientService authorizedClientService,
            UserService userService,
            EntrenadorRepository entrenadorRepository,
            EstadoRepository estadoRepository
    ) {
        this.jwtService = jwtService;
        this.authorizedClientService = authorizedClientService;
        this.userService = userService;
        this.entrenadorRepository = entrenadorRepository;
        this.estadoRepository = estadoRepository;
    }

    /** 
     * Asegura que el Usuario tenga un registro asociado en la tabla entrenadores.
     * Si ya existe, no hace nada.
     */
    private void ensureEntrenadorForUsuario(Usuario u) {
        if (u == null || u.getId_usuario() == null) {
            return;
        }

        // ¿Ya hay entrenador para este usuario?
        Optional<Entrenador> existing = entrenadorRepository.findByUsuario(u);
        if (existing.isPresent()) {
            return;
        }

        // Estado por defecto (ajustá el ID si tu "ACTIVO" es otro)
        Estado estadoActivo = estadoRepository.findById(1L).orElse(null);

        Entrenador entrenador = new Entrenador();
        entrenador.setUsuario(u);
        entrenador.setEstado(estadoActivo);
        entrenador.setCreated_at(OffsetDateTime.now());
        entrenador.setUpdated_at(OffsetDateTime.now());

        entrenadorRepository.save(entrenador);
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {

        CustomOAuth2User principal = (CustomOAuth2User) authentication.getPrincipal();
        Usuario u = principal.getUsuario();

        // 🔥 Asegurar que el usuario tenga un Entrenador asociado
        ensureEntrenadorForUsuario(u);

        // === Guardar REFRESH TOKEN si está presente ===
        if (authentication instanceof OAuth2AuthenticationToken oauthToken) {

            OAuth2AuthorizedClient client =
                    authorizedClientService.loadAuthorizedClient(
                            oauthToken.getAuthorizedClientRegistrationId(),
                            oauthToken.getName()
                    );

            if (client != null && client.getRefreshToken() != null) {

                String refreshToken = client.getRefreshToken().getTokenValue();

                // Guardar por correo si disponible
                if (u.getCorreo() != null && !u.getCorreo().isBlank()) {
                    userService.setRefreshTokenForUser(u.getCorreo(), refreshToken);
                }

                // Guardar por id si disponible
                if (u.getId_usuario() != null) {
                    userService.setRefreshTokenForUser(
                            String.valueOf(u.getId_usuario()),
                            refreshToken
                    );
                }
            }
        }

        // === GENERAR JWT ===
        String token = jwtService.generate(
                u.getCorreo(),
                Map.of(
                        "uid", u.getId_usuario(),
                        "correo", u.getCorreo(),
                        "prov", "google",
                        "rol", (u.getRol() != null ? u.getRol().getNombre() : "USUARIO")
                )
        );

        // === REDIRECT AL FRONTEND ===
        String frontendBase = "http://localhost:5173/oauth/success";
        String encoded = URLEncoder.encode(token, StandardCharsets.UTF_8);
        String redirectUrl = frontendBase + "?token=" + encoded;

        response.setStatus(HttpServletResponse.SC_FOUND);
        response.setHeader("Location", redirectUrl);
    }
}
