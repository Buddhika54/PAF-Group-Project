package com.smartcampus.smart_campus.controller;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.smartcampus.smart_campus.model.Booking;
import com.smartcampus.smart_campus.model.CampusResource;
import com.smartcampus.smart_campus.model.User;
import com.smartcampus.smart_campus.repository.BookingRepository;
import com.smartcampus.smart_campus.repository.CampusResourceRepository;
import com.smartcampus.smart_campus.service.BookingService;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://localhost:3000"
})
public class BookingController {

    @Autowired
    private BookingService bookingservice;

    @Autowired
    private CampusResourceRepository resourceRepository;

    @Autowired
    private BookingRepository bookingRepository;

    // ── GET /api/bookings/my ─────────────────────
    // Get current logged in user's bookings
    // If not logged in → return empty list
    @GetMapping("/my")
    public ResponseEntity<?> getMyBookings(
            Authentication auth) {
        try {
            // Not logged in → return empty list
            if (auth == null || !auth.isAuthenticated()
                    || auth.getPrincipal()
                       .equals("anonymousUser")) {
                return ResponseEntity.ok(List.of());
            }

            User user = (User) auth.getPrincipal();
            List<Booking> bookings = bookingRepository
                .findByUserIdOrderByCreatedAtDesc(
                    user.getId());
            return ResponseEntity.ok(bookings);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok(List.of());
        }
    }

    // ── GET /api/bookings ────────────────────────
    // Get all bookings — ADMIN only
    // If not logged in → return empty list
    @GetMapping
    public ResponseEntity<?> getAllBookings(
            Authentication auth) {
        try {
            // Not logged in → return empty list
            if (auth == null || !auth.isAuthenticated()
                    || auth.getPrincipal()
                       .equals("anonymousUser")) {
                return ResponseEntity.ok(List.of());
            }

            List<Booking> bookings =
                bookingRepository
                    .findAllByOrderByCreatedAtDesc();
            return ResponseEntity.ok(bookings);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok(List.of());
        }
    }

    // ── GET /api/bookings/{id} ───────────────────
    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(
            @PathVariable Long id,
            Authentication auth) {
        try {
            if (auth == null || !auth.isAuthenticated()
                    || auth.getPrincipal()
                       .equals("anonymousUser")) {
                return ResponseEntity.ok(Map.of());
            }

            Booking booking = bookingRepository
                .findById(id)
                .orElseThrow(() ->
                    new RuntimeException(
                        "Booking not found"));
            return ResponseEntity.ok(booking);

        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of("error",
                    "Booking not found"));
        }
    }

    // ── POST /api/bookings ───────────────────────
    // Create a new booking (must be logged in)
    @PostMapping
    public ResponseEntity<?> create(
            @RequestBody Map<String, Object> bookingData,
            Authentication auth) {
        try {
            // Must be logged in to create booking
            User user = (User) auth.getPrincipal();

            // Validate required fields
            if (!bookingData.containsKey("resourceId")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Resource ID is required"));
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

            // ── Build Booking object ─────────────
            Booking booking = new Booking();

            CampusResource resource = resourceRepository
                .findById(
                    ((Number) bookingData
                        .get("resourceId"))
                        .longValue())
                .orElseThrow(() ->
                    new RuntimeException(
                        "Resource not found"));

            booking.setResource(resource);
            booking.setBookingDate(LocalDate.parse(
                bookingData.get("bookingDate")
                    .toString()));
            booking.setStartTime(LocalTime.parse(
                bookingData.get("startTime")
                    .toString()));
            booking.setEndTime(LocalTime.parse(
                bookingData.get("endTime")
                    .toString()));
            booking.setPurpose(
                bookingData.get("purpose").toString());
            booking.setUsername(user.getUsername());

            if (bookingData
                    .containsKey("expectedAttendees")) {
                booking.setExpectedAttendees(
                    ((Number) bookingData
                        .get("expectedAttendees"))
                        .intValue());
            }

            return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(bookingservice.create(
                    booking, user));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my/stats")
    public ResponseEntity<Map<String, Long>> getMyStats(Authentication auth) {
        User user = (User) auth.getPrincipal();
        return ResponseEntity.ok(bookingservice.getUserStats(user.getId()));
    }

    // ── PUT /api/bookings/{id}/approve ───────────
    // Approve a booking — ADMIN only
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveBooking(
            @PathVariable Long id,
            Authentication auth) {
        try {
            if (auth == null || !auth.isAuthenticated()
                    || auth.getPrincipal()
                       .equals("anonymousUser")) {
                return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized"));
            }

            User admin = (User) auth.getPrincipal();
            Booking booking = bookingRepository
                .findById(id)
                .orElseThrow(() ->
                    new RuntimeException(
                        "Booking not found"));

            // ── Check not already reviewed ───────
            if (booking.getStatus() !=
                    Booking.BookingStatus.PENDING) {
                return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error",
                        "Booking is not in PENDING state"));
            }

            // ── Check time conflict ──────────────
            boolean conflict = bookingRepository
                .existsConflict(
                    booking.getResource().getId(),
                    booking.getBookingDate(),
                    booking.getStartTime(),
                    booking.getEndTime(),
                    id
                );

            if (conflict) {
                return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of("error",
                        "Resource already booked " +
                        "for this time slot"));
            }

            booking.setStatus(Booking.BookingStatus.APPROVED);
            booking.setReviewedBy(admin);
            bookingRepository.save(booking);

            return ResponseEntity.ok(booking);

        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        }
    }

    // ── PUT /api/bookings/{id}/reject ────────────
    // Reject a booking — ADMIN only
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectBooking(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            Authentication auth) {
        try {
            if (auth == null || !auth.isAuthenticated()
                    || auth.getPrincipal()
                       .equals("anonymousUser")) {
                return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized"));
            }

            User admin = (User) auth.getPrincipal();
            String reason = request
                .getOrDefault("rejectionReason",
                    "No reason provided");

            Booking booking = bookingRepository
                .findById(id)
                .orElseThrow(() ->
                    new RuntimeException(
                        "Booking not found"));

            if (booking.getStatus() !=
                    Booking.BookingStatus.PENDING) {
                return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error",
                        "Booking is not in PENDING state"));
            }

            booking.setStatus(Booking.BookingStatus.REJECTED);
            booking.setRejectionReason(reason);
            booking.setReviewedBy(admin);
            bookingRepository.save(booking);

            return ResponseEntity.ok(booking);

        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        }
    }

    // ── PUT /api/bookings/{id}/cancel ────────────
    // Cancel a booking — owner or ADMIN
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(
            @PathVariable Long id,
            Authentication auth) {
        try {
            if (auth == null || !auth.isAuthenticated()
                    || auth.getPrincipal()
                       .equals("anonymousUser")) {
                return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized"));
            }

            User user = (User) auth.getPrincipal();
            Booking booking = bookingRepository
                .findById(id)
                .orElseThrow(() ->
                    new RuntimeException(
                        "Booking not found"));

            // ── Only owner or admin can cancel ───
            boolean isOwner = booking.getUsername()
                .equals(user.getUsername());
            boolean isAdmin = user.getRole()
                .name().equals("ADMIN");

            if (!isOwner && !isAdmin) {
                return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error",
                        "You cannot cancel " +
                        "this booking"));
            }

            // ── Can only cancel PENDING or APPROVED
            if (booking.getStatus() ==
                    Booking.BookingStatus.REJECTED ||
                booking.getStatus() ==
                    Booking.BookingStatus.CANCELLED) {
                return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error",
                        "Cannot cancel this booking"));
            }

            booking.setStatus(Booking.BookingStatus.CANCELLED);
            bookingRepository.save(booking);

            return ResponseEntity.ok(booking);

        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        }
    }
}