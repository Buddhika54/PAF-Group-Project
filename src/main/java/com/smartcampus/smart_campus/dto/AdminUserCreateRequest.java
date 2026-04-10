package com.smartcampus.smart_campus.dto;

import com.smartcampus.smart_campus.model.User;
import lombok.Data;

@Data
public class AdminUserCreateRequest {

    private String name;
    private String username;
    private String email;
    private String password;
    private User.Role role = User.Role.TECHNICIAN;



    public String getName() { return name; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public User.Role getRole() { return role; }

    public void setName(String name) { this.name = name; }
    public void setUsername(String username) { this.username = username; }
    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password; }
    public void setRole(User.Role role) { this.role = role; }
}