package com.smartcampus.smart_campus.controller;

import com.smartcampus.smart_campus.model.Notification;
import com.smartcampus.smart_campus.model.User;
import com.smartcampus.smart_campus.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://localhost:3000"
})
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    // GET /api/notifications
    // Get all notifications for the currently logged in user
    @GetMapping
    public ResponseEntity<?> getMyNotifications(Authentication auth) {
        try {
            if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
            }

            User user = (User) auth.getPrincipal();
            List<Notification> notifications = notificationService.getMyNotifications(user.getId());
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // GET /api/notifications/unread-count
    // Get the unread count for the currently logged in user
    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(Authentication auth) {
        try {
            if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
                 return ResponseEntity.ok(Map.of("count", 0));
            }

            User user = (User) auth.getPrincipal();
            long count = notificationService.getUnreadCount(user.getId());
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok(Map.of("count", 0));
        }
    }

    // PUT /api/notifications/{id}/read
    // Mark a specific notification as read
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id, Authentication auth) {
        try {
            if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
            }

            notificationService.markOneRead(id);
            return ResponseEntity.ok(Map.of("message", "Marked as read"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // PUT /api/notifications/read-all
    // Mark all notifications for the current user as read
    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(Authentication auth) {
        try {
            if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
            }

            User user = (User) auth.getPrincipal();
            notificationService.markAllRead(user.getId());
            return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
