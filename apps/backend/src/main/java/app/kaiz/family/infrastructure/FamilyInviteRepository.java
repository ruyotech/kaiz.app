package app.kaiz.family.infrastructure;

import app.kaiz.family.domain.FamilyInvite;
import app.kaiz.family.domain.FamilyInvite.InviteStatus;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/** Repository for FamilyInvite entity operations. */
@Repository
public interface FamilyInviteRepository extends JpaRepository<FamilyInvite, UUID> {

  /** Find all invites for a family. */
  List<FamilyInvite> findByFamilyId(UUID familyId);

  /** Find pending invites for a family. */
  List<FamilyInvite> findByFamilyIdAndStatus(UUID familyId, InviteStatus status);

  /** Find an invite by its token. */
  Optional<FamilyInvite> findByInviteToken(String inviteToken);

  /** Find pending invite by email and family. */
  Optional<FamilyInvite> findByEmailAndFamilyIdAndStatus(
      String email, UUID familyId, InviteStatus status);

  /** Find all pending invites for an email. */
  List<FamilyInvite> findByEmailAndStatus(String email, InviteStatus status);

  /** Check if a pending invite exists for this email in this family. */
  boolean existsByEmailAndFamilyIdAndStatus(String email, UUID familyId, InviteStatus status);

  /** Expire all invites past their expiration date. */
  @Modifying
  @Query(
      """
        UPDATE FamilyInvite i
        SET i.status = 'EXPIRED'
        WHERE i.status = 'PENDING'
        AND i.expiresAt < :now
        """)
  int expireOldInvites(@Param("now") Instant now);

  /** Delete all invites for a family. */
  void deleteByFamilyId(UUID familyId);

  /** Count pending invites for a family. */
  long countByFamilyIdAndStatus(UUID familyId, InviteStatus status);
}
