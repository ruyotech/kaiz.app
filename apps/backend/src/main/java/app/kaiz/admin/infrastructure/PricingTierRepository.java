package app.kaiz.admin.infrastructure;

import app.kaiz.admin.domain.PricingTier;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PricingTierRepository extends JpaRepository<PricingTier, UUID> {

  List<PricingTier> findByActiveOrderByDisplayOrderAsc(Boolean active);

  List<PricingTier> findAllByOrderByDisplayOrderAsc();
}
