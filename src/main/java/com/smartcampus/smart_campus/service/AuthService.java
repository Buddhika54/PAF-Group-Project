package com.smartcampus.smart_campus.service;

import com.smartcampus.smart_campus.dto.LoginRequest;
import com.smartcampus.smart_campus.dto.LoginResponse;
import com.smartcampus.smart_campus.model.User;
import com.smartcampus.smart_campus.repository.UserRepository;
import com.smartcampus.smart_campus.security.jwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private jwtUtils jwtUtils;

    public LoginResponse login(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty() || !userOpt.get().isActive()) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        User user = userOpt.get();

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        String token = jwtUtils.generateToken(user);
        return new LoginResponse(token, user.getRole().toString(), user.getId());
    }
}