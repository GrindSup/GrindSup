// src/main/java/com/grindsup/backend/config/SecurityConfig.java
package com.grindsup.backend.config;

import com.grindsup.backend.security.CustomOAuth2UserService;
import com.grindsup.backend.security.JwtCookieAuthFilter;
import com.grindsup.backend.security.OAuth2LoginSuccessHandler;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.HttpServletRequest;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final boolean calendarIntegrationEnabled;

    public SecurityConfig(@Value("${grindsup.calendar.enabled:true}") boolean calendarIntegrationEnabled) {
        this.calendarIntegrationEnabled = calendarIntegrationEnabled;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration c = new CorsConfiguration();
        c.setAllowedOrigins(List.of("http://localhost:5173"));
        c.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS","PATCH"));
        c.setAllowedHeaders(List.of("*"));
        c.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/**", c);

        return src;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtCookieAuthFilter jwtCookieAuthFilter,
            CustomOAuth2UserService customOAuth2UserService,
            OAuth2LoginSuccessHandler successHandler,
            ObjectProvider<ClientRegistrationRepository> clientRegistrationRepositoryProvider
    ) throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(
                    "/auth/**",
                    "/public/**",
                    "/api/usuarios/login",
                    "/api/usuarios/reset/**",
                    "/api/usuarios/recuperar/**",
                    "/error"
                ).permitAll()
                .requestMatchers("/login/**", "/oauth2/**").permitAll()

                // 🔐 RUTAS DE REPORTES DE ADMIN: requieren autoridad de administrador
                .requestMatchers("/api/reportes/admin/**").permitAll()

                // Resto de /api: solo autenticado
                .requestMatchers("/api/**").authenticated()
                .anyRequest().permitAll()
            )

            .oauth2Login(oauth -> {
                if (calendarIntegrationEnabled) {
                    ClientRegistrationRepository clientRegistrationRepository =
                            clientRegistrationRepositoryProvider.getIfAvailable();

                    if (clientRegistrationRepository != null) {
                        oauth.authorizationEndpoint(authorization ->
                                authorization.authorizationRequestResolver(
                                        googleAuthorizationRequestResolver(clientRegistrationRepository)
                                )
                        );
                    }
                }

                oauth.userInfoEndpoint(ui -> ui.oidcUserService(customOAuth2UserService));
                oauth.successHandler(successHandler);
            })

            .addFilterBefore(jwtCookieAuthFilter, UsernamePasswordAuthenticationFilter.class)

            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((req, res, e) -> {
                    res.setStatus(401);
                    res.setContentType("application/json;charset=UTF-8");
                    res.getWriter().write("{\"error\":\"unauthorized\",\"message\":\"login required\"}");
                })
            );

        return http.build();
    }

    private OAuth2AuthorizationRequestResolver googleAuthorizationRequestResolver(
            ClientRegistrationRepository clientRegistrationRepository) {

        DefaultOAuth2AuthorizationRequestResolver resolver =
                new DefaultOAuth2AuthorizationRequestResolver(
                        clientRegistrationRepository, "/oauth2/authorization");

        resolver.setAuthorizationRequestCustomizer(customizer ->
                customizer.additionalParameters(params -> {
                    params.put("access_type", "offline");
                    params.put("prompt", "consent");
                })
        );

        return new OAuth2AuthorizationRequestResolver() {

            @Override
            public org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest resolve(
                    HttpServletRequest request) {
                return augment(resolver.resolve(request));
            }

            @Override
            public org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest resolve(
                    HttpServletRequest request, String clientRegistrationId) {
                return augment(resolver.resolve(request, clientRegistrationId));
            }

            private org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest augment(
                    org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest original) {

                if (original == null) return null;

                Set<String> scopes = new LinkedHashSet<>(original.getScopes());
                scopes.add("https://www.googleapis.com/auth/calendar");
                scopes.add("https://www.googleapis.com/auth/calendar.events");

                return org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest
                        .from(original)
                        .scopes(scopes)
                        .build();
            }
        };
    }
}
