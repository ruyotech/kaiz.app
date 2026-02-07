package app.kaiz.admin.application;

import app.kaiz.admin.application.dto.AdminDtos.*;
import app.kaiz.admin.domain.AboutFeature;
import app.kaiz.admin.domain.AdminArticle;
import app.kaiz.admin.domain.Faq;
import app.kaiz.admin.domain.PricingTier;
import app.kaiz.admin.domain.SiteContent;
import app.kaiz.admin.domain.Testimonial;
import app.kaiz.admin.infrastructure.AboutFeatureRepository;
import app.kaiz.admin.infrastructure.AdminArticleRepository;
import app.kaiz.admin.infrastructure.FaqRepository;
import app.kaiz.admin.infrastructure.PricingTierRepository;
import app.kaiz.admin.infrastructure.SiteContentRepository;
import app.kaiz.admin.infrastructure.TestimonialRepository;
import app.kaiz.shared.exception.BadRequestException;
import app.kaiz.shared.exception.ResourceNotFoundException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminContentService {

  private final SiteContentRepository siteContentRepository;
  private final AboutFeatureRepository aboutFeatureRepository;
  private final TestimonialRepository testimonialRepository;
  private final FaqRepository faqRepository;
  private final PricingTierRepository pricingTierRepository;
  private final AdminArticleRepository articleRepository;
  private final ObjectMapper objectMapper;

  // ============ Site Content Methods ============

  @Cacheable("siteContent")
  @Transactional(readOnly = true)
  public List<SiteContentResponse> getAllSiteContent() {
    return siteContentRepository.findAll().stream().map(this::toSiteContentResponse).toList();
  }

  @Cacheable(value = "siteContent", key = "#key")
  @Transactional(readOnly = true)
  public SiteContentResponse getSiteContentByKey(String key) {
    return siteContentRepository
        .findByKey(key)
        .map(this::toSiteContentResponse)
        .orElseThrow(() -> new ResourceNotFoundException("Site content not found: " + key));
  }

  @CacheEvict(value = "siteContent", allEntries = true)
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

  @CacheEvict(value = "siteContent", allEntries = true)
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

  @Cacheable("features")
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

  @CacheEvict(value = "features", allEntries = true)
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

  @CacheEvict(value = "features", allEntries = true)
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

  @CacheEvict(value = "features", allEntries = true)
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

  @CacheEvict(value = "features", allEntries = true)
  @Transactional
  public void deleteAboutFeature(UUID id) {}

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

  @Cacheable("faqs")
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

  @CacheEvict(value = "faqs", allEntries = true)
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

  @CacheEvict(value = "faqs", allEntries = true)
  @Transactional
  public FaqResponse updateFaq(UUID id, UpdateFaqRequest request) {
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

  @CacheEvict(value = "faqs", allEntries = true)
  @Transactional
  public void deleteFaq(UUID id) {}

  // ============ Pricing Tier Methods ============

  @Cacheable("pricing")
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

  @CacheEvict(value = "pricing", allEntries = true)
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

  @CacheEvict(value = "pricing", allEntries = true)
  @Transactional
  public PricingTierResponse updatePricingTier(UUID id, UpdatePricingTierRequest request) {
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

  @CacheEvict(value = "pricing", allEntries = true)
  @Transactional
  public void deletePricingTier(UUID id) {}

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
      throw new IllegalStateException("Failed to serialize to JSON", e);
    }
  }

  // ============ Article Methods ============

  @Transactional(readOnly = true)
  public List<ArticleResponse> getAllArticles() {
    return articleRepository.findAll().stream()
        .sorted(java.util.Comparator.comparing(AdminArticle::getCreatedAt).reversed())
        .map(this::toArticleResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public ArticleResponse getArticleBySlug(String slug) {
    return articleRepository
        .findBySlug(slug)
        .map(this::toArticleResponse)
        .orElseThrow(() -> new ResourceNotFoundException("Article not found: " + slug));
  }

  @Transactional
  public ArticleResponse createArticle(CreateArticleRequest request) {
    if (articleRepository.existsBySlug(request.slug())) {
      throw new BadRequestException("Article with slug already exists: " + request.slug());
    }

    AdminArticle article =
        AdminArticle.builder()
            .slug(request.slug())
            .title(request.title())
            .summary(request.summary())
            .content(request.content())
            .coverImageUrl(request.coverImageUrl())
            .author(request.author())
            .tags(toJson(request.tags()))
            .category(request.category())
            .status(request.status())
            .featured(request.featured())
            .publishedAt(request.status().equals("PUBLISHED") ? java.time.Instant.now() : null)
            .build();

    return toArticleResponse(articleRepository.save(article));
  }

  @Transactional
  public ArticleResponse updateArticle(UUID id, UpdateArticleRequest request) {
    AdminArticle article =
        articleRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Article not found: " + id));

    if (request.title() != null) article.setTitle(request.title());
    if (request.summary() != null) article.setSummary(request.summary());
    if (request.content() != null) article.setContent(request.content());
    if (request.coverImageUrl() != null) article.setCoverImageUrl(request.coverImageUrl());
    if (request.author() != null) article.setAuthor(request.author());
    if (request.tags() != null) article.setTags(toJson(request.tags()));
    if (request.category() != null) article.setCategory(request.category());

    if (request.status() != null && !request.status().equals(article.getStatus())) {
      article.setStatus(request.status());
      if ("PUBLISHED".equals(request.status()) && article.getPublishedAt() == null) {
        article.setPublishedAt(java.time.Instant.now());
      }
    }

    if (request.featured() != null) article.setFeatured(request.featured());

    return toArticleResponse(articleRepository.save(article));
  }

  @Transactional
  public void deleteArticle(UUID id) {
    if (!articleRepository.existsById(id)) {
      throw new ResourceNotFoundException("Article not found: " + id);
    }
    articleRepository.deleteById(id);
  }

  private ArticleResponse toArticleResponse(AdminArticle article) {
    return new ArticleResponse(
        article.getId(),
        article.getSlug(),
        article.getTitle(),
        article.getSummary(),
        article.getContent(),
        article.getCoverImageUrl(),
        article.getAuthor(),
        fromJson(article.getTags(), new TypeReference<List<String>>() {}),
        article.getCategory(),
        article.getStatus(),
        article.getPublishedAt(),
        article.isFeatured(),
        article.getViewCount(),
        article.getCreatedAt(),
        article.getUpdatedAt());
  }

  private <T> T fromJson(String json, TypeReference<T> typeRef) {
    if (json == null || json.isBlank()) return null;
    try {
      return objectMapper.readValue(json, typeRef);
    } catch (JsonProcessingException e) {
      throw new IllegalStateException("Failed to deserialize JSON", e);
    }
  }
}
