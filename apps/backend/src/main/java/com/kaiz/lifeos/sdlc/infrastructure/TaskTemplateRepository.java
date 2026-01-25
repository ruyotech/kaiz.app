package com.kaiz.lifeos.sdlc.infrastructure;

import com.kaiz.lifeos.sdlc.domain.TaskTemplate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskTemplateRepository extends JpaRepository<TaskTemplate, UUID> {

  List<TaskTemplate> findByUserIdOrderByNameAsc(UUID userId);

  Optional<TaskTemplate> findByIdAndUserId(UUID id, UUID userId);

  boolean existsByNameAndUserId(String name, UUID userId);
}
