package com.grindsup.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;

@Component
public class JwtCookieAuthFilter extends OncePerRequestFilter {

  private final JwtService jwtService;

  public JwtCookieAuthFilter(JwtService jwtService) {
    this.jwtService = jwtService;
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
      throws ServletException, IOException {

    String token = null;

    // 1) Header Authorization: Bearer
    String auth = request.getHeader("Authorization");
    if (auth != null && auth.startsWith("Bearer ")) {
      token = auth.substring(7);
    }

    // 2) Cookie gs_jwt
    if (token == null && request.getCookies() != null) {
      Cookie c = Arrays.stream(request.getCookies())
          .filter(k -> "gs_jwt".equals(k.getName()))
          .findFirst().orElse(null);
      if (c != null) token = c.getValue();
    }

    if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
      var userDetails = jwtService.parseUserDetails(token); // helper en JwtService
      if (userDetails != null) {
        var authToken = new UsernamePasswordAuthenticationToken(
            userDetails, null, userDetails.getAuthorities());
        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authToken);
      }
    }

    chain.doFilter(request, response);
  }
}
