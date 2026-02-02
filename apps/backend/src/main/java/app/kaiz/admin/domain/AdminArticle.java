package app.kaiz.admin.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "articles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminArticle {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(nullable = false, unique = true)
  private String slug;

  @Column(nullable = false)
  private String title;

  @Column(columnDefinition = "TEXT")
  private String summary;

  @Column(columnDefinition = "TEXT")
  private String content;

  @Column(name = "cover_image_url")
  private String coverImageUrl;

  private String author;

  @Column(columnDefinition = "jsonb")
  private String tags;

  private String category;

  @Column(nullable = false)
  private String status; // DRAFT, PUBLISHED, ARCHIVED

  @Column(name = "published_at")
  private Instant publishedAt;

  @Column(name = "is_featured")
  private boolean featured;

  @Builder.Default
  @Column(name = "view_count")
  private Integer viewCount = 0;

  @CreationTimestamp private Instant createdAt;

  @UpdateTimestamp private Instant updatedAt;

  @Column(name = "created_by")
  private String createdBy;

  @Column(name = "updated_by")
  private String updatedBy;
}
