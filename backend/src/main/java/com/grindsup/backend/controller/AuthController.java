package com.grindsup.backend.controller;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequestMapping("/auth")
public class AuthController {

  private void addClearJwtCookie(HttpServletResponse response) {
    ResponseCookie cookie = ResponseCookie.from("gs_jwt", "")
        .httpOnly(true)
        .secure(false)        // true si usás HTTPS
        .sameSite("None")     // para cross-site con front en 5173
        .path("/")
        .maxAge(Duration.ZERO) // borra cookie
        .build();
    response.addHeader("Set-Cookie", cookie.toString());
  }

  @PostMapping("/logout")
  public ResponseEntity<Void> logoutPost(HttpServletResponse response) {
    addClearJwtCookie(response);
    return ResponseEntity.noContent().build();
  }

  // opcional: GET para probar fácil desde el browser
  @GetMapping("/logout")
  public ResponseEntity<Void> logoutGet(HttpServletResponse response) {
    addClearJwtCookie(response);
    return ResponseEntity.noContent().build();
  }
}
