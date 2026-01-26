package app.kaiz.admin.infrastructure;

import app.kaiz.admin.domain.Faq;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FaqRepository extends JpaRepository<Faq, UUID> {

  List<Faq> findByActiveOrderByDisplayOrderAsc(Boolean active);

  List<Faq> findByCategoryAndActiveOrderByDisplayOrderAsc(String category, Boolean active);

  List<Faq> findAllByOrderByDisplayOrderAsc();
}
