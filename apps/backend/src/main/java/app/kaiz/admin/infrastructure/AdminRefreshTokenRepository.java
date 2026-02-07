package app.kaiz.admin.infrastructure;

import app.kaiz.admin.domain.AdminRefreshToken;
import app.kaiz.admin.domain.AdminUser;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminRefreshTokenRepository extends JpaRepository<AdminRefreshToken, UUID> {

  Optional<AdminRefreshToken> findByTokenHash(String tokenHash);

  @Modifying
  @Query(
      "UPDATE AdminRefreshToken t SET t.revokedAt = CURRENT_TIMESTAMP WHERE t.admin = :admin AND t.revokedAt IS NULL")
  void revokeAllByAdmin(AdminUser admin);

  @Modifying
  @Query("DELETE FROM AdminRefreshToken t WHERE t.expiresAt < CURRENT_TIMESTAMP")
  void deleteExpiredTokens();
}
