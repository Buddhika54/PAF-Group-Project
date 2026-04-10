package com.smartcampus.smart_campus.config;

import com.smartcampus.smart_campus.security.CustomOAuth2UserService;
import com.smartcampus.smart_campus.security.JwtAuthenticationFilter;
import com.smartcampus.smart_campus.security.OAuth2AuthenticationSuccessHandler;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2AuthenticationSuccessHandler oAuth2SuccessHandler;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            CustomOAuth2UserService customOAuth2UserService,
            OAuth2AuthenticationSuccessHandler oAuth2SuccessHandler,
            JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.customOAuth2UserService = customOAuth2UserService;
        this.oAuth2SuccessHandler = oAuth2SuccessHandler;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http)
            throws Exception {
        http
            // ── CORS ────────────────────────────────
            .cors(cors -> cors
                .configurationSource(corsConfigurationSource()))

            // ── CSRF disabled ────────────────────────
            .csrf(csrf -> csrf.disable())

            // ── Stateless session ────────────────────
            .sessionManagement(session -> session
                .sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS))

            // ── URL rules ────────────────────────────
            .authorizeHttpRequests(auth -> auth

                // Public auth endpoints
                .requestMatchers(
                    "/api/auth/**",
                    "/api/public/**",
                    "/oauth2/**",
                    "/login/**",
                    "/error",
                    "/admin/**",
                "/api/resources/**"
                ).permitAll()

                // Module A — anyone can READ resources
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/resources",
                    "/api/resources/**"
                ).permitAll()

                // Module B — anyone can READ bookings
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/bookings",
                    "/api/bookings/**"
                ).permitAll()

                // Module C - public ticket endpoints (without authentication)
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/tickets/public",
                    "/api/tickets/public/**"
                ).permitAll()

                // Module D — anyone can READ notifications
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/notifications",
                    "/api/notifications/**"
                ).permitAll()

                // Everything else needs JWT
                .anyRequest().authenticated()
            )

            // ── Return 401 instead of redirect ───────
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(
                    (request, response, authException) -> {
                        response.setStatus(
                            HttpServletResponse.SC_UNAUTHORIZED
                        );
                        response.setContentType(
                            "application/json"
                        );
                        response.getWriter().write(
                            "{\"error\": \"Unauthorized." +
                            " Please login first.\"}"
                        );
                    }
                )
            )

            // ── OAuth2 login ─────────────────────────
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(info -> info
                    .userService(customOAuth2UserService))
                .successHandler(oAuth2SuccessHandler)
            )

            // ── JWT filter ───────────────────────────
            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
            "http://localhost:3000",
            "http://localhost:5173"
        ));
        config.setAllowedMethods(List.of(
            "GET", "POST", "PUT",
            "PATCH", "DELETE", "OPTIONS"
        ));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
            new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}