package app.kaiz.family.infrastructure;

import app.kaiz.family.domain.FamilyMember;
import app.kaiz.family.domain.FamilyRole;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/** Repository for FamilyMember entity operations. */
@Repository
public interface FamilyMemberRepository extends JpaRepository<FamilyMember, UUID> {

  /** Find all members of a family. */
  List<FamilyMember> findByFamilyId(UUID familyId);

  /** Find all active members of a family. */
  List<FamilyMember> findByFamilyIdAndIsActiveTrue(UUID familyId);

  /** Find a user's membership in a specific family. */
  Optional<FamilyMember> findByFamilyIdAndUserId(UUID familyId, UUID userId);

  /** Find a user's membership across all families. */
  Optional<FamilyMember> findByUserId(UUID userId);

  /** Find all family memberships for a user. */
  List<FamilyMember> findAllByUserId(UUID userId);

  /** Check if a user is a member of a specific family. */
  boolean existsByFamilyIdAndUserId(UUID familyId, UUID userId);

  /** Find all adults (OWNER and ADULT roles) in a family. */
  @Query(
      """
        SELECT m FROM FamilyMember m
        WHERE m.family.id = :familyId
        AND m.role IN ('OWNER', 'ADULT')
        AND m.isActive = true
        """)
  List<FamilyMember> findAdultsByFamilyId(@Param("familyId") UUID familyId);

  /** Find all minors (TEEN and CHILD roles) in a family. */
  @Query(
      """
        SELECT m FROM FamilyMember m
        WHERE m.family.id = :familyId
        AND m.role IN ('TEEN', 'CHILD')
        AND m.isActive = true
        """)
  List<FamilyMember> findMinorsByFamilyId(@Param("familyId") UUID familyId);

  /** Find members by role in a family. */
  List<FamilyMember> findByFamilyIdAndRole(UUID familyId, FamilyRole role);

  /** Count active members in a family. */
  long countByFamilyIdAndIsActiveTrue(UUID familyId);

  /** Delete all memberships for a user. */
  void deleteByUserId(UUID userId);
}
