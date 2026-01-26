package com.kaiz.lifeos.admin.infrastructure;

import com.kaiz.lifeos.admin.domain.PricingTier;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PricingTierRepository extends JpaRepository<PricingTier, Long> {

  List<PricingTier> findByActiveOrderByDisplayOrderAsc(Boolean active);

  List<PricingTier> findAllByOrderByDisplayOrderAsc();
}
