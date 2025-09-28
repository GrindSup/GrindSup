package com.grindsup.backend.service;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.auth.oauth2.TokenResponse;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import org.springframework.stereotype.Service;

@Service
public class GoogleCalendarCredentialService {

    private final GoogleAuthorizationCodeFlow flow;
    private final UserService userService;

    public GoogleCalendarCredentialService(GoogleAuthorizationCodeFlow flow, UserService userService) {
        this.flow = flow;
        this.userService = userService;
    }

    public Credential getCredentialForUser(String userId) throws Exception {
        // Obtener refresh token del usuario desde la base de datos
        String refreshToken = userService.getRefreshTokenForUser(userId);

        TokenResponse response = new TokenResponse().setRefreshToken(refreshToken);

        // Crear credencial usando el flow de OAuth
        return flow.createAndStoreCredential(response, userId);
    }
}
