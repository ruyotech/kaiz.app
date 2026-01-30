package app.kaiz.admin.api;

import app.kaiz.admin.application.AdminContentService;
import app.kaiz.admin.application.dto.AdminDtos.*;
import app.kaiz.shared.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/public/content")
@RequiredArgsConstructor
@Tag(
    name = "Public Content",
    description = "Public endpoints for website content (no auth required)")
public class PublicContentController {

  private final AdminContentService adminContentService;

  @GetMapping("/features")
  @Operation(summary = "Get active about page features")
  public ResponseEntity<ApiResponse<List<AboutFeatureResponse>>> getActiveAboutFeatures() {
    return ResponseEntity.ok(ApiResponse.success(adminContentService.getActiveAboutFeatures()));
  }

  @GetMapping("/testimonials")
  @Operation(summary = "Get active testimonials")
  public ResponseEntity<ApiResponse<List<TestimonialResponse>>> getActiveTestimonials() {
    return ResponseEntity.ok(ApiResponse.success(adminContentService.getActiveTestimonials()));
  }

  @GetMapping("/testimonials/featured")
  @Operation(summary = "Get featured testimonials")
  public ResponseEntity<ApiResponse<List<TestimonialResponse>>> getFeaturedTestimonials() {
    return ResponseEntity.ok(ApiResponse.success(adminContentService.getFeaturedTestimonials()));
  }

  @GetMapping("/site/{key}")
  @Operation(summary = "Get site content by key (only if active)")
  public ResponseEntity<ApiResponse<SiteContentResponse>> getSiteContent(@PathVariable String key) {
    SiteContentResponse content = adminContentService.getSiteContentByKey(key);
    if (!content.active()) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(ApiResponse.success(content));
  }

  @GetMapping("/faqs")
  @Operation(summary = "Get active FAQs")
  public ResponseEntity<ApiResponse<List<FaqResponse>>> getActiveFaqs() {
    return ResponseEntity.ok(ApiResponse.success(adminContentService.getActiveFaqs()));
  }

  @GetMapping("/faqs/category/{category}")
  @Operation(summary = "Get FAQs by category")
  public ResponseEntity<ApiResponse<List<FaqResponse>>> getFaqsByCategory(
      @PathVariable String category) {
    return ResponseEntity.ok(ApiResponse.success(adminContentService.getFaqsByCategory(category)));
  }

  @GetMapping("/pricing")
  @Operation(summary = "Get active pricing tiers")
  public ResponseEntity<ApiResponse<List<PricingTierResponse>>> getActivePricingTiers() {
    return ResponseEntity.ok(ApiResponse.success(adminContentService.getActivePricingTiers()));
  }
}
