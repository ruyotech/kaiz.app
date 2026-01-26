package com.kaiz.lifeos.admin.infrastructure;

import com.kaiz.lifeos.admin.domain.AboutFeature;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface AboutFeatureRepository extends JpaRepository<AboutFeature, UUID> {

  Optional<AboutFeature> findBySlug(String slug);

  List<AboutFeature> findByActiveOrderByDisplayOrderAsc(boolean active);

  @Query("SELECT f FROM AboutFeature f ORDER BY f.displayOrder ASC")
  List<AboutFeature> findAllOrderByDisplayOrder();

  boolean existsBySlug(String slug);
}
