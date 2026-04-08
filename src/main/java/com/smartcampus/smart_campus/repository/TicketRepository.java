package com.smartcampus.smart_campus.repository;



import com.smartcampus.smart_campus.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByCreatedByIdOrderByCreatedAtDesc(Long userId);
    List<Ticket> findByAssignedToIdOrderByCreatedAtDesc(Long userId);
    long countByStatus(Ticket.TicketStatus status);
    long countByCreatedByIdAndStatus(Long userId, Ticket.TicketStatus status);
}
