package com.smartcampus.smart_campus.service;

import com.smartcampus.smart_campus.model.*;
import com.smartcampus.smart_campus.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private TicketCommentRepository commentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CampusResourceRepository resourceRepository;

    @Autowired
    private NotificationService notificationService;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public Ticket create(Ticket ticket, User createdBy) {
        ticket.setCreatedBy(createdBy);
        ticket.setStatus(Ticket.TicketStatus.OPEN);

        if (ticket.getResource() != null && ticket.getResource().getId() != null) {
            resourceRepository.findById(ticket.getResource().getId()).ifPresent(ticket::setResource);
        }
        return ticketRepository.save(ticket);
    }

    public List<Ticket> getAll() {
        return ticketRepository.findAll();
    }

    public List<Ticket> getMyTickets(Long userId) {
        return ticketRepository.findByCreatedByIdOrderByCreatedAtDesc(userId);
    }

    public Ticket getById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + id));
    }

    public Ticket assign(Long id, Long technicianId) {
        Ticket ticket = getById(id);
        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        ticket.setAssignedTo(technician);
        ticket.setStatus(Ticket.TicketStatus.IN_PROGRESS);
        Ticket saved = ticketRepository.save(ticket);
        notificationService.notifyTicketAssigned(saved);
        return saved;
    }

    public Ticket updateStatus(Long id, String status, String notes, String reason) {
        Ticket ticket = getById(id);
        ticket.setStatus(Ticket.TicketStatus.valueOf(status));
        if (notes != null) ticket.setResolutionNotes(notes);
        if (reason != null) ticket.setRejectionReason(reason);
        if (status.equals("RESOLVED")) ticket.setResolvedAt(LocalDateTime.now());
        Ticket saved = ticketRepository.save(ticket);
        notificationService.notifyTicketStatusChanged(saved);
        return saved;
    }

    public TicketComment addComment(Long ticketId, String content, User author) {
        Ticket ticket = getById(ticketId);
        TicketComment comment = new TicketComment();
        comment.setTicket(ticket);
        comment.setAuthor(author);
        comment.setContent(content);
        TicketComment saved = commentRepository.save(comment);
        notificationService.notifyTicketCommentAdded(ticket, author);
        return saved;
    }

    public TicketComment editComment(Long commentId, String content, User user) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        if (!comment.getAuthor().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized to edit this comment");
        }
        comment.setContent(content);
        comment.setIsEdited(true);
        comment.setEditedAt(LocalDateTime.now());
        return commentRepository.save(comment);
    }

    public void deleteComment(Long commentId, User user) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        if (!comment.getAuthor().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized to delete this comment");
        }
        commentRepository.delete(comment);
    }

    public TicketAttachment uploadAttachment(Long ticketId, MultipartFile file) throws IOException {
        Ticket ticket = getById(ticketId);

        long existingCount = ticket.getAttachments() != null ? ticket.getAttachments().size() : 0;
        if (existingCount >= 3) {
            throw new RuntimeException("Maximum 3 attachments allowed per ticket");
        }

        Path dir = Paths.get(uploadDir, "tickets");
        Files.createDirectories(dir);
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Files.copy(file.getInputStream(), dir.resolve(filename));

        TicketAttachment attachment = new TicketAttachment();
        attachment.setTicket(ticket);
        attachment.setFileName(file.getOriginalFilename());
        attachment.setFileUrl("http://localhost:8080/uploads/tickets/" + filename);
        attachment.setFileType(file.getContentType());
        attachment.setFileSizeBytes(file.getSize());

        // Directly save via entity manager — attach to ticket
        ticket.getAttachments().add(attachment);
        ticketRepository.save(ticket);
        return attachment;
    }

    public Map<String, Long> getUserStats(Long userId) {
        return Map.of(
                "open", ticketRepository.countByCreatedByIdAndStatus(userId, Ticket.TicketStatus.OPEN),
                "resolved", ticketRepository.countByCreatedByIdAndStatus(userId, Ticket.TicketStatus.RESOLVED)
        );
    }

    // ✅ Needed for OAuth2 user lookup
public Optional<User> findUserByEmail(String email) {
    return userRepository.findByEmail(email);
}
}
