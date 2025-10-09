package com.grindsup.backend.mail;


import jakarta.mail.internet.InternetAddress;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

// este se usa para mailtrap y lo que usemos en produccion

@Component
@Profile("prod")
public class SmtpMailAdapter implements MailPort {

    private final JavaMailSender sender;

    @Value("${app.mail.from:no-reply@grindsup.com}")
    private String from;

    public SmtpMailAdapter(JavaMailSender sender) {
        this.sender = sender;
    }

    @Override
    public void send(String to, String subject, String bodyHtml) {
        try {
            var mime = sender.createMimeMessage();
            var helper = new MimeMessageHelper(mime, "UTF-8");
            helper.setFrom(new InternetAddress(from, false));
            helper.setTo(new InternetAddress(to, false));
            helper.setSubject(subject != null ? subject : "");
            helper.setText(bodyHtml != null ? bodyHtml : "", /* isHtml */ true); // ← IMPORTANTE
            sender.send(mime);
        } catch (Exception e) {
            throw new RuntimeException("Fallo al enviar email: " + e.getMessage(), e);
        }
    }
}