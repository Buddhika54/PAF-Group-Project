package com.smartcampus.smart_campus.service;

import com.smartcampus.smart_campus.model.SystemNotification;
import com.smartcampus.smart_campus.repository.SystemNotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SystemNotificationService {

    @Autowired
    private SystemNotificationRepository systemNotificationRepository;

    // CREATE - Admin creates a new broadcast
    public SystemNotification create(String title, String message, Boolean isImportant) {
        SystemNotification sn = new SystemNotification();
        sn.setTitle(title);
        sn.setMessage(message);
        sn.setIsImportant(isImportant != null ? isImportant : false);
        return systemNotificationRepository.save(sn);
    }

    // READ ALL - Returns all system notifications newest first
    public List<SystemNotification> getAll() {
        return systemNotificationRepository.findAllByOrderByCreatedAtDesc();
    }

    // READ ONE - Returns a single notification by ID
    public SystemNotification getById(Long id) {
        return systemNotificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("System notification not found with id: " + id));
    }

    // UPDATE - Admin edits an existing broadcast
    public SystemNotification update(Long id, String title, String message, Boolean isImportant) {
        SystemNotification sn = getById(id);
        sn.setTitle(title);
        sn.setMessage(message);
        sn.setIsImportant(isImportant != null ? isImportant : sn.getIsImportant());
        sn.setUpdatedAt(LocalDateTime.now());
        return systemNotificationRepository.save(sn);
    }

    // DELETE - Admin deletes one broadcast
    public void delete(Long id) {
        if (!systemNotificationRepository.existsById(id)) {
            throw new RuntimeException("System notification not found with id: " + id);
        }
        systemNotificationRepository.deleteById(id);
    }
}
