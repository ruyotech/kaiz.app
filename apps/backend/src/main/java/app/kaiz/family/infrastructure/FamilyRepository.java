package app.kaiz.family.infrastructure;

import app.kaiz.family.domain.Family;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/** Repository for Family entity operations. */
@Repository
public interface FamilyRepository extends JpaRepository<Family, UUID> {

  /** Find a family by its owner's user ID. */
  Optional<Family> findByOwnerId(UUID ownerId);

  /** Find a family by its invite code. */
  Optional<Family> findByInviteCode(String inviteCode);

  /** Find the family that a user belongs to (as owner or member). */
  @Query(
      """
        SELECT f FROM Family f
        LEFT JOIN f.members m
        WHERE f.owner.id = :userId OR m.user.id = :userId
        """)
  Optional<Family> findByUserMembership(@Param("userId") UUID userId);

  /** Check if a user is already in any family. */
  @Query(
      """
        SELECT COUNT(f) > 0 FROM Family f
        LEFT JOIN f.members m
        WHERE f.owner.id = :userId OR m.user.id = :userId
        """)
  boolean existsByUserMembership(@Param("userId") UUID userId);

  /** Check if a family with the given name exists for the owner. */
  boolean existsByNameAndOwnerId(String name, UUID ownerId);
}
