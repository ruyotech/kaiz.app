package com.kaiz.lifeos.admin.infrastructure;

import com.kaiz.lifeos.admin.domain.SiteContent;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SiteContentRepository extends JpaRepository<SiteContent, UUID> {

  Optional<SiteContent> findByKey(String key);

  Optional<SiteContent> findByKeyAndActive(String key, boolean active);

  List<SiteContent> findByTypeAndActive(String type, boolean active);

  List<SiteContent> findByKeyStartingWith(String prefix);

  boolean existsByKey(String key);
}
