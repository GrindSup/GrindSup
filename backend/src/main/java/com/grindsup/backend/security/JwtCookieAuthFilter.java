package com.grindsup.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;

@Component
public class JwtCookieAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtCookieAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String token = null;

        // 1) Header Authorization: Bearer
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }

        // 2) Cookie gs_jwt (si no vino el header)
        if (token == null && request.getCookies() != null) {
            Cookie c = Arrays.stream(request.getCookies())
                    .filter(k -> "gs_jwt".equals(k.getName()))
                    .findFirst().orElse(null);
            if (c != null) token = c.getValue();
        }

        // --- ✅ LÓGICA CORREGIDA ---
        // Ya no comprobamos si la autenticación es 'null'.
        // Si tenemos un token, lo validamos y lo usamos.
        if (token != null) {
            try {
                // 'parseUserDetails' ya incluye la validación
                UserDetails userDetails = jwtService.parseUserDetails(token);
                
                if (userDetails != null) {
                    // Si el token es válido, creamos la autenticación
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                            
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    
                    // Y la establecemos en el contexto. Esto SOBREESCRIBE
                    // cualquier autenticación "Anónima" que pudiera existir.
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            } catch (Exception e) {
                // Si el token es inválido (expirado, malformado),
                // simplemente no hacemos nada y el usuario seguirá
                // como "Anónimo".
                SecurityContextHolder.clearContext();
            }
        }

        chain.doFilter(request, response);
    }
}