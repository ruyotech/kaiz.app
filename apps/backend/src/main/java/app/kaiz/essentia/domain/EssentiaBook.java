package app.kaiz.essentia.domain;

import app.kaiz.life_wheel.domain.LifeWheelArea;
import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "essentia_books")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class EssentiaBook extends BaseEntity {

  @Column(name = "title", nullable = false, length = 300)
  private String title;

  @Column(name = "author", nullable = false, length = 200)
  private String author;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "life_wheel_area_id")
  private LifeWheelArea lifeWheelArea;

  @Column(name = "category", length = 100)
  private String category;

  @Column(name = "duration")
  private Integer duration;

  @Column(name = "card_count")
  private Integer cardCount;

  @Enumerated(EnumType.STRING)
  @Column(name = "difficulty", length = 20)
  @Builder.Default
  private Difficulty difficulty = Difficulty.BEGINNER;

  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(name = "essentia_book_tags", joinColumns = @JoinColumn(name = "book_id"))
  @Column(name = "tag")
  @Builder.Default
  private List<String> tags = new ArrayList<>();

  @Column(name = "description", columnDefinition = "TEXT")
  private String description;

  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(name = "essentia_book_takeaways", joinColumns = @JoinColumn(name = "book_id"))
  @Column(name = "takeaway", columnDefinition = "TEXT")
  @OrderColumn(name = "sort_order")
  @Builder.Default
  private List<String> keyTakeaways = new ArrayList<>();

  @Column(name = "publication_year")
  private Integer publicationYear;

  @Column(name = "rating", precision = 3, scale = 2)
  private BigDecimal rating;

  @Column(name = "completion_count")
  @Builder.Default
  private Integer completionCount = 0;

  @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, orphanRemoval = true)
  @OrderBy("sortOrder ASC")
  @Builder.Default
  private List<EssentiaCard> cards = new ArrayList<>();
}
