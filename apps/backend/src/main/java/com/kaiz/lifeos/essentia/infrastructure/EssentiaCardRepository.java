package com.kaiz.lifeos.essentia.infrastructure;

import com.kaiz.lifeos.essentia.domain.EssentiaCard;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface EssentiaCardRepository extends JpaRepository<EssentiaCard, UUID> {

  @Query("SELECT c FROM EssentiaCard c WHERE c.book.id = :bookId ORDER BY c.sortOrder")
  List<EssentiaCard> findByBookIdOrderBySortOrder(UUID bookId);
}
