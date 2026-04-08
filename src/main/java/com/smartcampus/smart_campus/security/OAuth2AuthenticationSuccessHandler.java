package com.smartcampus.smart_campus.security;

import com.smartcampus.smart_campus.model.User;
import com.smartcampus.smart_campus.repository.UserRepository;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @Value("${frontend.url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();

        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");
        String picture = oauthUser.getAttribute("picture");
        String oauthId = oauthUser.getAttribute("sub");

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setUsername(email.substring(0, email.indexOf("@"))); // Extract username from email
            newUser.setName(name);
            newUser.setProfilePicture(picture);
            newUser.setOauthProvider("google");
            newUser.setOauthId(oauthId);
            if (userRepository.count() == 0) {
                newUser.setRole(User.Role.ADMIN);
            } else {
                newUser.setRole(User.Role.USER);
            }

            newUser.setIsActive(true);
            return userRepository.save(newUser);
        });

        // Update profile info on every login
        user.setName(name);
        user.setProfilePicture(picture);
        if (user.getUsername() == null) {
            user.setUsername(email.substring(0, email.indexOf("@"))); // Set username for existing users
        }
        userRepository.save(user);

        String token = jwtUtils.generateToken(user);
        String redirectUrl = frontendUrl + "/auth/callback?token=" + token;

        response.sendRedirect(redirectUrl);
    }
}

