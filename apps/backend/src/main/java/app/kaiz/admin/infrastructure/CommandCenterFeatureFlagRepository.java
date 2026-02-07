package app.kaiz.admin.infrastructure;

import app.kaiz.admin.domain.CommandCenterFeatureFlag;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommandCenterFeatureFlagRepository
    extends JpaRepository<CommandCenterFeatureFlag, UUID> {

  Optional<CommandCenterFeatureFlag> findByFlagKey(String flagKey);

  List<CommandCenterFeatureFlag> findByEnabledTrue();

  List<CommandCenterFeatureFlag> findAllByOrderByFlagNameAsc();
}
