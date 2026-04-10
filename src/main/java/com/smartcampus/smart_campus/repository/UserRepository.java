package com.smartcampus.smart_campus.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smartcampus.smart_campus.model.User;


@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    Optional<User> findByOauthId(String oauthId);
    
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    
    List<User> findByRole(User.Role role);

    // For admin search (name OR email OR username)
    Page<User> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrUsernameContainingIgnoreCase(
            String name, String email, String username, Pageable pageable);

    // For filtering by role with pagination
    Page<User> findByRole(User.Role role, Pageable pageable);

}