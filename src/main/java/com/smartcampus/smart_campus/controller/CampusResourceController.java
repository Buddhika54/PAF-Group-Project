package com.smartcampus.smart_campus.controller;

import com.smartcampus.smart_campus.model.CampusResource;
import com.smartcampus.smart_campus.service.CampusResourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin
public class CampusResourceController {

    @Autowired
    private CampusResourceService service;

    // GET ALL + FILTER
    @GetMapping
    public ResponseEntity<List<CampusResource>> getAll(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer capacity,
            @RequestParam(required = false) String location
    ) {
        return ResponseEntity.ok(service.getAll(type, capacity, location));
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<CampusResource> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<CampusResource>> getByType(@PathVariable String type) {
    return ResponseEntity.ok(service.getAll(type, null, null));
    }

    // CREATE (multipart for image)
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<CampusResource> create(
            @RequestParam String name,
            @RequestParam String type,
            @RequestParam Integer capacity,
            @RequestParam String location,
            @RequestParam String building,
            @RequestParam String availabilityWindows,
            @RequestParam Boolean isBookable,
            @RequestParam(required = false) String maintenanceNote,
            @RequestParam(required = false) MultipartFile image
    ) throws Exception {

        CampusResource r = new CampusResource();
        r.setName(name);
        r.setType(CampusResource.ResourceType.valueOf(type));
        r.setCapacity(capacity);
        r.setLocation(location);
        r.setBuilding(building);
        r.setAvailabilityWindows(availabilityWindows);
        r.setIsBookable(isBookable);
        r.setMaintenanceNote(maintenanceNote);

        return ResponseEntity.ok(service.create(r, image));
    }

    

    // UPDATE
    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ResponseEntity<CampusResource> update(
            @PathVariable Long id,
            @RequestParam String name,
            @RequestParam String type,
            @RequestParam Integer capacity,
            @RequestParam String location,
            @RequestParam String building,
            @RequestParam String availabilityWindows,
            @RequestParam Boolean isBookable,
            @RequestParam(required = false) String maintenanceNote,
            @RequestParam(required = false) MultipartFile image
    ) throws Exception {

        CampusResource r = new CampusResource();
        r.setName(name);
        r.setType(CampusResource.ResourceType.valueOf(type));
        r.setCapacity(capacity);
        r.setLocation(location);
        r.setBuilding(building);
        r.setAvailabilityWindows(availabilityWindows);
        r.setIsBookable(isBookable);
        r.setMaintenanceNote(maintenanceNote);

        return ResponseEntity.ok(service.update(id, r, image));
    }

    // STATUS CHANGE
    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        service.updateStatus(id, body.get("status"));
        return ResponseEntity.ok().build();
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // STATS
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> stats() {
        return ResponseEntity.ok(service.getStats());
    }
}