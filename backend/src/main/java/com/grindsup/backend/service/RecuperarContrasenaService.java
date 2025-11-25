package com.grindsup.backend.service;

import com.grindsup.backend.mail.MailPort;
import com.grindsup.backend.mail.MailTemplate;
import com.grindsup.backend.model.TokenRecuperacionContrasena;
import com.grindsup.backend.repository.TokenRecuperacionContrasenaRepository;
import com.grindsup.backend.repository.UsuarioRepository;
import com.grindsup.backend.util.TokenUtil;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;

@Service
public class RecuperarContrasenaService {

    private final UsuarioRepository usuarioRepository;
    private final TokenRecuperacionContrasenaRepository tokenRepository;
    private final PasswordEncoder encoder;
    private final TokenUtil tokenUtil;
    private final MailPort mail;

    // URL del front para armar el link del mail
    @Value("${app.front-url:http://localhost:5173}")
    private String frontUrl;

    // Minutos de expiración del token (configurable)
    @Value("${app.reset-token.minutes:10}")
    private int tokenMinutes;

    public RecuperarContrasenaService(UsuarioRepository usuarioRepository,
            TokenRecuperacionContrasenaRepository tokenRepository,
            PasswordEncoder encoder,
            TokenUtil tokenUtil,
            MailPort mail) {
        this.usuarioRepository = usuarioRepository;
        this.tokenRepository = tokenRepository;
        this.encoder = encoder;
        this.tokenUtil = tokenUtil;
        this.mail = mail;
    }

    /**
     * Inicia el flujo de recuperación: genera token, guarda HASH y envía link por
     * mail.
     * Siempre responde OK aunque el correo no exista (para no filtrar usuarios).
     */
    @Transactional
    public void iniciarFlujo(String correo) {
        if (correo != null)
            correo = correo.trim();
        usuarioRepository.findByCorreoIgnoreCase(correo).ifPresent(u -> {
            // (Opcional) invalidar token activo previo del usuario
            tokenRepository.findByIdUsuarioAndUsadoFalse(u.getId_usuario())
                    .ifPresent(t -> {
                        t.setUsado(true);
                        tokenRepository.save(t);
                    });

            // Token crudo (para enviar) + hash (para guardar)
            String raw = tokenUtil.generarTokenCrudo();
            String hash = tokenUtil.sha256Hex(raw);

            TokenRecuperacionContrasena t = new TokenRecuperacionContrasena();
            t.setIdUsuario(u.getId_usuario());
            t.setHashToken(hash);
            t.setCreated_at(OffsetDateTime.now());
            t.setExpired_at(OffsetDateTime.now().plusMinutes(tokenMinutes));
            t.setUsado(false);
            tokenRepository.save(t);

            String link = frontUrl + "/reset?token=" + raw;
            String html = MailTemplate.resetPasswordHtml(link, tokenMinutes);
            mail.send(
                    u.getCorreo(),
                    "Recuperar contraseña - GrindSup",
                    html);
        });
        // Siempre OK aunque no exista el correo
    }

    /**
     * Canjea el token: valida hash y expiración, setea nueva contraseña (hasheada)
     * y marca token como usado.
     */
    @Transactional
    public void resetear(String rawToken, String nuevaPassword) {
        String hash = tokenUtil.sha256Hex(rawToken);

        var token = tokenRepository.findByHashToken(hash)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token inválido"));

        if (token.isUsado() || token.getExpired_at().isBefore(OffsetDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token expirado o usado");
        }

        var usuario = usuarioRepository.findById(token.getIdUsuario())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Usuario no encontrado"));

        // Guardar la nueva contraseña en HASH (bcrypt)
        usuario.setContrasena(encoder.encode(nuevaPassword));
        usuario.setUpdated_at(OffsetDateTime.now());
        usuarioRepository.save(usuario);

        // Marcar token como usado
        token.setUsado(true);
        tokenRepository.save(token);
    }
}