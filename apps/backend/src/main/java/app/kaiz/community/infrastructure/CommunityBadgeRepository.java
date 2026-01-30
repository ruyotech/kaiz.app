package app.kaiz.community.infrastructure;

import app.kaiz.community.domain.BadgeType;
import app.kaiz.community.domain.CommunityBadge;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/** Repository for CommunityBadge entity. */
@Repository
public interface CommunityBadgeRepository extends JpaRepository<CommunityBadge, UUID> {

  Optional<CommunityBadge> findByBadgeType(BadgeType badgeType);
}
