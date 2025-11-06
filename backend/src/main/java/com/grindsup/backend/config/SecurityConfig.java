package com.grindsup.backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.grindsup.backend.model.Estado;
import com.grindsup.backend.model.Rol;
import com.grindsup.backend.model.Usuario;
import com.grindsup.backend.repository.EstadoRepository;
import com.grindsup.backend.repository.RolRepository;
import com.grindsup.backend.repository.UsuarioRepository;
import com.grindsup.backend.security.CustomOAuth2User;
import com.grindsup.backend.security.CustomOAuth2UserService;
import com.grindsup.backend.security.JwtCookieAuthFilter;
import com.grindsup.backend.security.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Configuration(proxyBeanMethods = false)
@EnableWebSecurity
public class SecurityConfig {

  // ====== Password encoder ======
  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  // ====== CORS para el front (5173) con credenciales ======
  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration c = new CorsConfiguration();
    c.setAllowedOrigins(List.of("http://localhost:5173"));
    c.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
    c.setAllowedHeaders(List.of("*"));
    c.setAllowCredentials(true);
    c.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
    src.registerCorsConfiguration("/**", c);
    return src;
  }

  // ====== SuccessHandler: resuelve email, hace UPSERT y responde/redirige ======
  @Bean(name = "oAuth2LoginSuccessHandler")
  public AuthenticationSuccessHandler oAuth2LoginSuccessHandler(
      JwtService jwtService,
      UsuarioRepository usuarioRepository,
      RolRepository rolRepository,
      EstadoRepository estadoRepository,
      @Value("${grindsup.oauth2.default-role:USUARIO}") String defaultRoleName,
      @Value("${grindsup.oauth2.default-estado-id:1}") Long defaultEstadoId
  ) {
    ObjectMapper mapper = new ObjectMapper();

    return (HttpServletRequest request,
            HttpServletResponse response,
            org.springframework.security.core.Authentication authentication) -> {

      // 1) Resolver principal y correo
      Object principal = authentication.getPrincipal();
      String emailResolved = null;

      if (principal instanceof CustomOAuth2User cu) {
        Usuario u = cu.getUsuario();
        emailResolved = (u != null) ? u.getCorreo() : null;
      } else if (principal instanceof OidcUser oidc) {
        emailResolved = oidc.getEmail();
      } else if (principal instanceof OAuth2User o2) {
        Object v = o2.getAttributes().get("email");
        emailResolved = (v instanceof String) ? (String) v : null;
      }

      if (emailResolved == null || emailResolved.isBlank()) {
        response.setStatus(500);
        response.setContentType("application/json;charset=UTF-8");
        mapper.writeValue(response.getWriter(),
            Map.of("exito", false, "mensaje", "No se pudo obtener el email de Google"));
        return;
      }

      final String emailFinal = emailResolved; // efectivamente final para lambdas
      OffsetDateTime now = OffsetDateTime.now();

      // 2) Rol y Estado por defecto
      Rol rolPorDefecto = rolRepository.findByNombreIgnoreCase(defaultRoleName)
          .orElseGet(() -> rolRepository.findAll().stream().findFirst()
              .orElseThrow(() -> new IllegalStateException("No hay roles cargados")));
      Estado estadoPorDefecto = estadoRepository.findById(defaultEstadoId)
          .orElseThrow(() -> new IllegalStateException("Estado por defecto no encontrado"));

      // 3) UPSERT por correo (ignore-case)
      Usuario usuario = usuarioRepository.findByCorreoIgnoreCase(emailFinal).orElseGet(() -> {
        Usuario nue = new Usuario();
        nue.setCorreo(emailFinal);
        // contraseña dummy (bcrypt) para cuentas Google
        nue.setContrasena("$2a$10$8dummy.dummy.dummy.dummy.dummy.dummy12");
        nue.setRol(rolPorDefecto);
        nue.setEstado(estadoPorDefecto);
        nue.setCreated_at(now);
        nue.setUpdated_at(now);
        return nue;
      });

      // Datos opcionales (nombre, apellido, foto)
      String nombre = null, apellido = null, picture = null;
      if (principal instanceof OidcUser oidc) {
        nombre = oidc.getGivenName();
        apellido = oidc.getFamilyName();
        picture = (String) oidc.getClaims().get("picture");
      } else if (principal instanceof OAuth2User o2) {
        nombre = (String) o2.getAttributes().getOrDefault("given_name", null);
        apellido = (String) o2.getAttributes().getOrDefault("family_name", null);
        picture = (String) o2.getAttributes().getOrDefault("picture", null);
      }
      if (nombre != null && !nombre.isBlank()) usuario.setNombre(nombre);
      if (apellido != null && !apellido.isBlank()) usuario.setApellido(apellido);
      if (picture != null && !picture.isBlank()) usuario.setFoto_perfil(picture);
      if (usuario.getRol() == null) usuario.setRol(rolPorDefecto);
      if (usuario.getEstado() == null) usuario.setEstado(estadoPorDefecto);
      usuario.setUpdated_at(now);

      usuarioRepository.save(usuario);

      // 4) Generar JWT y setear cookie + redirigir a front
      String token = jwtService.generate(
          usuario.getCorreo(),
          Map.of(
              "uid", usuario.getId_usuario(),
              "correo", usuario.getCorreo(),
              "prov", "google",
              "rol", usuario.getRol().getNombre()
          )
      );

      var cookie = org.springframework.http.ResponseCookie.from("gs_jwt", token)
          .httpOnly(true)
          .secure(false)          // en prod con HTTPS => true
          .sameSite("Lax")
          .path("/")
          .maxAge(java.time.Duration.ofDays(7))
          .build();
      response.addHeader("Set-Cookie", cookie.toString());

      response.setStatus(302);
      response.setHeader("Location", "http://localhost:5173/oauth/success");

      // 5) Redirigir al front – enviamos el token en el fragmento (#) para que NO vaya al server
      String redirect = "http://localhost:5173/oauth/success"
      + "#token=" + token
      + "&uid=" + usuario.getId_usuario()
      + "&nombre=" + java.net.URLEncoder.encode(
        (usuario.getNombre() != null ? usuario.getNombre() : ""), java.nio.charset.StandardCharsets.UTF_8);
        response.setStatus(302);
        response.setHeader("Location", redirect);

    };
  }

  // ====== Cadena de filtros ======
  @Bean
  public SecurityFilterChain filterChain(
      HttpSecurity http,
      CustomOAuth2UserService customOAuth2UserService,
      @Qualifier("oAuth2LoginSuccessHandler") AuthenticationSuccessHandler successHandler,
      JwtCookieAuthFilter jwtCookieAuthFilter
  ) throws Exception {

    http
      .cors(c -> c.configurationSource(corsConfigurationSource()))
      .csrf(csrf -> csrf.disable())
      .authorizeHttpRequests(auth -> auth
          .requestMatchers("/public/**", "/auth/**", "/oauth2/**", "/login/**").permitAll()
          .requestMatchers("/api/usuarios/login", "/api/usuarios/reset/**", "/api/usuarios/recuperar/**").permitAll()
          .anyRequest().authenticated()
      )
      .oauth2Login(oauth -> oauth
          .userInfoEndpoint(ui -> ui.userService(customOAuth2UserService)) // OAuth2/OIDC default
          .successHandler(successHandler)
      )
      .addFilterBefore(jwtCookieAuthFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }
}
