package app.kaiz.essentia.domain;

import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "essentia_cards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class EssentiaCard extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "book_id", nullable = false)
  private EssentiaBook book;

  @Enumerated(EnumType.STRING)
  @Column(name = "type", nullable = false, length = 20)
  private CardType type;

  @Column(name = "sort_order", nullable = false)
  private Integer sortOrder;

  @Column(name = "title", nullable = false, length = 200)
  private String title;

  @Column(name = "text", nullable = false, columnDefinition = "TEXT")
  private String text;

  @Column(name = "image_url", length = 500)
  private String imageUrl;
}
