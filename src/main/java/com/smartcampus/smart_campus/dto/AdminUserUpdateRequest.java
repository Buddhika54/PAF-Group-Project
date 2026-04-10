package com.smartcampus.smart_campus.dto;

import com.smartcampus.smart_campus.model.User;

public class AdminUserUpdateRequest {

    private String name;
    private String username;
    private String email;
    private User.Role role;
    private Boolean isActive;

    //  Getters & Setters 

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public User.Role getRole() { return role; }
    public void setRole(User.Role role) { this.role = role; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}