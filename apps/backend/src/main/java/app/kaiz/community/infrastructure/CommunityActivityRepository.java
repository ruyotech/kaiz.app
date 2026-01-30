package app.kaiz.community.infrastructure;

import app.kaiz.community.domain.CommunityActivity;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/** Repository for CommunityActivity entity. */
@Repository
public interface CommunityActivityRepository extends JpaRepository<CommunityActivity, UUID> {

  Page<CommunityActivity> findByMemberId(UUID memberId, Pageable pageable);

  List<CommunityActivity> findTop10ByOrderByCreatedAtDesc();
}
