package com.kaiz.lifeos.admin.infrastructure;

import com.kaiz.lifeos.admin.domain.Testimonial;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface TestimonialRepository extends JpaRepository<Testimonial, UUID> {

  List<Testimonial> findByActiveOrderByDisplayOrderAsc(boolean active);

  List<Testimonial> findByFeaturedAndActiveOrderByDisplayOrderAsc(boolean featured, boolean active);

  @Query("SELECT t FROM Testimonial t ORDER BY t.displayOrder ASC")
  List<Testimonial> findAllOrderByDisplayOrder();
}
