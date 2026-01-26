package com.kaiz.lifeos.admin.api;

import com.kaiz.lifeos.admin.application.AdminContentService;
import com.kaiz.lifeos.admin.application.dto.AdminDtos.*;
import com.kaiz.lifeos.shared.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/content")
@RequiredArgsConstructor
@Tag(name = "Admin Content", description = "Admin endpoints for managing site content")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminContentController {

  private final AdminContentService adminContentService;

  // ============ Site Content Endpoints ============

  @GetMapping("/site")
  @Operation(summary = "Get all site content")
  public ResponseEntity<ApiResponse<List<SiteContentResponse>>> getAllSiteContent() {
    return ResponseEntity.ok(ApiResponse.success(adminContentService.getAllSiteContent()));
  }

  @GetMapping("/site/{key}")
  @Operation(summary = "Get site content by key")
  public ResponseEntity<ApiResponse<SiteContentResponse>> getSiteContentByKey(
      @PathVariable String key) {
    return ResponseEntity.ok(ApiResponse.success(adminContentService.getSiteContentByKey(key)));
  }

  @PostMapping("/site")
  @Operation(summary = "Create new site content")
  public ResponseEntity<ApiResponse<SiteContentResponse>> createSiteContent(
      @Valid @RequestBody CreateSiteContentRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.success(adminContentService.createSiteContent(request)));
  }

  @PutMapping("/site/{key}")
  @Operation(summary = "Update site content by key")
  public ResponseEntity<ApiResponse<SiteContentResponse>> updateSiteContent(
      @PathVariable String key, @Valid @RequestBody UpdateSiteContentRequest request) {
    return ResponseEntity.ok(ApiResponse.success(adminContentService.updateSiteContent(key, request)));
  }

  // ============ About Features Endpoints ============

  @GetMapping("/features")
  @Operation(summary = "Get all about page features")
  public ResponseEntity<ApiResponse<List<AboutFeatureResponse>>> getAllAboutFeatures() {
    return ResponseEntity.ok(ApiResponse.success(adminContentService.getAllAboutFeatures()));
  }

  @PostMapping("/features")
  @Operation(summary = "Create new about page feature")
  public ResponseEntity<ApiResponse<AboutFeatureResponse>> createAboutFeature(
      @Valid @RequestBody CreateAboutFeatureRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.success(adminContentService.createAboutFeature(request)));
  }

  @PutMapping("/features/{id}")
  @Operation(summary = "Update about page feature")
  public ResponseEntity<ApiResponse<AboutFeatureResponse>> updateAboutFeature(
      @PathVariable UUID id, @Valid @RequestBody UpdateAboutFeatureRequest request) {
    return ResponseEntity.ok(
        ApiResponse.success(adminContentService.updateAboutFeature(id, request)));
  }

  @PutMapping("/features/reorder")
  @Operation(summary = "Reorder about page features")
  public ResponseEntity<ApiResponse<Void>> reorderAboutFeatures(
      @Valid @RequestBody ReorderFeaturesRequest request) {
    adminContentService.reorderAboutFeatures(request);
    return ResponseEntity.ok(ApiResponse.success(null));
  }

  @DeleteMapping("/features/{id}")
  @Operation(summary = "Delete about page feature")
  public ResponseEntity<ApiResponse<Void>> deleteAboutFeature(@PathVariable UUID id) {
    adminContentService.deleteAboutFeature(id);
    return ResponseEntity.ok(ApiResponse.success(null));
  }

  // ============ Testimonials Endpoints ============

  @GetMapping("/testimonials")
  @Operation(summary = "Get all testimonials")
  public ResponseEntity<ApiResponse<List<TestimonialResponse>>> getAllTestimonials() {
    return ResponseEntity.ok(ApiResponse.success(adminContentService.getAllTestimonials()));
  }

  @PostMapping("/testimonials")
  @Operation(summary = "Create new testimonial")
  public ResponseEntity<ApiResponse<TestimonialResponse>> createTestimonial(
      @Valid @RequestBody CreateTestimonialRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.success(adminContentService.createTestimonial(request)));
  }

  @PutMapping("/testimonials/{id}")
  @Operation(summary = "Update testimonial")
  public ResponseEntity<ApiResponse<TestimonialResponse>> updateTestimonial(
      @PathVariable UUID id, @Valid @RequestBody UpdateTestimonialRequest request) {
    return ResponseEntity.ok(
        ApiResponse.success(adminContentService.updateTestimonial(id, request)));
  }

  @DeleteMapping("/testimonials/{id}")
  @Operation(summary = "Delete testimonial")
  public ResponseEntity<ApiResponse<Void>> deleteTestimonial(@PathVariable UUID id) {
    adminContentService.deleteTestimonial(id);
    return ResponseEntity.ok(ApiResponse.success(null));
  }

  // ============ FAQ Endpoints ============

  @GetMapping("/faqs")
  @Operation(summary = "Get all FAQs")
  public ResponseEntity<ApiResponse<List<FaqResponse>>> getAllFaqs() {
    return ResponseEntity.ok(ApiResponse.success(adminContentService.getAllFaqs()));
  }

  @PostMapping("/faqs")
  @Operation(summary = "Create new FAQ")
  public ResponseEntity<ApiResponse<FaqResponse>> createFaq(
      @Valid @RequestBody CreateFaqRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.success(adminContentService.createFaq(request)));
  }

  @PutMapping("/faqs/{id}")
  @Operation(summary = "Update FAQ")
  public ResponseEntity<ApiResponse<FaqResponse>> updateFaq(
      @PathVariable Long id, @Valid @RequestBody UpdateFaqRequest request) {
    return ResponseEntity.ok(ApiResponse.success(adminContentService.updateFaq(id, request)));
  }

  @DeleteMapping("/faqs/{id}")
  @Operation(summary = "Delete FAQ")
  public ResponseEntity<ApiResponse<Void>> deleteFaq(@PathVariable Long id) {
    adminContentService.deleteFaq(id);
    return ResponseEntity.ok(ApiResponse.success(null));
  }

  // ============ Pricing Tier Endpoints ============

  @GetMapping("/pricing")
  @Operation(summary = "Get all pricing tiers")
  public ResponseEntity<ApiResponse<List<PricingTierResponse>>> getAllPricingTiers() {
    return ResponseEntity.ok(ApiResponse.success(adminContentService.getAllPricingTiers()));
  }

  @PostMapping("/pricing")
  @Operation(summary = "Create new pricing tier")
  public ResponseEntity<ApiResponse<PricingTierResponse>> createPricingTier(
      @Valid @RequestBody CreatePricingTierRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.success(adminContentService.createPricingTier(request)));
  }

  @PutMapping("/pricing/{id}")
  @Operation(summary = "Update pricing tier")
  public ResponseEntity<ApiResponse<PricingTierResponse>> updatePricingTier(
      @PathVariable Long id, @Valid @RequestBody UpdatePricingTierRequest request) {
    return ResponseEntity.ok(
        ApiResponse.success(adminContentService.updatePricingTier(id, request)));
  }

  @DeleteMapping("/pricing/{id}")
  @Operation(summary = "Delete pricing tier")
  public ResponseEntity<ApiResponse<Void>> deletePricingTier(@PathVariable Long id) {
    adminContentService.deletePricingTier(id);
    return ResponseEntity.ok(ApiResponse.success(null));
  }
}
