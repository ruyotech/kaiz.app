package app.kaiz.command_center.infrastructure;

import app.kaiz.command_center.domain.UserCoachPreference;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/** Repository for user coaching preferences. */
@Repository
public interface UserCoachPreferenceRepository extends JpaRepository<UserCoachPreference, UUID> {

  /** Find preferences by user ID (one-to-one). */
  Optional<UserCoachPreference> findByUserId(UUID userId);

  /** Check if preferences exist for a user. */
  boolean existsByUserId(UUID userId);
}
