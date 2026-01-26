package com.kaiz.lifeos.admin.application;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kaiz.lifeos.admin.application.dto.AdminDtos.*;
import com.kaiz.lifeos.admin.domain.AboutFeature;
import com.kaiz.lifeos.admin.domain.Faq;
import com.kaiz.lifeos.admin.domain.PricingTier;
import com.kaiz.lifeos.admin.domain.SiteContent;
import com.kaiz.lifeos.admin.domain.Testimonial;
import com.kaiz.lifeos.admin.infrastructure.AboutFeatureRepository;
import com.kaiz.lifeos.admin.infrastructure.FaqRepository;
import com.kaiz.lifeos.admin.infrastructure.PricingTierRepository;
import com.kaiz.lifeos.admin.infrastructure.SiteContentRepository;
import com.kaiz.lifeos.admin.infrastructure.TestimonialRepository;
import com.kaiz.lifeos.shared.exception.BadRequestException;
import com.kaiz.lifeos.shared.exception.ResourceNotFoundException;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminContentService {

  private final SiteContentRepository siteContentRepository;
  private final AboutFeatureRepository aboutFeatureRepository;
  private final TestimonialRepository testimonialRepository;
  private final FaqRepository faqRepository;
  private final PricingTierRepository pricingTierRepository;
  private final ObjectMapper objectMapper;

  // ============ Site Content Methods ============

  @Transactional(readOnly = true)
  public List<SiteContentResponse> getAllSiteContent() {
    return siteContentRepository.findAll().stream().map(this::toSiteContentResponse).toList();
  }

  @Transactional(readOnly = true)
  public SiteContentResponse getSiteContentByKey(String key) {
    return siteContentRepository
        .findByKey(key)
        .map(this::toSiteContentResponse)
        .orElseThrow(() -> new ResourceNotFoundException("Site content not found: " + key));
  }

  @Transactional
  public SiteContentResponse createSiteContent(CreateSiteContentRequest request) {
    if (siteContentRepository.existsByKey(request.key())) {
      throw new BadRequestException("Site content with key already exists: " + request.key());
    }

    SiteContent content =
        SiteContent.builder()
            .key(request.key())
            .type(request.type())
            .content(request.content())
            .active(request.active())
            .version(1)
            .build();

    return toSiteContentResponse(siteContentRepository.save(content));
  }

  @Transactional
  public SiteContentResponse updateSiteContent(String key, UpdateSiteContentRequest request) {
    SiteContent content =
        siteContentRepository
            .findByKey(key)
            .orElseThrow(() -> new ResourceNotFoundException("Site content not found: " + key));

    content.setContent(request.content());
    content.setActive(request.active());
    content.setVersion(content.getVersion() + 1);

    return toSiteContentResponse(siteContentRepository.save(content));
  }

  // ============ About Feature Methods ============

  @Transactional(readOnly = true)
  public List<AboutFeatureResponse> getAllAboutFeatures() {
    return aboutFeatureRepository.findAllOrderByDisplayOrder().stream()
        .map(this::toAboutFeatureResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<AboutFeatureResponse> getActiveAboutFeatures() {
    return aboutFeatureRepository.findByActiveOrderByDisplayOrderAsc(true).stream()
        .map(this::toAboutFeatureResponse)
        .toList();
  }

  @Transactional
  public AboutFeatureResponse createAboutFeature(CreateAboutFeatureRequest request) {
    if (aboutFeatureRepository.existsBySlug(request.slug())) {
      throw new BadRequestException("Feature with slug already exists: " + request.slug());
    }

    AboutFeature feature =
        AboutFeature.builder()
            .slug(request.slug())
            .title(request.title())
            .subtitle(request.subtitle())
            .description(request.description())
            .bulletPoints(toJson(request.bulletPoints()))
            .example(toJson(request.example()))
            .icon(request.icon())
            .color(request.color())
            .displayOrder(request.displayOrder())
            .active(request.active())
            .build();

    return toAboutFeatureResponse(aboutFeatureRepository.save(feature));
  }

  @Transactional
  public AboutFeatureResponse updateAboutFeature(UUID id, UpdateAboutFeatureRequest request) {
    AboutFeature feature =
        aboutFeatureRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Feature not found: " + id));

    if (request.title() != null) feature.setTitle(request.title());
    if (request.subtitle() != null) feature.setSubtitle(request.subtitle());
    if (request.description() != null) feature.setDescription(request.description());
    if (request.bulletPoints() != null) feature.setBulletPoints(toJson(request.bulletPoints()));
    if (request.example() != null) feature.setExample(toJson(request.example()));
    if (request.icon() != null) feature.setIcon(request.icon());
    if (request.color() != null) feature.setColor(request.color());
    if (request.displayOrder() != null) feature.setDisplayOrder(request.displayOrder());
    if (request.active() != null) feature.setActive(request.active());

    return toAboutFeatureResponse(aboutFeatureRepository.save(feature));
  }

  @Transactional
  public void reorderAboutFeatures(ReorderFeaturesRequest request) {
    List<AboutFeature> features = aboutFeatureRepository.findAllById(request.featureIds());

    for (int i = 0; i < request.featureIds().size(); i++) {
      UUID id = request.featureIds().get(i);
      final int order = i + 1;
      features.stream()
          .filter(f -> f.getId().equals(id))
          .findFirst()
          .ifPresent(f -> f.setDisplayOrder(order));
    }

    aboutFeatureRepository.saveAll(features);
  }

  @Transactional
  public void deleteAboutFeature(UUID id) {
    if (!aboutFeatureRepository.existsById(id)) {
      throw new ResourceNotFoundException("Feature not found: " + id);
    }
    aboutFeatureRepository.deleteById(id);
  }

  // ============ Testimonial Methods ============

  @Transactional(readOnly = true)
  public List<TestimonialResponse> getAllTestimonials() {
    return testimonialRepository.findAllOrderByDisplayOrder().stream()
        .map(this::toTestimonialResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<TestimonialResponse> getActiveTestimonials() {
    return testimonialRepository.findByActiveOrderByDisplayOrderAsc(true).stream()
        .map(this::toTestimonialResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<TestimonialResponse> getFeaturedTestimonials() {
    return testimonialRepository.findByFeaturedAndActiveOrderByDisplayOrderAsc(true, true).stream()
        .map(this::toTestimonialResponse)
        .toList();
  }

  @Transactional
  public TestimonialResponse createTestimonial(CreateTestimonialRequest request) {
    Testimonial testimonial =
        Testimonial.builder()
            .name(request.name())
            .role(request.role())
            .company(request.company())
            .avatarUrl(request.avatarUrl())
            .quote(request.quote())
            .rating(request.rating())
            .metrics(toJson(request.metrics()))
            .featured(request.featured())
            .displayOrder(request.displayOrder())
            .active(request.active())
            .build();

    return toTestimonialResponse(testimonialRepository.save(testimonial));
  }

  @Transactional
  public TestimonialResponse updateTestimonial(UUID id, UpdateTestimonialRequest request) {
    Testimonial testimonial =
        testimonialRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Testimonial not found: " + id));

    if (request.name() != null) testimonial.setName(request.name());
    if (request.role() != null) testimonial.setRole(request.role());
    if (request.company() != null) testimonial.setCompany(request.company());
    if (request.avatarUrl() != null) testimonial.setAvatarUrl(request.avatarUrl());
    if (request.quote() != null) testimonial.setQuote(request.quote());
    if (request.rating() != null) testimonial.setRating(request.rating());
    if (request.metrics() != null) testimonial.setMetrics(toJson(request.metrics()));
    if (request.featured() != null) testimonial.setFeatured(request.featured());
    if (request.displayOrder() != null) testimonial.setDisplayOrder(request.displayOrder());
    if (request.active() != null) testimonial.setActive(request.active());

    return toTestimonialResponse(testimonialRepository.save(testimonial));
  }

  @Transactional
  public void deleteTestimonial(UUID id) {
    if (!testimonialRepository.existsById(id)) {
      throw new ResourceNotFoundException("Testimonial not found: " + id);
    }
    testimonialRepository.deleteById(id);
  }

  // ============ FAQ Methods ============

  @Transactional(readOnly = true)
  public List<FaqResponse> getAllFaqs() {
    return faqRepository.findAllByOrderByDisplayOrderAsc().stream()
        .map(this::toFaqResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<FaqResponse> getActiveFaqs() {
    return faqRepository.findByActiveOrderByDisplayOrderAsc(true).stream()
        .map(this::toFaqResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<FaqResponse> getFaqsByCategory(String category) {
    return faqRepository.findByCategoryAndActiveOrderByDisplayOrderAsc(category, true).stream()
        .map(this::toFaqResponse)
        .toList();
  }

  @Transactional
  public FaqResponse createFaq(CreateFaqRequest request) {
    Faq faq =
        Faq.builder()
            .question(request.question())
            .answer(request.answer())
            .category(request.category())
            .displayOrder(request.displayOrder())
            .active(request.active())
            .build();

    return toFaqResponse(faqRepository.save(faq));
  }

  @Transactional
  public FaqResponse updateFaq(Long id, UpdateFaqRequest request) {
    Faq faq =
        faqRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("FAQ not found: " + id));

    if (request.question() != null) faq.setQuestion(request.question());
    if (request.answer() != null) faq.setAnswer(request.answer());
    if (request.category() != null) faq.setCategory(request.category());
    if (request.displayOrder() != null) faq.setDisplayOrder(request.displayOrder());
    if (request.active() != null) faq.setActive(request.active());

    return toFaqResponse(faqRepository.save(faq));
  }

  @Transactional
  public void deleteFaq(Long id) {
    if (!faqRepository.existsById(id)) {
      throw new ResourceNotFoundException("FAQ not found: " + id);
    }
    faqRepository.deleteById(id);
  }

  // ============ Pricing Tier Methods ============

  @Transactional(readOnly = true)
  public List<PricingTierResponse> getAllPricingTiers() {
    return pricingTierRepository.findAllByOrderByDisplayOrderAsc().stream()
        .map(this::toPricingTierResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<PricingTierResponse> getActivePricingTiers() {
    return pricingTierRepository.findByActiveOrderByDisplayOrderAsc(true).stream()
        .map(this::toPricingTierResponse)
        .toList();
  }

  @Transactional
  public PricingTierResponse createPricingTier(CreatePricingTierRequest request) {
    PricingTier tier =
        PricingTier.builder()
            .name(request.name())
            .price(request.price())
            .billingPeriod(request.billingPeriod())
            .description(request.description())
            .features(toJson(request.features()))
            .ctaText(request.ctaText())
            .ctaLink(request.ctaLink())
            .popular(request.popular())
            .displayOrder(request.displayOrder())
            .active(request.active())
            .build();

    return toPricingTierResponse(pricingTierRepository.save(tier));
  }

  @Transactional
  public PricingTierResponse updatePricingTier(Long id, UpdatePricingTierRequest request) {
    PricingTier tier =
        pricingTierRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Pricing tier not found: " + id));

    if (request.name() != null) tier.setName(request.name());
    if (request.price() != null) tier.setPrice(request.price());
    if (request.billingPeriod() != null) tier.setBillingPeriod(request.billingPeriod());
    if (request.description() != null) tier.setDescription(request.description());
    if (request.features() != null) tier.setFeatures(toJson(request.features()));
    if (request.ctaText() != null) tier.setCtaText(request.ctaText());
    if (request.ctaLink() != null) tier.setCtaLink(request.ctaLink());
    if (request.popular() != null) tier.setPopular(request.popular());
    if (request.displayOrder() != null) tier.setDisplayOrder(request.displayOrder());
    if (request.active() != null) tier.setActive(request.active());

    return toPricingTierResponse(pricingTierRepository.save(tier));
  }

  @Transactional
  public void deletePricingTier(Long id) {
    if (!pricingTierRepository.existsById(id)) {
      throw new ResourceNotFoundException("Pricing tier not found: " + id);
    }
    pricingTierRepository.deleteById(id);
  }

  // ============ Mapper Methods ============

  private SiteContentResponse toSiteContentResponse(SiteContent content) {
    return new SiteContentResponse(
        content.getId(),
        content.getKey(),
        content.getType(),
        content.getContent(),
        content.isActive(),
        content.getVersion(),
        content.getCreatedAt(),
        content.getUpdatedAt());
  }

  private AboutFeatureResponse toAboutFeatureResponse(AboutFeature feature) {
    return new AboutFeatureResponse(
        feature.getId(),
        feature.getSlug(),
        feature.getTitle(),
        feature.getSubtitle(),
        feature.getDescription(),
        fromJson(feature.getBulletPoints(), new TypeReference<List<String>>() {}),
        fromJson(feature.getExample(), new TypeReference<FeatureExample>() {}),
        feature.getIcon(),
        feature.getColor(),
        feature.getDisplayOrder(),
        feature.isActive(),
        feature.getCreatedAt(),
        feature.getUpdatedAt());
  }

  private TestimonialResponse toTestimonialResponse(Testimonial testimonial) {
    return new TestimonialResponse(
        testimonial.getId(),
        testimonial.getName(),
        testimonial.getRole(),
        testimonial.getCompany(),
        testimonial.getAvatarUrl(),
        testimonial.getQuote(),
        testimonial.getRating(),
        fromJson(testimonial.getMetrics(), new TypeReference<TestimonialMetrics>() {}),
        testimonial.isFeatured(),
        testimonial.getDisplayOrder(),
        testimonial.isActive(),
        testimonial.getCreatedAt(),
        testimonial.getUpdatedAt());
  }

  private FaqResponse toFaqResponse(Faq faq) {
    return new FaqResponse(
        faq.getId(),
        faq.getQuestion(),
        faq.getAnswer(),
        faq.getCategory(),
        faq.getDisplayOrder(),
        faq.getActive(),
        faq.getCreatedAt(),
        faq.getUpdatedAt());
  }

  private PricingTierResponse toPricingTierResponse(PricingTier tier) {
    return new PricingTierResponse(
        tier.getId(),
        tier.getName(),
        tier.getPrice(),
        tier.getBillingPeriod(),
        tier.getDescription(),
        fromJson(tier.getFeatures(), new TypeReference<List<String>>() {}),
        tier.getCtaText(),
        tier.getCtaLink(),
        tier.getPopular(),
        tier.getDisplayOrder(),
        tier.getActive(),
        tier.getCreatedAt(),
        tier.getUpdatedAt());
  }

  private String toJson(Object obj) {
    if (obj == null) return null;
    try {
      return objectMapper.writeValueAsString(obj);
    } catch (JsonProcessingException e) {
      throw new RuntimeException("Failed to serialize to JSON", e);
    }
  }

  private <T> T fromJson(String json, TypeReference<T> typeRef) {
    if (json == null || json.isBlank()) return null;
    try {
      return objectMapper.readValue(json, typeRef);
    } catch (JsonProcessingException e) {
      throw new RuntimeException("Failed to deserialize JSON", e);
    }
  }
}
