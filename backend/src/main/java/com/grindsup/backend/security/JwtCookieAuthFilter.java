// src/main/java/com/grindsup/backend/security/JwtCookieAuthFilter.java
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
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        String token = null;
        System.out.println("[JWT] URL=" + request.getRequestURI());
        System.out.println("[JWT] Authorization=" + request.getHeader("Authorization"));
        System.out.println("[JWT] Cookies=" + (request.getCookies() != null));
        System.out.println("[JWT] query token=" + request.getParameter("token"));


        // 1) Authorization: Bearer ...
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }

        // 2) Cookies (si no vino header)
        if (token == null && request.getCookies() != null) {
            Cookie c = Arrays.stream(request.getCookies())
                    .filter(k -> "gs_token".equals(k.getName()) || "gs_jwt".equals(k.getName()))
                    .findFirst().orElse(null);
            if (c != null) token = c.getValue();
        }
        // 3) QUERY PARAM (¡LA NUEVA VÍA DE ESCAPE!)
        // Si el token es null, revisamos si viene en la URL (como después del login)
        if (token == null) {
            token = request.getParameter("token");
        }

        if (token != null) {
            try {
                UserDetails userDetails = jwtService.parseUserDetails(token);
                if (userDetails != null) {
                    System.out.println("[JWT] token valido, subject=" + jwtService.getSubject(token));
                    var authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            } catch (Exception ex) {
                System.err.println("JWT AUTH FAILED: " + ex.getMessage());
                SecurityContextHolder.clearContext();
                ex.printStackTrace();

            }
        }

        chain.doFilter(request, response);
    }
}
