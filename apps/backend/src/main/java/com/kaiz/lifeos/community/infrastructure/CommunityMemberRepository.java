package com.kaiz.lifeos.community.infrastructure;

import com.kaiz.lifeos.community.domain.CommunityMember;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/** Repository for CommunityMember entity. */
@Repository
public interface CommunityMemberRepository extends JpaRepository<CommunityMember, UUID> {

    @Query("SELECT m FROM CommunityMember m WHERE m.user.id = :userId")
    Optional<CommunityMember> findByUserId(@Param("userId") UUID userId);

    Page<CommunityMember> findByDisplayNameContainingIgnoreCase(String query, Pageable pageable);

    @Query("SELECT m FROM CommunityMember m ORDER BY m.reputationPoints DESC")
    Page<CommunityMember> findTopByReputationPoints(Pageable pageable);

    List<CommunityMember> findTop5ByOrderByReputationPointsDesc();
}
