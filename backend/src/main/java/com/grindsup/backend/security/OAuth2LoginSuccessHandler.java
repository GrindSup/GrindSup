package com.grindsup.backend.security;

import com.grindsup.backend.model.Usuario;
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
import java.util.Map;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final OAuth2AuthorizedClientService authorizedClientService;
    private final UserService userService;

    public OAuth2LoginSuccessHandler(
            JwtService jwtService,
            OAuth2AuthorizedClientService authorizedClientService,
            UserService userService
    ) {
        this.jwtService = jwtService;
        this.authorizedClientService = authorizedClientService;
        this.userService = userService;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {

        CustomOAuth2User principal = (CustomOAuth2User) authentication.getPrincipal();
        Usuario u = principal.getUsuario();

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
