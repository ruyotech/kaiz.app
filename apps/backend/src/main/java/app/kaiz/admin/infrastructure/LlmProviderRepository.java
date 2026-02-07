package app.kaiz.admin.infrastructure;

import app.kaiz.admin.domain.LlmProvider;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface LlmProviderRepository extends JpaRepository<LlmProvider, UUID> {

  Optional<LlmProvider> findByProviderName(String providerName);

  List<LlmProvider> findByActiveTrue();

  @Query("SELECT p FROM LlmProvider p WHERE p.isDefault = true AND p.active = true")
  Optional<LlmProvider> findDefaultProvider();

  List<LlmProvider> findAllByOrderByDisplayNameAsc();
}
