package app.kaiz.admin.application.dto;

import app.kaiz.essentia.domain.CardType;
import app.kaiz.essentia.domain.Difficulty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class AdminEssentiaDtos {

  // ============ Book Response ============

  public record BookResponse(
      String id,
      String title,
      String author,
      String lifeWheelAreaId,
      String category,
      Integer duration,
      Integer cardCount,
      Difficulty difficulty,
      List<String> tags,
      String description,
      String summaryText,
      String coreMethodology,
      String appApplication,
      String coverImageUrl,
      String isbn,
      Boolean isFeatured,
      Boolean isPublished,
      List<String> keyTakeaways,
      Integer publicationYear,
      BigDecimal rating,
      Integer completionCount,
      Instant createdAt,
      Instant updatedAt,
      List<CardResponse> cards) {}

  // ============ Card Response ============

  public record CardResponse(
      String id, CardType type, Integer sortOrder, String title, String text, String imageUrl) {}

  // ============ Create Book Request ============

  public record CreateBookRequest(
      @NotBlank(message = "Title is required") String title,
      @NotBlank(message = "Author is required") String author,
      @NotBlank(message = "Life wheel area ID is required") String lifeWheelAreaId,
      @NotBlank(message = "Category is required") String category,
      @NotNull(message = "Duration is required") Integer duration,
      @NotNull(message = "Difficulty is required") Difficulty difficulty,
      List<String> tags,
      String description,
      String summaryText,
      String coreMethodology,
      String appApplication,
      String coverImageUrl,
      String isbn,
      Boolean isFeatured,
      Boolean isPublished,
      List<String> keyTakeaways,
      Integer publicationYear,
      BigDecimal rating,
      @Valid List<CreateCardRequest> cards) {}

  // ============ Update Book Request ============

  public record UpdateBookRequest(
      String title,
      String author,
      String lifeWheelAreaId,
      String category,
      Integer duration,
      Difficulty difficulty,
      List<String> tags,
      String description,
      String summaryText,
      String coreMethodology,
      String appApplication,
      String coverImageUrl,
      String isbn,
      Boolean isFeatured,
      Boolean isPublished,
      List<String> keyTakeaways,
      Integer publicationYear,
      BigDecimal rating) {}

  // ============ Create Card Request ============

  public record CreateCardRequest(
      @NotNull(message = "Card type is required") CardType type,
      @NotNull(message = "Sort order is required") Integer sortOrder,
      @NotBlank(message = "Title is required") String title,
      @NotBlank(message = "Text is required") String text,
      String imageUrl) {}

  // ============ Update Card Request ============

  public record UpdateCardRequest(
      CardType type, Integer sortOrder, String title, String text, String imageUrl) {}

  // ============ Bulk Import Request ============

  public record BulkImportRequest(@Valid @NotNull List<CreateBookRequest> books) {}

  // ============ Bulk Update Request ============

  public record BulkUpdateRequest(@Valid @NotNull List<BulkUpdateItem> items) {}

  public record BulkUpdateItem(
      @NotBlank(message = "Book ID is required") String bookId,
      Boolean isFeatured,
      Boolean isPublished,
      String category,
      Difficulty difficulty) {}

  // ============ Book Stats Response ============

  public record BookStatsResponse(
      long totalBooks,
      long publishedBooks,
      long featuredBooks,
      long totalCards,
      List<CategoryCount> booksByCategory,
      List<AreaCount> booksByLifeWheelArea) {}

  public record CategoryCount(String category, long count) {}

  public record AreaCount(String lifeWheelAreaId, long count) {}
}
