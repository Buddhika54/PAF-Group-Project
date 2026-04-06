package com.smartcampus.smart_campus.security;

import com.smartcampus.smart_campus.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * After a successful Google OAuth2 login, generates a JWT and redirects the
 * browser to the React frontend with the token as a query parameter.
 */
@Component
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;

    // Change this if your React app runs on a different port
    private static final String FRONTEND_REDIRECT_URI = "http://localhost:3000/oauth2/callback";

    public OAuth2AuthenticationSuccessHandler(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");

        String token = jwtUtil.generateToken(email);

        String redirectUrl = FRONTEND_REDIRECT_URI + "?token=" + token;
        response.sendRedirect(redirectUrl);
    }
}
