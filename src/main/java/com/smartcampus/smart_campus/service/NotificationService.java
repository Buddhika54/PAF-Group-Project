package com.smartcampus.smart_campus.service;



import com.smartcampus.smart_campus.model.*;
import com.smartcampus.smart_campus.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    private void create(User user, Notification.NotificationType type, String title, String message,
                        Booking booking, Ticket ticket) {
        Notification n = new Notification();
        n.setUser(user);
        n.setType(type);
        n.setTitle(title);
        n.setMessage(message);
        n.setBooking(booking);
        n.setTicket(ticket);
        notificationRepository.save(n);
    }

    public void notifyBookingApproved(Booking booking) {
        create(booking.getUser(), Notification.NotificationType.BOOKING_APPROVED,
                "Booking Approved! ✅",
                "Your booking for " + booking.getResource().getName() + " on " +
                booking.getBookingDate() + " has been approved.",
                booking, null);
    }

    public void notifyBookingRejected(Booking booking) {
        create(booking.getUser(), Notification.NotificationType.BOOKING_REJECTED,
                "Booking Rejected",
                "Your booking for " + booking.getResource().getName() +
                " has been rejected. Reason: " + booking.getRejectionReason(),
                booking, null);
    }

    public void notifyBookingCancelled(Booking booking) {
        create(booking.getUser(), Notification.NotificationType.BOOKING_CANCELLED,
                "Booking Cancelled",
                "Your booking for " + booking.getResource().getName() + " has been cancelled.",
                booking, null);
    }

    public void notifyTicketStatusChanged(Ticket ticket) {
        create(ticket.getCreatedBy(), Notification.NotificationType.TICKET_STATUS_CHANGED,
                "Ticket Status Updated",
                "Ticket '" + ticket.getTitle() + "' status changed to " + ticket.getStatus().name(),
                null, ticket);
    }

    public void notifyTicketAssigned(Ticket ticket) {
        create(ticket.getCreatedBy(), Notification.NotificationType.TICKET_ASSIGNED,
                "Ticket Assigned",
                "Your ticket '" + ticket.getTitle() + "' has been assigned to a technician.",
                null, ticket);
    }

    public void notifyTicketCommentAdded(Ticket ticket, User commenter) {
        if (!ticket.getCreatedBy().getId().equals(commenter.getId())) {
            create(ticket.getCreatedBy(), Notification.NotificationType.TICKET_COMMENT_ADDED,
                    "New Comment on Your Ticket",
                    commenter.getName() + " commented on ticket: " + ticket.getTitle(),
                    null, ticket);
        }
    }

    public List<Notification> getMyNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    public void markAllRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalse(userId);
        unread.forEach(n -> {
            n.setIsRead(true);
            n.setReadAt(java.time.LocalDateTime.now());
        });
        notificationRepository.saveAll(unread);
    }

    public void markOneRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setIsRead(true);
            n.setReadAt(java.time.LocalDateTime.now());
            notificationRepository.save(n);
        });
    }
}
