// src/main/java/com/grindsup/backend/config/SecurityConfig.java
package com.grindsup.backend.config;

import com.grindsup.backend.security.CustomOAuth2UserService;
import com.grindsup.backend.security.JwtCookieAuthFilter;
import com.grindsup.backend.security.OAuth2LoginSuccessHandler;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // ✅ Soluciona el error de PasswordEncoder faltante
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration c = new CorsConfiguration();
        c.setAllowedOrigins(List.of("http://localhost:5173"));
        c.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
        c.setAllowedHeaders(List.of("*"));          // incluye Authorization
        c.setAllowCredentials(true);                // necesario para cookies + Authorization
        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/**", c);
        return src;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtCookieAuthFilter jwtCookieAuthFilter,
            CustomOAuth2UserService customOAuth2UserService,
            OAuth2LoginSuccessHandler successHandler
    ) throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(auth -> auth
                // Preflight CORS
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // Públicas
                .requestMatchers(
                    "/auth/**",
                    "/public/**",
                    "/api/usuarios/login",
                    "/api/usuarios/reset/**",
                    "/api/usuarios/recuperar/**",
                    "/error"
                ).permitAll()

                // Google OAuth
                .requestMatchers("/login/**", "/oauth2/**").permitAll()

                // API protegida
                .requestMatchers("/api/**").authenticated()

                // Resto del sitio (React, estáticos)
                .anyRequest().permitAll()
            )

            // === OAuth2 ===
            .oauth2Login(oauth -> oauth
                .userInfoEndpoint(ui -> ui.oidcUserService(customOAuth2UserService))
                .successHandler(successHandler)
            )

            // === Filtro JWT, ANTES del UsernamePasswordAuthenticationFilter ===
            .addFilterBefore(jwtCookieAuthFilter, UsernamePasswordAuthenticationFilter.class)

            // === Manejo unificado de 401 ===
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((req, res, e) -> {
                    res.setStatus(401);
                    res.setContentType("application/json;charset=UTF-8");
                    res.getWriter().write("{\"error\":\"unauthorized\",\"message\":\"login required\"}");
                })
            );

        return http.build();
    }
}
