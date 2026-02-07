package app.kaiz.admin.application.dto;

import app.kaiz.mindset.domain.EmotionalTone;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.List;
import java.util.Map;

public final class AdminMindsetDtos {

  private AdminMindsetDtos() {}

  // ── Content DTOs ────────────────────────────────────────────────────────

  public record AdminMindsetContentResponse(
      String id,
      String body,
      String author,
      String dimensionTag,
      List<String> secondaryTags,
      String themePreset,
      Integer interventionWeight,
      EmotionalTone emotionalTone,
      String backgroundImageUrl,
      String lifeWheelAreaId,
      String lifeWheelAreaName,
      String lifeWheelAreaColor,
      long favoriteCount,
      Instant createdAt,
      Instant updatedAt) {}

  public record CreateMindsetContentRequest(
      @NotBlank String body,
      @NotBlank String author,
      @NotNull String lifeWheelAreaId,
      EmotionalTone emotionalTone,
      Integer interventionWeight,
      String themePreset,
      String backgroundImageUrl,
      String dimensionTag,
      List<String> secondaryTags) {}

  public record UpdateMindsetContentRequest(
      String body,
      String author,
      String lifeWheelAreaId,
      EmotionalTone emotionalTone,
      Integer interventionWeight,
      String themePreset,
      String backgroundImageUrl,
      String dimensionTag,
      List<String> secondaryTags) {}

  public record BulkCreateMindsetContentRequest(
      @NotEmpty @Valid List<CreateMindsetContentRequest> quotes) {}

  public record BulkUploadResultResponse(int created, int failed, List<String> errors) {}

  // ── Theme DTOs ──────────────────────────────────────────────────────────

  public record AdminMindsetThemeResponse(
      String id,
      String name,
      String backgroundColor,
      String textColor,
      String accentColor,
      List<String> gradientColors,
      String defaultAsset,
      Instant createdAt,
      Instant updatedAt) {}

  public record CreateMindsetThemeRequest(
      @NotBlank String name,
      String backgroundColor,
      String textColor,
      String accentColor,
      List<String> gradientColors,
      String defaultAsset) {}

  public record UpdateMindsetThemeRequest(
      String name,
      String backgroundColor,
      String textColor,
      String accentColor,
      List<String> gradientColors,
      String defaultAsset) {}

  // ── Stats ───────────────────────────────────────────────────────────────

  public record AdminMindsetStatsResponse(
      long totalQuotes,
      long totalFavorites,
      Map<String, Long> quotesByDimension,
      Map<String, Long> quotesByTone,
      List<AdminMindsetContentResponse> topFavorited) {}
}
