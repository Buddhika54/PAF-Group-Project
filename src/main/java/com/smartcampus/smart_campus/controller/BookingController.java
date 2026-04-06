package com.smartcampus.smart_campus.controller;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;

import com.smartcampus.smart_campus.model.Booking;
import com.smartcampus.smart_campus.model.CampusResource;
import com.smartcampus.smart_campus.model.User;
import com.smartcampus.smart_campus.repository.CampusResourceRepository;
import com.smartcampus.smart_campus.service.BookingService;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingservice;

    @Autowired
    private CampusResourceRepository resourceRepository;

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> bookingData, Authentication auth){
        try{
            User user = (User) auth.getPrincipal();

            if (!bookingData.containsKey("resourceId")) {
                return ResponseEntity.badRequest().body(Map.of("error","Resource ID is required"));
            }

            if (!bookingData.containsKey("bookingDate")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Booking date is required"));
            }
            if (!bookingData.containsKey("startTime")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Start time is required"));
            }
            if (!bookingData.containsKey("endTime")) {
                return ResponseEntity.badRequest().body(Map.of("error", "End time is required"));
            }
            if (!bookingData.containsKey("purpose")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Purpose is required"));
            }

            // Create Booking object and set fields manually
            Booking booking = new Booking();
            
            // Set resource by ID
            CampusResource resource = resourceRepository.findById(((Number) bookingData.get("resourceId")).longValue())
                .orElseThrow(() -> new RuntimeException("Resource not found"));
            booking.setResource(resource);
            
            // Set other fields
            booking.setBookingDate(LocalDate.parse(bookingData.get("bookingDate").toString()));
            booking.setStartTime(LocalTime.parse(bookingData.get("startTime").toString()));
            booking.setEndTime(LocalTime.parse(bookingData.get("endTime").toString()));
            booking.setPurpose(bookingData.get("purpose").toString());
            booking.setUsername(user.getUsername()); // Set username from authenticated user
            
            if (bookingData.containsKey("expectedAttendees")) {
                booking.setExpectedAttendees(((Number) bookingData.get("expectedAttendees")).intValue());
            }
            
            return ResponseEntity.status(HttpStatus.CREATED).body(bookingservice.create(booking, user));

            // Continue with booking creation logic
        } catch(Exception e){
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

