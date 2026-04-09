package com.smartcampus.smart_campus.controller;

import com.smartcampus.smart_campus.dto.*;
import com.smartcampus.smart_campus.service.AuthService;
import com.smartcampus.smart_campus.model.User;
import com.smartcampus.smart_campus.repository.UserRepository;
import com.smartcampus.smart_campus.security.JwtUtil;
import com.smartcampus.smart_campus.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthService authService; // ← ADD THIS

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(
            @Valid @RequestBody RegisterRequest request,
            BindingResult bindingResult) {

        if (bindingResult.hasErrors()) {
            String errors = bindingResult.getAllErrors()
                    .stream()
                    .map(e -> e.getDefaultMessage())
                    .collect(Collectors.joining(", "));
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(errors));
        }

        try {
            UserResponse user = userService.registerUser(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Registered!", user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    private final JwtUtil jwtUtil;

    @Autowired
    public AuthController(JwtUtil jwtUtil, UserService userService) {
        this.jwtUtil = jwtUtil;
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request); // ← CHANGED
            return ResponseEntity.ok(ApiResponse.success("Login successful", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        User user = (User) auth.getPrincipal();
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "name", user.getName(),
                "profilePicture", user.getProfilePicture() != null ? user.getProfilePicture() : "",
                "role", user.getRole().name()
        ));
    }

    @GetMapping("/check-email")
    public ResponseEntity<Boolean> checkEmail(@RequestParam String email) {
        return ResponseEntity.ok(!userService.emailExists(email));
    }

    @GetMapping("/check-username")
    public ResponseEntity<Boolean> checkUsername(@RequestParam String username) {
        return ResponseEntity.ok(!userService.usernameExists(username));
    }
}