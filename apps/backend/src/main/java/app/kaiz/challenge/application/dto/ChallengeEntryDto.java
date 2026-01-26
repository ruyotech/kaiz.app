package app.kaiz.challenge.application.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record ChallengeEntryDto(
    UUID id,
    UUID challengeId,
    UUID userId,
    LocalDate entryDate,
    BigDecimal valueNumeric,
    Boolean valueBoolean,
    String note,
    Instant createdAt) {

  public record CreateChallengeEntryRequest(
      @NotNull LocalDate entryDate,
      @DecimalMin("0") BigDecimal valueNumeric,
      Boolean valueBoolean,
      @Size(max = 1000) String note) {}
}
