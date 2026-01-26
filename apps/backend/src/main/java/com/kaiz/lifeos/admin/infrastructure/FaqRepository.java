package com.kaiz.lifeos.admin.infrastructure;

import com.kaiz.lifeos.admin.domain.Faq;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FaqRepository extends JpaRepository<Faq, Long> {

  List<Faq> findByActiveOrderByDisplayOrderAsc(Boolean active);

  List<Faq> findByCategoryAndActiveOrderByDisplayOrderAsc(String category, Boolean active);

  List<Faq> findAllByOrderByDisplayOrderAsc();
}
