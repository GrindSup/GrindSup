// src/main/java/com/grindsup/backend/security/OAuth2LoginSuccessHandler.java
package com.grindsup.backend.security;

import com.grindsup.backend.model.Usuario;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtService jwtService;

    public OAuth2LoginSuccessHandler(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        CustomOAuth2User principal = (CustomOAuth2User) authentication.getPrincipal();
        Usuario u = principal.getUsuario();

        String token = jwtService.generate(
                u.getCorreo(),
                Map.of(
                        "uid", u.getId_usuario(),
                        "correo", u.getCorreo(),
                        "prov", "google",
                        "rol", u.getRol().getNombre()
                )
        );

        // ⚠️ Ajustá esta URL si tu frontend no corre en 5173
        String frontendBase = "http://localhost:5173/oauth/success";

        // Podés usar hash (#token=...) o query (?token=...). Tu frontend soporta ambos.
        String encoded = URLEncoder.encode(token, StandardCharsets.UTF_8);
        String redirectUrl = frontendBase + "?token=" + encoded;  // o: + "#token=" + encoded

        response.setStatus(HttpServletResponse.SC_FOUND); // 302
        response.setHeader("Location", redirectUrl);
    }
}
