package com.smartcampus.smart_campus.repository;

import com.smartcampus.smart_campus.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Find bookings by user
    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Booking> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, Booking.BookingStatus status);

    // Find bookings by resource
    List<Booking> findByResourceIdOrderByCreatedAtDesc(Long resourceId);

    // Find conflicting bookings (for validation)
    @Query("SELECT b FROM Booking b WHERE b.resource.id = :resourceId " +
           "AND b.bookingDate = :date " +
           "AND b.status = 'APPROVED' " +
           "AND b.id != :excludeId " +
           "AND (b.startTime < :endTime AND b.endTime > :startTime)")
    List<Booking> findConflictingApprovedBookings(
            @Param("resourceId") Long resourceId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("excludeId") Long excludeId);

    // Find approved bookings for a specific date and resource
    @Query("SELECT b FROM Booking b WHERE b.resource.id = :resourceId " +
           "AND b.bookingDate = :date " +
           "AND b.status = 'APPROVED' " +
           "ORDER BY b.startTime ASC")
    List<Booking> findApprovedBookingsForDateAndResource(
            @Param("resourceId") Long resourceId,
            @Param("date") LocalDate date);

    // Find bookings in a date range
    @Query("SELECT b FROM Booking b WHERE b.bookingDate BETWEEN :startDate AND :endDate " +
           "ORDER BY b.bookingDate ASC")
    List<Booking> findBookingsBetweenDates(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    // Count queries
    long countByStatus(Booking.BookingStatus status);

    long countByUserId(Long userId);

    long countByUserIdAndStatus(Long userId, Booking.BookingStatus status);

    long countByResourceId(Long resourceId);
    
}