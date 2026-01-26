package app.kaiz.community.infrastructure;

import app.kaiz.community.domain.CommunityTemplate;
import app.kaiz.community.domain.TemplateType;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/** Repository for CommunityTemplate entity. */
@Repository
public interface CommunityTemplateRepository extends JpaRepository<CommunityTemplate, UUID> {

    Page<CommunityTemplate> findByTemplateType(TemplateType type, Pageable pageable);

    Page<CommunityTemplate> findByAuthorId(UUID authorId, Pageable pageable);

    Page<CommunityTemplate> findByIsFeaturedTrue(Pageable pageable);

    List<CommunityTemplate> findByIsFeaturedTrueOrderByDownloadCountDesc();

    Page<CommunityTemplate> findByLifeWheelAreaId(String lifeWheelAreaId, Pageable pageable);
}
