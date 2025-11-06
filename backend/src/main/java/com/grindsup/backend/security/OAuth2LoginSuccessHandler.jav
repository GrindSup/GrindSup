package com.grindsup.backend.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.grindsup.backend.DTO.UsuarioDTO;
import com.grindsup.backend.model.Usuario;
// Ya no necesitamos UsuarioRepository
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // --- CONSTRUCTOR CORREGIDO ---
    // Solo se inyecta lo que realmente se usa (JwtService)
    public OAuth2LoginSuccessHandler(JwtService jwtService) {
        this.jwtService = jwtService;
    }
    // ----------------------------

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                       HttpServletResponse response,
                                       Authentication authentication) throws IOException {

        // ** Usa CustomOAuth2User para obtener el Usuario persistido **
        CustomOAuth2User principal = (CustomOAuth2User) authentication.getPrincipal();
        Usuario u = principal.getUsuario(); // Usuario ya cargado y guardado en el service

        // Generación de Token
        String token = jwtService.generate(
                u.getCorreo(),
                // Asegúrate de incluir el ROL para que el frontend pueda diferenciar
                Map.of("uid", u.getId_usuario(), 
                       "correo", u.getCorreo(), 
                       "prov", "google",
                       "rol", u.getRol().getNombre()) // <-- Agregando el Rol al JWT
        );

        // Creación del DTO
        UsuarioDTO dto = new UsuarioDTO(
                u.getId_usuario(),
                u.getNombre(),
                u.getApellido(),
                u.getCorreo()
        );

        // Respuesta JSON
        Map<String, Object> out = Map.of(
                "mensaje", "Login con Google OK",
                "exito", true,
                "usuario", dto,
                "token", token
        );

        response.setStatus(200);
        response.setContentType("application/json;charset=UTF-8");
        objectMapper.writeValue(response.getWriter(), out);
    }
}