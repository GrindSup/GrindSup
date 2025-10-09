package com.grindsup.backend.mail;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

// este imprime en consola y con logs nomas

@Component
@Profile({"dev","default"}) // se activa si no definís otro perfil
public class ConsoleMailAdapter implements MailPort {
    private static final Logger log = LoggerFactory.getLogger(ConsoleMailAdapter.class);

    @Override
    public void send(String to, String subject, String body) {
        log.info("\n=== MAIL DEV ===\nTo: {}\nSubject: {}\n{}\n================", to, subject, body);
    }
}
