package app.kaiz.admin.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class AdminDtos {

  // ============ Site Content DTOs ============

  public record SiteContentResponse(
      UUID id,
      String key,
      String type,
      String content,
      boolean active,
      Integer version,
      Instant createdAt,
      Instant updatedAt) {}

  public record UpdateSiteContentRequest(
      @NotBlank(message = "Content is required") String content, boolean active) {}

  public record CreateSiteContentRequest(
      @NotBlank(message = "Key is required") String key,
      @NotBlank(message = "Type is required") String type,
      @NotBlank(message = "Content is required") String content,
      boolean active) {}

  // ============ About Feature DTOs ============

  public record AboutFeatureResponse(
      UUID id,
      String slug,
      String title,
      String subtitle,
      String description,
      List<String> bulletPoints,
      FeatureExample example,
      String icon,
      String color,
      Integer displayOrder,
      boolean active,
      Instant createdAt,
      Instant updatedAt) {}

  public record FeatureExample(String scenario, String outcome) {}

  public record CreateAboutFeatureRequest(
      @NotBlank(message = "Slug is required") String slug,
      @NotBlank(message = "Title is required") String title,
      @NotBlank(message = "Subtitle is required") String subtitle,
      @NotBlank(message = "Description is required") String description,
      List<String> bulletPoints,
      FeatureExample example,
      @NotBlank(message = "Icon is required") String icon,
      @NotBlank(message = "Color is required") String color,
      @NotNull(message = "Display order is required") Integer displayOrder,
      boolean active) {}

  public record UpdateAboutFeatureRequest(
      String title,
      String subtitle,
      String description,
      List<String> bulletPoints,
      FeatureExample example,
      String icon,
      String color,
      Integer displayOrder,
      Boolean active) {}

  public record ReorderFeaturesRequest(List<UUID> featureIds) {}

  // ============ Testimonial DTOs ============

  public record TestimonialResponse(
      UUID id,
      String name,
      String role,
      String company,
      String avatarUrl,
      String quote,
      Integer rating,
      TestimonialMetrics metrics,
      boolean featured,
      Integer displayOrder,
      boolean active,
      Instant createdAt,
      Instant updatedAt) {}

  public record TestimonialMetrics(String label, String before, String after) {}

  public record CreateTestimonialRequest(
      @NotBlank(message = "Name is required") String name,
      @NotBlank(message = "Role is required") String role,
      String company,
      String avatarUrl,
      @NotBlank(message = "Quote is required") String quote,
      @NotNull(message = "Rating is required") Integer rating,
      TestimonialMetrics metrics,
      boolean featured,
      @NotNull(message = "Display order is required") Integer displayOrder,
      boolean active) {}

  public record UpdateTestimonialRequest(
      String name,
      String role,
      String company,
      String avatarUrl,
      String quote,
      Integer rating,
      TestimonialMetrics metrics,
      Boolean featured,
      Integer displayOrder,
      Boolean active) {}

  // ============ Analytics DTOs ============

  public record DashboardStatsResponse(
      long totalUsers,
      long activeToday,
      long newSignupsWeek,
      long activeChallenges,
      long sprintsCompleted,
      long tasksCompleted) {}

  public record CommunityStatsResponse(
      long totalCommunityMembers,
      long questionsAsked,
      long answersGiven,
      long templatesShared,
      long successStories) {}

  // ============ FAQ DTOs ============

  public record FaqResponse(
      UUID id,
      String question,
      String answer,
      String category,
      Integer displayOrder,
      boolean active,
      Instant createdAt,
      Instant updatedAt) {}

  public record CreateFaqRequest(
      @NotBlank(message = "Question is required") String question,
      @NotBlank(message = "Answer is required") String answer,
      String category,
      @NotNull(message = "Display order is required") Integer displayOrder,
      boolean active) {}

  public record UpdateFaqRequest(
      String question,
      String answer,
      String category,
      Integer displayOrder,
      Boolean active) {}

  // ============ Pricing Tier DTOs ============

  public record PricingTierResponse(
      UUID id,
      String name,
      java.math.BigDecimal price,
      String billingPeriod,
      String description,
      List<String> features,
      String ctaText,
      String ctaLink,
      boolean popular,
      Integer displayOrder,
      boolean active,
      Instant createdAt,
      Instant updatedAt) {}

  public record CreatePricingTierRequest(
      @NotBlank(message = "Name is required") String name,
      @NotNull(message = "Price is required") java.math.BigDecimal price,
      @NotBlank(message = "Billing period is required") String billingPeriod,
      String description,
      List<String> features,
      String ctaText,
      String ctaLink,
      boolean popular,
      @NotNull(message = "Display order is required") Integer displayOrder,
      boolean active) {}

  public record UpdatePricingTierRequest(
      String name,
      java.math.BigDecimal price,
      String billingPeriod,
      String description,
      List<String> features,
      String ctaText,
      String ctaLink,
      Boolean popular,
      Integer displayOrder,
      Boolean active) {}
}
