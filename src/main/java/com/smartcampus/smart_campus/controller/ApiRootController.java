package com.smartcampus.smart_campus.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ApiRootController {

    @GetMapping("/")
    public Map<String, String> root() {
        return Map.of(
                "message", "Smart Campus API is running",
                "api", "Use /api/resources, /api/bookings, /api/tickets"
        );
    }
}
