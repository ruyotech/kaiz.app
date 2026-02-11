package app.kaiz.essentia.application;

import app.kaiz.essentia.application.dto.EssentiaBookDto;
import app.kaiz.essentia.application.dto.EssentiaCardDto;
import app.kaiz.essentia.application.dto.EssentiaUserProgressDto;
import app.kaiz.essentia.domain.EssentiaBook;
import app.kaiz.essentia.domain.EssentiaCard;
import app.kaiz.essentia.domain.EssentiaUserProgress;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class EssentiaMapper {

  public EssentiaCardDto toCardDto(EssentiaCard card) {
    return new EssentiaCardDto(
        card.getId().toString(),
        card.getType(),
        card.getSortOrder(),
        card.getTitle(),
        card.getText(),
        card.getImageUrl());
  }

  public EssentiaBookDto toBookDto(EssentiaBook book) {
    List<EssentiaCardDto> cardDtos = book.getCards().stream().map(this::toCardDto).toList();
    List<String> relatedBookIds = mapRelatedBookIds(book);

    return new EssentiaBookDto(
        book.getId().toString(),
        book.getTitle(),
        book.getAuthor(),
        book.getLifeWheelArea() != null ? book.getLifeWheelArea().getId() : null,
        book.getCategory(),
        book.getDuration(),
        book.getCardCount(),
        book.getDifficulty(),
        book.getTags(),
        book.getDescription(),
        book.getSummaryText(),
        book.getCoreMethodology(),
        book.getAppApplication(),
        book.getCoverImageUrl(),
        book.getIsbn(),
        book.getIsFeatured(),
        book.getIsPublished(),
        book.getKeyTakeaways(),
        book.getPublicationYear(),
        book.getRating(),
        book.getCompletionCount(),
        book.getCreatedAt(),
        book.getUpdatedAt(),
        cardDtos,
        relatedBookIds);
  }

  public EssentiaBookDto toBookDtoWithoutCards(EssentiaBook book) {
    List<String> relatedBookIds = mapRelatedBookIds(book);

    return new EssentiaBookDto(
        book.getId().toString(),
        book.getTitle(),
        book.getAuthor(),
        book.getLifeWheelArea() != null ? book.getLifeWheelArea().getId() : null,
        book.getCategory(),
        book.getDuration(),
        book.getCardCount(),
        book.getDifficulty(),
        book.getTags(),
        book.getDescription(),
        book.getSummaryText(),
        book.getCoreMethodology(),
        book.getAppApplication(),
        book.getCoverImageUrl(),
        book.getIsbn(),
        book.getIsFeatured(),
        book.getIsPublished(),
        book.getKeyTakeaways(),
        book.getPublicationYear(),
        book.getRating(),
        book.getCompletionCount(),
        book.getCreatedAt(),
        book.getUpdatedAt(),
        List.of(),
        relatedBookIds);
  }

  public EssentiaUserProgressDto toProgressDto(EssentiaUserProgress progress) {
    return new EssentiaUserProgressDto(
        progress.getId().toString(),
        progress.getBook().getId().toString(),
        progress.getBook().getTitle(),
        progress.getCurrentCardIndex(),
        progress.getBook().getCardCount(),
        progress.getIsCompleted(),
        progress.getIsFavorite(),
        progress.getCreatedAt(),
        progress.getUpdatedAt());
  }

  private List<String> mapRelatedBookIds(EssentiaBook book) {
    if (book.getRelatedBooks() == null || book.getRelatedBooks().isEmpty()) {
      return List.of();
    }
    return book.getRelatedBooks().stream().map(related -> related.getId().toString()).toList();
  }
}
