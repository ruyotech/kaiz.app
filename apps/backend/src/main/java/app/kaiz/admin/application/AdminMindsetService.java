package app.kaiz.admin.application;

import app.kaiz.admin.application.dto.AdminMindsetDtos.*;
import app.kaiz.life_wheel.domain.LifeWheelArea;
import app.kaiz.life_wheel.infrastructure.LifeWheelAreaRepository;
import app.kaiz.mindset.domain.EmotionalTone;
import app.kaiz.mindset.domain.MindsetContent;
import app.kaiz.mindset.domain.MindsetTheme;
import app.kaiz.mindset.infrastructure.MindsetContentRepository;
import app.kaiz.mindset.infrastructure.MindsetThemeRepository;
import app.kaiz.mindset.infrastructure.UserMindsetFavoriteRepository;
import app.kaiz.shared.exception.BadRequestException;
import app.kaiz.shared.exception.ResourceNotFoundException;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class AdminMindsetService {

  private final MindsetContentRepository contentRepository;
  private final MindsetThemeRepository themeRepository;
  private final UserMindsetFavoriteRepository favoriteRepository;
  private final LifeWheelAreaRepository lifeWheelAreaRepository;

  // ── Content CRUD ────────────────────────────────────────────────────────

  public Page<AdminMindsetContentResponse> getAllContent(
      Pageable pageable, String dimension, String tone, String search) {

    Page<MindsetContent> page;

    if (search != null && !search.isBlank()) {
      page = contentRepository.searchByBodyOrAuthor(search.trim(), pageable);
    } else if (dimension != null && !dimension.isBlank()) {
      page = contentRepository.findByLifeWheelAreaId(dimension, pageable);
    } else if (tone != null && !tone.isBlank()) {
      page =
          contentRepository.findByEmotionalTone(
              EmotionalTone.valueOf(tone.toUpperCase()), pageable);
    } else {
      page = contentRepository.findAll(pageable);
    }

    return page.map(this::toAdminResponse);
  }

  public AdminMindsetContentResponse getContentById(UUID id) {
    MindsetContent content =
        contentRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("MindsetContent", id.toString()));
    return toAdminResponse(content);
  }

  @Transactional
  public AdminMindsetContentResponse createContent(CreateMindsetContentRequest request) {
    LifeWheelArea area = resolveLifeWheelArea(request.lifeWheelAreaId());

    MindsetContent content =
        MindsetContent.builder()
            .body(request.body())
            .author(request.author())
            .lifeWheelArea(area)
            .dimensionTag(
                request.dimensionTag() != null ? request.dimensionTag() : request.lifeWheelAreaId())
            .secondaryTags(
                request.secondaryTags() != null ? request.secondaryTags() : new ArrayList<>())
            .themePreset(request.themePreset() != null ? request.themePreset() : "dark")
            .interventionWeight(
                request.interventionWeight() != null ? request.interventionWeight() : 50)
            .emotionalTone(
                request.emotionalTone() != null
                    ? request.emotionalTone()
                    : EmotionalTone.MOTIVATIONAL)
            .backgroundImageUrl(request.backgroundImageUrl())
            .build();

    MindsetContent saved = contentRepository.save(content);
    log.info("Admin created mindset content: id={}, author={}", saved.getId(), saved.getAuthor());
    return toAdminResponse(saved);
  }

  @Transactional
  public AdminMindsetContentResponse updateContent(UUID id, UpdateMindsetContentRequest request) {
    MindsetContent content =
        contentRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("MindsetContent", id.toString()));

    if (request.body() != null) content.setBody(request.body());
    if (request.author() != null) content.setAuthor(request.author());
    if (request.lifeWheelAreaId() != null) {
      LifeWheelArea area = resolveLifeWheelArea(request.lifeWheelAreaId());
      content.setLifeWheelArea(area);
    }
    if (request.dimensionTag() != null) content.setDimensionTag(request.dimensionTag());
    if (request.secondaryTags() != null) content.setSecondaryTags(request.secondaryTags());
    if (request.themePreset() != null) content.setThemePreset(request.themePreset());
    if (request.interventionWeight() != null)
      content.setInterventionWeight(request.interventionWeight());
    if (request.emotionalTone() != null) content.setEmotionalTone(request.emotionalTone());
    if (request.backgroundImageUrl() != null)
      content.setBackgroundImageUrl(request.backgroundImageUrl());

    MindsetContent saved = contentRepository.save(content);
    log.info("Admin updated mindset content: id={}", saved.getId());
    return toAdminResponse(saved);
  }

  @Transactional
  public void deleteContent(UUID id) {
    MindsetContent content =
        contentRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("MindsetContent", id.toString()));
    favoriteRepository.deleteByContentId(id);
    contentRepository.delete(content);
    log.info("Admin deleted mindset content: id={}", id);
  }

  @Transactional
  public BulkUploadResultResponse bulkCreateContent(BulkCreateMindsetContentRequest request) {
    int created = 0;
    int failed = 0;
    List<String> errors = new ArrayList<>();

    for (int i = 0; i < request.quotes().size(); i++) {
      CreateMindsetContentRequest quote = request.quotes().get(i);
      try {
        createContent(quote);
        created++;
      } catch (Exception e) {
        failed++;
        errors.add("Row " + (i + 1) + ": " + e.getMessage());
        log.warn("Bulk upload row {} failed: {}", i + 1, e.getMessage());
      }
    }

    log.info("Bulk upload completed: created={}, failed={}", created, failed);
    return new BulkUploadResultResponse(created, failed, errors);
  }

  // ── Theme CRUD ──────────────────────────────────────────────────────────

  public List<AdminMindsetThemeResponse> getAllThemes() {
    return themeRepository.findAll().stream().map(this::toAdminThemeResponse).toList();
  }

  @Transactional
  @CacheEvict(value = "mindsetThemes", allEntries = true)
  public AdminMindsetThemeResponse createTheme(CreateMindsetThemeRequest request) {
    if (themeRepository.findByName(request.name()).isPresent()) {
      throw new BadRequestException("Theme with name '" + request.name() + "' already exists");
    }

    MindsetTheme theme =
        MindsetTheme.builder()
            .name(request.name())
            .backgroundColor(request.backgroundColor())
            .textColor(request.textColor())
            .accentColor(request.accentColor())
            .gradientColors(
                request.gradientColors() != null ? request.gradientColors() : new ArrayList<>())
            .defaultAsset(request.defaultAsset())
            .build();

    MindsetTheme saved = themeRepository.save(theme);
    log.info("Admin created mindset theme: id={}, name={}", saved.getId(), saved.getName());
    return toAdminThemeResponse(saved);
  }

  @Transactional
  @CacheEvict(value = "mindsetThemes", allEntries = true)
  public AdminMindsetThemeResponse updateTheme(UUID id, UpdateMindsetThemeRequest request) {
    MindsetTheme theme =
        themeRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("MindsetTheme", id.toString()));

    if (request.name() != null) theme.setName(request.name());
    if (request.backgroundColor() != null) theme.setBackgroundColor(request.backgroundColor());
    if (request.textColor() != null) theme.setTextColor(request.textColor());
    if (request.accentColor() != null) theme.setAccentColor(request.accentColor());
    if (request.gradientColors() != null) theme.setGradientColors(request.gradientColors());
    if (request.defaultAsset() != null) theme.setDefaultAsset(request.defaultAsset());

    MindsetTheme saved = themeRepository.save(theme);
    log.info("Admin updated mindset theme: id={}", saved.getId());
    return toAdminThemeResponse(saved);
  }

  @Transactional
  @CacheEvict(value = "mindsetThemes", allEntries = true)
  public void deleteTheme(UUID id) {
    MindsetTheme theme =
        themeRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("MindsetTheme", id.toString()));
    themeRepository.delete(theme);
    log.info("Admin deleted mindset theme: id={}", id);
  }

  // ── Stats ───────────────────────────────────────────────────────────────

  public AdminMindsetStatsResponse getStats() {
    long totalQuotes = contentRepository.count();
    long totalFavorites = favoriteRepository.count();

    Map<String, Long> quotesByDimension =
        lifeWheelAreaRepository.findAll().stream()
            .collect(
                Collectors.toMap(
                    LifeWheelArea::getId,
                    area -> contentRepository.countByLifeWheelAreaId(area.getId())));

    Map<String, Long> quotesByTone =
        Arrays.stream(EmotionalTone.values())
            .collect(
                Collectors.toMap(
                    EmotionalTone::name, tone -> contentRepository.countByEmotionalTone(tone)));

    // Top 10 most favorited
    List<AdminMindsetContentResponse> topFavorited =
        contentRepository.findAllOrderByInterventionWeight().stream()
            .map(this::toAdminResponse)
            .sorted(Comparator.comparingLong(AdminMindsetContentResponse::favoriteCount).reversed())
            .limit(10)
            .toList();

    return new AdminMindsetStatsResponse(
        totalQuotes, totalFavorites, quotesByDimension, quotesByTone, topFavorited);
  }

  // ── Private Helpers ─────────────────────────────────────────────────────

  private LifeWheelArea resolveLifeWheelArea(String lifeWheelAreaId) {
    return lifeWheelAreaRepository
        .findById(lifeWheelAreaId)
        .orElseThrow(() -> new ResourceNotFoundException("LifeWheelArea", lifeWheelAreaId));
  }

  private AdminMindsetContentResponse toAdminResponse(MindsetContent content) {
    long favCount = favoriteRepository.countByContentId(content.getId());
    return new AdminMindsetContentResponse(
        content.getId().toString(),
        content.getBody(),
        content.getAuthor(),
        content.getDimensionTag(),
        content.getSecondaryTags() != null
            ? new ArrayList<>(content.getSecondaryTags())
            : List.of(),
        content.getThemePreset(),
        content.getInterventionWeight(),
        content.getEmotionalTone(),
        content.getBackgroundImageUrl(),
        content.getLifeWheelArea() != null ? content.getLifeWheelArea().getId() : null,
        content.getLifeWheelArea() != null ? content.getLifeWheelArea().getName() : null,
        content.getLifeWheelArea() != null ? content.getLifeWheelArea().getColor() : null,
        favCount,
        content.getCreatedAt(),
        content.getUpdatedAt());
  }

  private AdminMindsetThemeResponse toAdminThemeResponse(MindsetTheme theme) {
    return new AdminMindsetThemeResponse(
        theme.getId().toString(),
        theme.getName(),
        theme.getBackgroundColor(),
        theme.getTextColor(),
        theme.getAccentColor(),
        theme.getGradientColors() != null ? new ArrayList<>(theme.getGradientColors()) : List.of(),
        theme.getDefaultAsset(),
        theme.getCreatedAt(),
        theme.getUpdatedAt());
  }
}
