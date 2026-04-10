package com.smartcampus.smart_campus.service;

import com.smartcampus.smart_campus.model.Booking;
import com.smartcampus.smart_campus.model.CampusResource;
import com.smartcampus.smart_campus.model.User;
import com.smartcampus.smart_campus.repository.BookingRepository;
import com.smartcampus.smart_campus.repository.CampusResourceRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private CampusResourceRepository resourceRepository;

    @Autowired
    private NotificationService notificationService;

    public Booking create(Booking booking, User user) {
        CampusResource resource = resourceRepository.findById(booking.getResource().getId())
                .orElseThrow(() -> new RuntimeException("Resource not found"));

        if (!resource.getStatus().equals(CampusResource.ResourceStatus.ACTIVE)) {
            throw new RuntimeException("Resource is not available for booking");
        }

        booking.setUser(user);
        booking.setResource(resource);
        booking.setStatus(Booking.BookingStatus.PENDING);
        Booking saved = bookingRepository.save(booking);
        notificationService.notifyAdminsBookingCreated(saved);
        return saved;
    }

    // ── Get user's bookings ──────────────────────
    public List<Booking> getMyBookings(Long userId) {
        return bookingRepository
            .findByUserIdOrderByCreatedAtDesc(userId);
    }

    // ── Get all bookings (admin) ─────────────────
    public List<Booking> getAllBookings() {
        return bookingRepository
            .findAll();
    }

    // ── Get booking by ID ────────────────────────
    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
            .orElseThrow(() ->
                new RuntimeException(
                    "Booking not found with id: " + id));
    }

    // ── Approve booking ──────────────────────────
    public Booking approveBooking(
            Long id, User admin) {
        Booking booking = getBookingById(id);

        if (booking.getStatus() !=
                Booking.BookingStatus.PENDING) {
            throw new RuntimeException(
                "Booking is not in PENDING state");
        }

        // Check time conflict
        boolean conflict = bookingRepository
            .existsConflict(
                booking.getResource().getId(),
                booking.getBookingDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                id
            );

        if (conflict) {
            throw new RuntimeException(
                "Resource already booked " +
                "for this time slot");
        }

        booking.setStatus(Booking.BookingStatus.APPROVED);
        booking.setReviewedBy(admin);
        Booking saved = bookingRepository.save(booking);
        notificationService.notifyBookingApproved(saved);
        return saved;
    }

    // ── Reject booking ───────────────────────────
    public Booking rejectBooking(
            Long id, User admin, String reason) {
        Booking booking = getBookingById(id);

        if (booking.getStatus() !=
                Booking.BookingStatus.PENDING) {
            throw new RuntimeException(
                "Booking is not in PENDING state");
        }

        booking.setStatus(Booking.BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        booking.setReviewedBy(admin);
        return bookingRepository.save(booking);
    }

    // ── Cancel booking ───────────────────────────
    public Booking cancelBooking(
            Long id, User user) {
        Booking booking = getBookingById(id);

        boolean isOwner = booking.getUsername()
            .equals(user.getUsername());
        boolean isAdmin = user.getRole()
            .name().equals("ADMIN");

        if (!isOwner && !isAdmin) {
            throw new RuntimeException(
                "You cannot cancel this booking");
        }

        if (booking.getStatus() ==
                Booking.BookingStatus.REJECTED ||
            booking.getStatus() ==
                Booking.BookingStatus.CANCELLED) {
            throw new RuntimeException(
                "Cannot cancel this booking");
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }

    // ── User stats ───────────────────────────────
    public Map<String, Long> getUserStats(Long userId) {
        List<Booking> bookings = 
            bookingRepository.findByUserId(userId);
        return Map.of(
            "total", (long) bookings.size(),
            "pending", bookings.stream()
                .filter(b -> b.getStatus() ==
                    Booking.BookingStatus.PENDING)
                .count(),
            "approved", bookings.stream()
                .filter(b -> b.getStatus() ==
                    Booking.BookingStatus.APPROVED)
                .count(),
            "rejected", bookings.stream()
                .filter(b -> b.getStatus() ==
                    Booking.BookingStatus.REJECTED)
                .count(),
            "cancelled", bookings.stream()
                .filter(b -> b.getStatus() ==
                    Booking.BookingStatus.CANCELLED)
                .count()
        );
    }
}