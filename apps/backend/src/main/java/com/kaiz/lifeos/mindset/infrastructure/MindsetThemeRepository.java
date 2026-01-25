package com.kaiz.lifeos.mindset.infrastructure;

import com.kaiz.lifeos.mindset.domain.MindsetTheme;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MindsetThemeRepository extends JpaRepository<MindsetTheme, UUID> {

  Optional<MindsetTheme> findByName(String name);
}
