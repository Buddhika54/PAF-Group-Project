package com.smartcampus.smart_campus.repository;
import com.smartcampus.smart_campus.model.CampusResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository

public interface CampusResourceRepository extends JpaRepository<CampusResource, Long> {

    List<CampusResource> findByType(CampusResource.ResourceType type);

    List<CampusResource> findByCapacityGreaterThanEqual(Integer capacity);

    List<CampusResource> findByLocationContainingIgnoreCase(String location);

}
