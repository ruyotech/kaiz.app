package app.kaiz.community.infrastructure;

import app.kaiz.community.domain.AccountabilityPartner;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/** Repository for AccountabilityPartner entity. */
@Repository
public interface AccountabilityPartnerRepository
        extends JpaRepository<AccountabilityPartner, UUID> {

    @Query(
            "SELECT p FROM AccountabilityPartner p WHERE p.member.id = :memberId OR p.partner.id = :partnerId")
    List<AccountabilityPartner> findByMemberIdOrPartnerId(
            @Param("memberId") UUID memberId, @Param("partnerId") UUID partnerId);

    List<AccountabilityPartner> findByMemberId(UUID memberId);

    List<AccountabilityPartner> findByPartnerId(UUID partnerId);
}
