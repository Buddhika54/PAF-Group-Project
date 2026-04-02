package com.smartcampus.smart_campus.service;

import com.smartcampus.smart_campus.model.Booking;
import com.smartcampus.smart_campus.model.CampusResource;
import com.smartcampus.smart_campus.model.User;
import com.smartcampus.smart_campus.repository.BookingRepository;
import com.smartcampus.smart_campus.repository.CampusResourceRepository;
import com.smartcampus.smart_campus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import com.smartcampus.smart_campus.model.Booking.BookingStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private CampusResourceRepository resourceRepository;

    @Autowired
    private UserRepository userRepository;

    //@Autowired
    //private NotificationService notificationService;

    public Booking create(Booking booking, User user) {
        CampusResource resource = resourceRepository.findById(booking.getResource().getId())
                .orElseThrow(() -> new RuntimeException("Resource not found"));

        if (!resource.getStatus().equals(CampusResource.ResourceStatus.ACTIVE)) {
            throw new RuntimeException("Resource is not available for booking");
        }

        booking.setUser(user);
        booking.setResource(resource);
        booking.setStatus(BookingStatus.PENDING);
        return bookingRepository.save(booking);
    }

    public List<Booking> getMyBookings(Long userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking getById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
    }

    public Booking approve(Long id, User admin) {
        Booking booking = getById(id);

        // Check for time conflicts among approved bookings
        List<Booking> conflicts = bookingRepository.findConflictingApprovedBookings(
                booking.getResource().getId(),
                booking.getBookingDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                id
        );

        if (!conflicts.isEmpty()) {
            throw new RuntimeException("CONFLICT: Resource already booked for this time slot");
        }

        booking.setStatus(BookingStatus.APPROVED);
        booking.setReviewedBy(admin);
        booking.setReviewedAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);
        // notificationService.notifyBookingApproved(saved);
        return saved;
    }

    public Booking reject(Long id, String reason, User admin) {
        Booking booking = getById(id);
        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        booking.setReviewedBy(admin);
        booking.setReviewedAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);
        // notificationService.notifyBookingRejected(saved);
        return saved;
    }

    public Booking cancel(Long id, User user) {
        Booking booking = getById(id);
        booking.setStatus(BookingStatus.CANCELLED);
        Booking saved = bookingRepository.save(booking);
        // notificationService.notifyBookingCancelled(saved);
        return saved;
    }

    public Map<String, Long> getUserStats(Long userId) {
        return Map.of(
                "total", bookingRepository.countByUserId(userId),
                "pending", bookingRepository.countByUserIdAndStatus(userId, Booking.BookingStatus.PENDING),
                "approved", bookingRepository.countByUserIdAndStatus(userId, Booking.BookingStatus.APPROVED)
        );
    }
}

