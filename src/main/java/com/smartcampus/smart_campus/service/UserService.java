package com.smartcampus.smart_campus.service;

import com.smartcampus.smart_campus.dto.*;
import com.smartcampus.smart_campus.model.User;
import com.smartcampus.smart_campus.repository.UserRepository;
import com.smartcampus.smart_campus.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;

    @Transactional
    public UserResponse registerUser(RegisterRequest request) {
        // Validate passwords match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords don't match");
        }

        // Check email uniqueness
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        // Check username uniqueness
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username taken");
        }

        // Create & save user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setUsername(request.getUsername());
        user.setName(request.getName());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.USER);
        user.setIsActive(true);

        User saved = userRepository.save(user);
        return new UserResponse(saved);
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        Optional<User> user = userRepository.findByEmail(request.getEmail());
        
        if (user.isEmpty() || !user.get().isActive()) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.get().getPassword())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        // Generate JWT or session token here
        String token = generateToken(user.get());
        return new LoginResponse(token, user.get().getRole().toString(), user.get().getId());
        //return new LoginResponse(token, user.get().getRole().toString(), user.get().getId());
    }

    private String generateToken(User user) {
        // Use proper JWT token generation
        return jwtUtil.generateToken(user);
    }

    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    public boolean usernameExists(String username) {
        return userRepository.existsByUsername(username);
    }

     public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    
     // ====================== ADMIN ONLY METHODS ======================

    @PreAuthorize("hasRole('ADMIN')")
@Transactional
public UserResponse createAdminUser(AdminUserCreateRequest request) {
    if (userRepository.existsByEmail(request.getEmail())) {
        throw new IllegalArgumentException("Email already exists");
    }
    if (userRepository.existsByUsername(request.getUsername())) {
        throw new IllegalArgumentException("Username already exists");
    }

    User user = new User();
    user.setName(request.getName());
    user.setUsername(request.getUsername());
    user.setEmail(request.getEmail());
    user.setPassword(passwordEncoder.encode(request.getPassword()));

    // FIX: safe role handling
    if (request.getRole() != null) {
        user.setRole(request.getRole());
    } else {
        user.setRole(User.Role.TECHNICIAN);
    }

    user.setIsActive(true);

    User saved = userRepository.save(user);
    return new UserResponse(saved);
}

    @PreAuthorize("hasRole('ADMIN')")
    public Page<UserResponse> getAllUsers(String search, User.Role roleFilter, Pageable pageable) {
        if (search != null && !search.trim().isEmpty()) {
            String term = search.trim();
            return userRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrUsernameContainingIgnoreCase(
                    term, term, term, pageable)
                    .map(UserResponse::new);
        }

        if (roleFilter != null) {
            return userRepository.findByRole(roleFilter, pageable).map(UserResponse::new);
        }

        return userRepository.findAll(pageable).map(UserResponse::new);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public UserResponse updateUser(Long id, AdminUserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        user.setName(request.getName());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        
        if (request.getRole() != null) {
            user.setRole((User.Role) request.getRole());
        }
        if (request.getIsActive()) {
            user.setIsActive(request.getIsActive());
        }

        User saved = userRepository.save(user);
        return new UserResponse(saved);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void toggleUserStatus(Long id, boolean active) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
        
        user.setIsActive(active);
        userRepository.save(user);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new IllegalArgumentException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }
}
