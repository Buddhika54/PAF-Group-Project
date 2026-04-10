package com.smartcampus.smart_campus.dto;
 
import java.time.LocalDateTime;

import com.smartcampus.smart_campus.model.User;
 
public class UserResponse {
    private Long id;
    private String email;
    private String username;
    private String name;
    private String role;
    private boolean isActive;
 
    // Constructor from User entity
    public UserResponse(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.username = user.getUsername();
        this.name = user.getName();
        this.role = user.getRole().toString();
        this.isActive = user.isActive();
    }
 
    // Getters and Setters
    public Long getId() {
        return id;
    }
 
    public void setId(Long id) {
        this.id = id;
    }
 
    public String getEmail() {
        return email;
    }
 
    public void setEmail(String email) {
        this.email = email;
    }
 
    public String getUsername() {
        return username;
    }
 
    public void setUsername(String username) {
        this.username = username;
    }
 
    public String getName() {
        return name;
    }
 
    public void setName(String name) {
        this.name = name;
    }
 
    public String getRole() {
        return role;
    }
 
    public void setRole(String role) {
        this.role = role;
    }

    public boolean isActive() {
        return isActive;
    }

    

}
