package com.grindsup.backend.mail;

public interface MailPort {
    void send(String to, String subject, String body);
}