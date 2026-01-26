package app.kaiz.community.domain;

import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

/**
 * Partner request for accountability partnership.
 */
@Entity
@Table(name = "community_partner_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class PartnerRequest extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_member_id", nullable = false)
    private CommunityMember fromMember;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_member_id", nullable = false)
    private CommunityMember toMember;

    @Column(name = "message", length = 500)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private PartnerRequestStatus status = PartnerRequestStatus.PENDING;

    public void accept() {
        this.status = PartnerRequestStatus.ACCEPTED;
    }

    public void decline() {
        this.status = PartnerRequestStatus.DECLINED;
    }
}
