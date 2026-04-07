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
public interface BookingRepository
        extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(Long userId);

    List<Booking> findByUserIdOrderByCreatedAtDesc(
        Long userId);

    List<Booking> findAllByOrderByCreatedAtDesc();

    List<Booking> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, Booking.BookingStatus status);

    List<Booking> findByStatus(Booking.BookingStatus status);

    // ── Conflict check ───────────────────────────
    @Query("SELECT COUNT(b) > 0 FROM Booking b " +
           "WHERE b.resource.id = :resourceId " +
           "AND b.bookingDate = :date " +
           "AND b.status = 'APPROVED' " +
           "AND b.startTime < :endTime " +
           "AND b.endTime > :startTime " +
           "AND b.id != :excludeId")
    boolean existsConflict(
        @Param("resourceId") Long resourceId,
        @Param("date") LocalDate date,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime,
        @Param("excludeId") Long excludeId
    );

    long countByStatus(Booking.BookingStatus status);

    long countByUserId(Long userId);

    long countByUserIdAndStatus(Long userId, Booking.BookingStatus status);

}