package com.grindsup.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.security.Key;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

    private final Key key;
    private final int expirationDays;

    public JwtService(
        @Value("${grindsup.jwt.secret}") String secret,
        @Value("${grindsup.jwt.expiration-days:7}") int expirationDays
    ) {
        // ¡¡¡AÑADE ESTAS 3 LÍNEAS DE DEBUG!!!
    System.out.println("==================================================");
    System.out.println("INICIANDO JwtService CON LA CLAVE: " + secret);
    System.out.println("==================================================");
        if (secret == null || secret.length() < 32) {
            throw new IllegalStateException("JWT secret debe tener >= 32 chars");
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationDays = expirationDays;
    }

    public String generate(String subject, Map<String, Object> claims) {
        Instant now = Instant.now();
        return Jwts.builder()
            .setSubject(subject)
            .addClaims(claims)
            .setIssuedAt(Date.from(now))
            .setExpiration(Date.from(now.plus(expirationDays, ChronoUnit.DAYS)))
            .signWith(key, SignatureAlgorithm.HS256)
            .compact();
    }

    // ===== Helpers para el filtro =====

    public boolean validate(String token) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(key)
                // ✅ --- CORRECCIÓN DE CLOCK SKEW ---
                // Tolera un desfase de reloj de 60 segundos
                .setAllowedClockSkewSeconds(60L) 
                .build()
                .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            // Opcional: loguear el error para ver por qué falla
            // logger.warn("Validación de JWT fallida: {}", e.getMessage());
            return false;
        }
    }

    public String getSubject(String token) {
        return getAllClaims(token).getSubject();
    }

    public <T> T getClaim(String token, String name, Class<T> type) {
        Object raw = getAllClaims(token).get(name);
        return type.isInstance(raw) ? type.cast(raw) : null;
    }

    private Claims getAllClaims(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(key)
            // ✅ --- CORRECCIÓN DE CLOCK SKEW (necesario en ambos) ---
            .setAllowedClockSkewSeconds(60L) 
            .build()
            .parseClaimsJws(token).getBody();
    }

    // Crea un UserDetails simple con el rol del claim (si existe)
    public UserDetails parseUserDetails(String token) {
        // La validación ahora tolera el desfase de reloj
        if (!validate(token)) return null;

        String email = getSubject(token);
        String rol   = getClaim(token, "rol", String.class);

        List<SimpleGrantedAuthority> auths =
            (rol != null && !rol.isBlank())
                ? List.of(new SimpleGrantedAuthority("ROLE_" + rol.toUpperCase())) // Es buena práctica usar MAYÚSCULAS para roles
                : List.of();

        return new User(email, "", auths);
    }
}