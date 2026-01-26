package app.kaiz.community.domain;

import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.*;
import lombok.experimental.SuperBuilder;

/**
 * Motivation group for accountability and support.
 */
@Entity
@Table(name = "community_groups")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class MotivationGroup extends BaseEntity {

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "description", nullable = false, length = 1000)
    private String description;

    @Column(name = "cover_image_url", length = 500)
    private String coverImageUrl;

    @Column(name = "life_wheel_area_id", length = 50)
    private String lifeWheelAreaId;

    @Column(name = "member_count")
    @Builder.Default
    private Integer memberCount = 0;

    @Column(name = "max_members")
    @Builder.Default
    private Integer maxMembers = 100;

    @Column(name = "is_private")
    @Builder.Default
    private Boolean isPrivate = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private CommunityMember creator;

    @ElementCollection
    @CollectionTable(name = "group_tags", joinColumns = @JoinColumn(name = "group_id"))
    @Column(name = "tag")
    @Builder.Default
    private List<String> tags = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "group_members", joinColumns = @JoinColumn(name = "group_id"))
    @Column(name = "member_id")
    @Builder.Default
    private Set<UUID> memberIds = new HashSet<>();

    public boolean addMember(UUID memberId) {
        if (memberIds.size() >= maxMembers) {
            return false;
        }
        if (memberIds.add(memberId)) {
            memberCount++;
            return true;
        }
        return false;
    }

    public boolean removeMember(UUID memberId) {
        if (memberIds.remove(memberId)) {
            memberCount--;
            return true;
        }
        return false;
    }

    public boolean isMember(UUID memberId) {
        return memberIds.contains(memberId);
    }

    public boolean isFull() {
        return memberCount >= maxMembers;
    }
}
