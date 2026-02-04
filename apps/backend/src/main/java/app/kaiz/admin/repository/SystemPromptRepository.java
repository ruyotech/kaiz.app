package app.kaiz.admin.repository;

import app.kaiz.admin.domain.SystemPrompt;
import app.kaiz.admin.domain.SystemPrompt.PromptCategory;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SystemPromptRepository extends JpaRepository<SystemPrompt, UUID> {

    Optional<SystemPrompt> findByPromptKey(String promptKey);

    List<SystemPrompt> findByPromptCategory(PromptCategory category);

    List<SystemPrompt> findByActiveTrue();

    List<SystemPrompt> findByPromptCategoryAndActiveTrue(PromptCategory category);

    List<SystemPrompt> findAllByOrderByPromptCategoryAscPromptNameAsc();
}
