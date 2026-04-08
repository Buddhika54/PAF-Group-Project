package com.smartcampus.smart_campus.service;
import com.smartcampus.smart_campus.model.CampusResource;
import com.smartcampus.smart_campus.repository.CampusResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.*;
import java.util.*;

@Service
public class CampusResourceService {
     @Autowired
    private CampusResourceRepository repo;

    @Value("${file.upload-dir}")
    private String uploadDir;

    // GET ALL + FILTER
    public List<CampusResource> getAll(String type, Integer capacity, String location) {
        List<CampusResource> list = repo.findAll();

        return list.stream()
                .filter(r -> type == null || r.getType().name().equalsIgnoreCase(type))
                .filter(r -> capacity == null || (r.getCapacity() != null && r.getCapacity() >= capacity))
                .filter(r -> location == null || 
                    (r.getLocation() != null && r.getLocation().toLowerCase().contains(location.toLowerCase())))
                .toList();
    }

    public CampusResource getById(Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
    }

    // CREATE
    public CampusResource create(CampusResource r, MultipartFile image) throws Exception {
        if (image != null && !image.isEmpty()) {
            r.setImageUrl(saveImage(image));
        }
        return repo.save(r);
    }

    // UPDATE
    public CampusResource update(Long id, CampusResource updated, MultipartFile image) throws Exception {
        CampusResource r = getById(id);

        r.setName(updated.getName());
        r.setType(updated.getType());
        r.setCapacity(updated.getCapacity());
        r.setLocation(updated.getLocation());
        r.setBuilding(updated.getBuilding());
        r.setStatus(updated.getStatus());
        r.setAvailabilityWindows(updated.getAvailabilityWindows());
        r.setIsBookable(updated.getIsBookable());
        r.setMaintenanceNote(updated.getMaintenanceNote());

        if (image != null && !image.isEmpty()) {
            r.setImageUrl(saveImage(image));
        }

        return repo.save(r);
    }

    // DELETE
    public void delete(Long id) {
        repo.deleteById(id);
    }

    // STATUS UPDATE - Supports maintenance note
        public void updateStatus(Long id, String status, String maintenanceNote) {
    CampusResource r = getById(id);

    System.out.println("STATUS RECEIVED: " + status);
    
    try {
    r.setStatus(CampusResource.ResourceStatus.valueOf(status.toUpperCase()));
} catch (IllegalArgumentException e) {
    throw new RuntimeException("Invalid status: " + status);
}
    
    if (maintenanceNote != null && !maintenanceNote.trim().isEmpty()) {
        r.setMaintenanceNote(maintenanceNote);
    }
    
    repo.save(r);
}

    // STATS (Counts)
    public Map<String, Long> getStats() {
    Map<String, Long> map = new HashMap<>();

    List<CampusResource> all = repo.findAll();

    map.put("total", (long) all.size());

    map.put("active", all.stream()
            .filter(r -> r.getStatus() != null && r.getStatus().name().equals("ACTIVE"))
            .count());

    map.put("outOfService", all.stream()
            .filter(r -> r.getStatus() != null && r.getStatus().name().equals("OUT_OF_SERVICE"))
            .count());

    map.put("underMaintenance", all.stream()
            .filter(r -> r.getStatus() != null && r.getStatus().name().equals("UNDER_MAINTENANCE"))
            .count());

    
    map.put("pendingBookings", 0L);

    return map;
}

    // IMAGE UPLOAD
    private String saveImage(MultipartFile file) throws Exception {
        Path dir = Paths.get(uploadDir);
        Files.createDirectories(dir);

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Files.copy(file.getInputStream(), dir.resolve(fileName));

        return "http://localhost:8080/uploads/" + fileName;
    }

}