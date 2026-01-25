package com.kaiz.lifeos.identity.infrastructure;

import com.kaiz.lifeos.identity.domain.EmailVerificationCode;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface EmailVerificationCodeRepository
    extends JpaRepository<EmailVerificationCode, UUID> {

  @Query(
      "SELECT c FROM EmailVerificationCode c WHERE c.user.id = :userId AND c.verifiedAt IS NULL ORDER BY c.createdAt DESC")
  List<EmailVerificationCode> findActiveCodesByUserId(UUID userId);

  @Modifying
  @Query("DELETE FROM EmailVerificationCode c WHERE c.user.id = :userId")
  void deleteAllByUserId(UUID userId);

  @Modifying
  @Query("DELETE FROM EmailVerificationCode c WHERE c.expiresAt < CURRENT_TIMESTAMP")
  void deleteExpiredCodes();
}
