package com.kaiz.lifeos.essentia.application;

import com.kaiz.lifeos.essentia.application.dto.EssentiaBookDto;
import com.kaiz.lifeos.essentia.application.dto.EssentiaCardDto;
import com.kaiz.lifeos.essentia.application.dto.EssentiaUserProgressDto;
import com.kaiz.lifeos.essentia.domain.EssentiaBook;
import com.kaiz.lifeos.essentia.domain.EssentiaCard;
import com.kaiz.lifeos.essentia.domain.EssentiaUserProgress;
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

    return new EssentiaBookDto(
        book.getId().toString(),
        book.getTitle(),
        book.getAuthor(),
        book.getLifeWheelArea() != null ? book.getLifeWheelArea().getId().toString() : null,
        book.getCategory(),
        book.getDuration(),
        book.getCardCount(),
        book.getDifficulty(),
        book.getTags(),
        book.getDescription(),
        book.getKeyTakeaways(),
        book.getPublicationYear(),
        book.getRating(),
        book.getCompletionCount(),
        book.getCreatedAt(),
        book.getUpdatedAt(),
        cardDtos);
  }

  public EssentiaBookDto toBookDtoWithoutCards(EssentiaBook book) {
    return new EssentiaBookDto(
        book.getId().toString(),
        book.getTitle(),
        book.getAuthor(),
        book.getLifeWheelArea() != null ? book.getLifeWheelArea().getId().toString() : null,
        book.getCategory(),
        book.getDuration(),
        book.getCardCount(),
        book.getDifficulty(),
        book.getTags(),
        book.getDescription(),
        book.getKeyTakeaways(),
        book.getPublicationYear(),
        book.getRating(),
        book.getCompletionCount(),
        book.getCreatedAt(),
        book.getUpdatedAt(),
        List.of());
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
}
