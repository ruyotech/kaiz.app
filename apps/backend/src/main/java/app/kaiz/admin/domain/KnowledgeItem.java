package app.kaiz.admin.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "knowledge_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KnowledgeItem {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "category_id")
  private UUID categoryId;

  @Column(nullable = false, unique = true)
  private String slug;

  @Column(nullable = false)
  private String title;

  @Column(columnDefinition = "TEXT")
  private String summary;

  @Column(columnDefinition = "TEXT")
  private String content;

  @Column(nullable = false)
  @Builder.Default
  private String difficulty = "BEGINNER";

  @Column(name = "read_time_minutes")
  @Builder.Default
  private Integer readTimeMinutes = 2;

  @Column(columnDefinition = "jsonb")
  private String tags;

  private String icon;

  @Column(nullable = false)
  @Builder.Default
  private String status = "DRAFT";

  @Column(name = "is_featured")
  @Builder.Default
  private Boolean featured = false;

  @Column(name = "view_count")
  @Builder.Default
  private Integer viewCount = 0;

  @Column(name = "helpful_count")
  @Builder.Default
  private Integer helpfulCount = 0;

  @Column(name = "display_order")
  @Builder.Default
  private Integer displayOrder = 0;

  @Column(name = "search_keywords", columnDefinition = "TEXT")
  private String searchKeywords;

  @CreationTimestamp private Instant createdAt;

  @UpdateTimestamp private Instant updatedAt;

  @Column(name = "created_by")
  private String createdBy;

  @Column(name = "updated_by")
  private String updatedBy;

  @Transient private String categoryName;
}
