package app.kaiz.tasks.infrastructure;

import app.kaiz.tasks.domain.UserTag;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserTagRepository extends JpaRepository<UserTag, UUID> {

  List<UserTag> findByUserIdOrderByUsageCountDesc(UUID userId);

  List<UserTag> findByUserIdOrderByNameAsc(UUID userId);

  Optional<UserTag> findByUserIdAndName(UUID userId, String name);

  Optional<UserTag> findByIdAndUserId(UUID id, UUID userId);

  List<UserTag> findByUserIdAndNameIn(UUID userId, List<String> names);

  boolean existsByUserIdAndName(UUID userId, String name);
}
