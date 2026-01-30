package app.kaiz.community.infrastructure;

import app.kaiz.community.domain.MotivationGroup;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/** Repository for MotivationGroup entity. */
@Repository
public interface MotivationGroupRepository extends JpaRepository<MotivationGroup, UUID> {

  Page<MotivationGroup> findByIsPrivate(Boolean isPrivate, Pageable pageable);

  Page<MotivationGroup> findByLifeWheelAreaId(String lifeWheelAreaId, Pageable pageable);

  Page<MotivationGroup> findByCreatorId(UUID creatorId, Pageable pageable);
}
