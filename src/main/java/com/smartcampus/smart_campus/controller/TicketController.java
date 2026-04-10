package com.smartcampus.smart_campus.controller;

import com.smartcampus.smart_campus.model.*;
import com.smartcampus.smart_campus.repository.CampusResourceRepository;
import com.smartcampus.smart_campus.repository.UserRepository;
import com.smartcampus.smart_campus.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @Autowired
    private CampusResourceRepository resourceRepository;

    @Autowired
    private UserRepository userRepository;

    

    // ✅ Get default/system user for public submissions
    private User getDefaultUser() {
        // Try to find an existing admin or system user
        return userRepository.findById(1L)
                .orElseGet(() -> {
                    // If no user exists, you need to create one manually in database
                    throw new RuntimeException("Default user not found. Please create a user with ID 1 or setup authentication.");
                });
    }

    // ✅ PUBLIC — Anyone can view all tickets (no login needed)
    @GetMapping("/public")
    public ResponseEntity<List<Ticket>> getPublicTickets() {
        return ResponseEntity.ok(ticketService.getAll());
    }

    // ✅ PUBLIC — Anyone can view one ticket by ID (no login needed)
    @GetMapping("/public/{id}")
    public ResponseEntity<Ticket> getPublicTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getById(id));
    }

    // ✅ PUBLIC — Create ticket without authentication (no login needed)
    @PostMapping("/public")
    public ResponseEntity<?> createPublicTicket(@RequestBody Map<String, Object> ticketData) {
        try {
            Ticket ticket = new Ticket();

            // Set resource if provided
            if (ticketData.containsKey("resourceId") && ticketData.get("resourceId") != null) {
                CampusResource resource = resourceRepository
                        .findById(((Number) ticketData.get("resourceId")).longValue())
                        .orElseThrow(() -> new RuntimeException("Resource not found"));
                ticket.setResource(resource);
            }

            // Set required fields
            if (!ticketData.containsKey("title") || ticketData.get("title") == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Title is required"));
            }
            if (!ticketData.containsKey("description") || ticketData.get("description") == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Description is required"));
            }

            ticket.setTitle(ticketData.get("title").toString());
            ticket.setDescription(ticketData.get("description").toString());

            // Set optional fields with defaults
            if (ticketData.containsKey("category") && ticketData.get("category") != null) {
                ticket.setCategory(Ticket.TicketCategory.valueOf(ticketData.get("category").toString()));
            } else {
                ticket.setCategory(Ticket.TicketCategory.OTHER);
            }

            if (ticketData.containsKey("priority") && ticketData.get("priority") != null) {
                ticket.setPriority(Ticket.TicketPriority.valueOf(ticketData.get("priority").toString()));
            } else {
                ticket.setPriority(Ticket.TicketPriority.MEDIUM);
            }

            if (ticketData.containsKey("preferredContact") && ticketData.get("preferredContact") != null) {
                ticket.setPreferredContact(ticketData.get("preferredContact").toString());
            }

            // Use default user for public submissions
            User defaultUser = getDefaultUser();
            
            Ticket createdTicket = ticketService.create(ticket, defaultUser);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(createdTicket);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ PUBLIC — Upload attachment for public ticket
    @PostMapping("/public/{id}/attachments")
    public ResponseEntity<?> uploadPublicAttachment(@PathVariable Long id,
                                                     @RequestParam("file") MultipartFile file) {
        try {
            TicketAttachment attachment = ticketService.uploadAttachment(id, file);
            return ResponseEntity.ok(attachment);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 🔒 AUTHENTICATED — Create ticket (requires login)
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> ticketData,
                                    Authentication auth) {
        try {
            User user = extractUser(auth);

            Ticket ticket = new Ticket();

            if (ticketData.containsKey("resourceId") && ticketData.get("resourceId") != null) {
                CampusResource resource = resourceRepository
                        .findById(((Number) ticketData.get("resourceId")).longValue())
                        .orElseThrow(() -> new RuntimeException("Resource not found"));
                ticket.setResource(resource);
            }

            ticket.setTitle(ticketData.get("title").toString());
            ticket.setDescription(ticketData.get("description").toString());

            if (ticketData.containsKey("category") && ticketData.get("category") != null)
                ticket.setCategory(Ticket.TicketCategory.valueOf(ticketData.get("category").toString()));
            if (ticketData.containsKey("priority") && ticketData.get("priority") != null)
                ticket.setPriority(Ticket.TicketPriority.valueOf(ticketData.get("priority").toString()));
            if (ticketData.containsKey("preferredContact") && ticketData.get("preferredContact") != null)
                ticket.setPreferredContact(ticketData.get("preferredContact").toString());

            return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.create(ticket, user));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 🔒 AUTHENTICATED — Get ticket by ID (requires login)
    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getOne(@PathVariable Long id, Authentication auth) {
        // Verify user is authenticated
        extractUser(auth);
        return ResponseEntity.ok(ticketService.getById(id));
    }

    // 🔒 ADMIN ONLY — Get all tickets
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<Ticket>> getAll() {
        return ResponseEntity.ok(ticketService.getAll());
    }

    // 🔒 AUTHENTICATED — Get my tickets
    @GetMapping("/my")
    public ResponseEntity<List<Ticket>> getMyTickets(Authentication auth) {
        User user = extractUser(auth);
        return ResponseEntity.ok(ticketService.getMyTickets(user.getId()));
    }

    // 🔒 AUTHENTICATED — Get my stats
    @GetMapping("/my/stats")
    public ResponseEntity<Map<String, Long>> getMyStats(Authentication auth) {
        User user = extractUser(auth);
        return ResponseEntity.ok(ticketService.getUserStats(user.getId()));
    }

    // 🔒 ADMIN ONLY — Assign ticket
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/assign")
    public ResponseEntity<Ticket> assign(@PathVariable Long id,
                                         @RequestBody Map<String, Long> body) {
        return ResponseEntity.ok(ticketService.assign(id, body.get("technicianId")));
    }

    // 🔒 AUTHENTICATED — Update status
    @PutMapping("/{id}/status")
    public ResponseEntity<Ticket> updateStatus(@PathVariable Long id,
                                                @RequestBody Map<String, String> body,
                                                Authentication auth) {
        extractUser(auth); // verify user is authenticated
        return ResponseEntity.ok(ticketService.updateStatus(
                id, body.get("status"), body.get("resolutionNotes"), body.get("rejectionReason")));
    }

    // 🔒 AUTHENTICATED — Add comment
    @PostMapping("/{id}/comments")
    public ResponseEntity<TicketComment> addComment(@PathVariable Long id,
                                                     @RequestBody Map<String, String> body,
                                                     Authentication auth) {
        User user = extractUser(auth);
        return ResponseEntity.ok(ticketService.addComment(id, body.get("content"), user));
    }

    // 🔒 AUTHENTICATED — Edit comment
    @PutMapping("/{id}/comments/{cid}")
    public ResponseEntity<TicketComment> editComment(@PathVariable Long id,
                                                      @PathVariable Long cid,
                                                      @RequestBody Map<String, String> body,
                                                      Authentication auth) {
        User user = extractUser(auth);
        return ResponseEntity.ok(ticketService.editComment(cid, body.get("content"), user));
    }

    // 🔒 AUTHENTICATED — Delete comment
    @DeleteMapping("/{id}/comments/{cid}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id,
                                               @PathVariable Long cid,
                                               Authentication auth) {
        User user = extractUser(auth);
        ticketService.deleteComment(cid, user);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id, Authentication auth) {
        User user = (User) auth.getPrincipal();
        ticketService.deleteTicket(id, user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/attachments")
    public ResponseEntity<TicketAttachment> uploadAttachment(@PathVariable Long id,
                                                              @RequestParam("file") MultipartFile file,
                                                              Authentication auth) throws Exception {
        extractUser(auth); // verify user is authenticated
        return ResponseEntity.ok(ticketService.uploadAttachment(id, file));
    }

    
} 