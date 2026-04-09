package com.smartcampus.smart_campus.controller;



import com.smartcampus.smart_campus.model.Ticket;
import com.smartcampus.smart_campus.model.TicketAttachment;
import com.smartcampus.smart_campus.model.TicketComment;
import com.smartcampus.smart_campus.model.User;
import com.smartcampus.smart_campus.model.CampusResource;
import com.smartcampus.smart_campus.repository.CampusResourceRepository;
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

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> ticketData, Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            
            // Create Ticket object and set fields manually
            Ticket ticket = new Ticket();
            
            // Set resource by ID if provided
            if (ticketData.containsKey("resourceId") && ticketData.get("resourceId") != null) {
                CampusResource resource = resourceRepository.findById(((Number) ticketData.get("resourceId")).longValue())
                    .orElseThrow(() -> new RuntimeException("Resource not found"));
                ticket.setResource(resource);
            }
            
            // Set other fields
            ticket.setTitle(ticketData.get("title").toString());
            ticket.setDescription(ticketData.get("description").toString());
            
            if (ticketData.containsKey("category")) {
                ticket.setCategory(Ticket.TicketCategory.valueOf(ticketData.get("category").toString()));
            }
            if (ticketData.containsKey("priority")) {
                ticket.setPriority(Ticket.TicketPriority.valueOf(ticketData.get("priority").toString()));
            }
            if (ticketData.containsKey("preferredContact")) {
                ticket.setPreferredContact(ticketData.get("preferredContact").toString());
            }
            
            return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.create(ticket, user));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<Ticket>> getAll() {
        return ResponseEntity.ok(ticketService.getAll());
    }

    @GetMapping("/my")
    public ResponseEntity<List<Ticket>> getMyTickets(Authentication auth) {
        User user = (User) auth.getPrincipal();
        return ResponseEntity.ok(ticketService.getMyTickets(user.getId()));
    }

    @GetMapping("/my/stats")
    public ResponseEntity<Map<String, Long>> getMyStats(Authentication auth) {
        User user = (User) auth.getPrincipal();
        return ResponseEntity.ok(ticketService.getUserStats(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getById(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/assign")
    public ResponseEntity<Ticket> assign(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        return ResponseEntity.ok(ticketService.assign(id, body.get("technicianId")));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Ticket> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ticketService.updateStatus(
                id, body.get("status"), body.get("resolutionNotes"), body.get("rejectionReason")));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<TicketComment> addComment(@PathVariable Long id,
                                                    @RequestBody Map<String, String> body,
                                                    Authentication auth) {
        User user = (User) auth.getPrincipal();
        return ResponseEntity.ok(ticketService.addComment(id, body.get("content"), user));
    }

    @PutMapping("/{id}/comments/{cid}")
    public ResponseEntity<TicketComment> editComment(@PathVariable Long id, @PathVariable Long cid,
                                                     @RequestBody Map<String, String> body,
                                                     Authentication auth) {
        User user = (User) auth.getPrincipal();
        return ResponseEntity.ok(ticketService.editComment(cid, body.get("content"), user));
    }

    @DeleteMapping("/{id}/comments/{cid}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id, @PathVariable Long cid,
                                              Authentication auth) {
        User user = (User) auth.getPrincipal();
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
                                                              @RequestParam("file") MultipartFile file) throws Exception {
        return ResponseEntity.ok(ticketService.uploadAttachment(id, file));
    }
}
