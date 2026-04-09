package com.smartcampus.smart_campus.security;

import com.smartcampus.smart_campus.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import com.smartcampus.smart_campus.repository.UserRepository;
import com.smartcampus.smart_campus.model.User;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private jwtUtils jwtUtils;

    private JwtUtil jwtUtil;
    
    @Autowired
    private UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        final String authorizationHeader = request.getHeader("Authorization");

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String jwt = authorizationHeader.substring(7);
            System.out.println("JWT received: " + jwt.substring(0, 20));

            try {
                if (jwtUtils.validateToken(jwt)) {
                    String email = jwtUtils.getEmailFromToken(jwt);
                    System.out.println("Email from token: " + email);

                    userRepository.findByEmail(email).ifPresent(user -> {
                        UsernamePasswordAuthenticationToken authToken =
                                new UsernamePasswordAuthenticationToken(
                                        user,
                                        null,
                                        Collections.singletonList(
                                                new SimpleGrantedAuthority(
                                                        "ROLE_" + user.getRole().name()
                                                )
                                        )
                                );
                        authToken.setDetails(
                                new WebAuthenticationDetailsSource().buildDetails(request)
                        );
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                        System.out.println("Auth set for: " + email);
                    });
                } else {
                    System.out.println("Token validation FAILED");
                }
            } catch (Exception e) {
                System.out.println("JWT error: " + e.getMessage());
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            String role = jwtUtil.extractRole(jwt);
            if (jwtUtil.validateToken(jwt, username)) {
                // Load the actual User object from database
                User user = userRepository.findByEmail(username).orElse(null);
                if (user != null) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            user, null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        }
        chain.doFilter(request, response);
    }
}