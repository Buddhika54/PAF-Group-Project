package com.smartcampus.smart_campus.controller;

import com.smartcampus.smart_campus.model.SystemNotification;
import com.smartcampus.smart_campus.service.SystemNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/system-notifications")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://localhost:3000"
})
public class SystemNotificationController {

    @Autowired
    private SystemNotificationService systemNotificationService;

    // POST /api/system-notifications - Admin creates a broadcast
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        try {
            String title = (String) body.get("title");
            String message = (String) body.get("message");
            Boolean isImportant = body.containsKey("isImportant") ? (Boolean) body.get("isImportant") : false;

            if (title == null || title.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Title is required"));
            }
            if (message == null || message.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Message is required"));
            }

            SystemNotification sn = systemNotificationService.create(title, message, isImportant);
            return ResponseEntity.status(HttpStatus.CREATED).body(sn);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // GET /api/system-notifications - All users can fetch broadcasts (shown in bell dropdown)
    @GetMapping
    public ResponseEntity<List<SystemNotification>> getAll() {
        return ResponseEntity.ok(systemNotificationService.getAll());
    }

    // GET /api/system-notifications/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(systemNotificationService.getById(id));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    // PUT /api/system-notifications/{id} - Admin edits a broadcast
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            String title = (String) body.get("title");
            String message = (String) body.get("message");
            Boolean isImportant = body.containsKey("isImportant") ? (Boolean) body.get("isImportant") : null;

            if (title == null || title.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Title is required"));
            }
            if (message == null || message.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Message is required"));
            }

            SystemNotification updated = systemNotificationService.update(id, title, message, isImportant);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // DELETE /api/system-notifications/{id} - Admin deletes a broadcast
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            systemNotificationService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }
}
