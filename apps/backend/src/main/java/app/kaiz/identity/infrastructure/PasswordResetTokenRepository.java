package app.kaiz.identity.infrastructure;

import app.kaiz.identity.domain.PasswordResetToken;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {

  Optional<PasswordResetToken> findByTokenHash(String tokenHash);

  @Modifying
  @Query("DELETE FROM PasswordResetToken t WHERE t.user.id = :userId")
  void deleteAllByUserId(UUID userId);

  @Modifying
  @Query("DELETE FROM PasswordResetToken t WHERE t.expiresAt < CURRENT_TIMESTAMP")
  void deleteExpiredTokens();
}
