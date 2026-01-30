package app.kaiz.tasks.application;

import app.kaiz.identity.domain.User;
import app.kaiz.identity.infrastructure.UserRepository;
import app.kaiz.life_wheel.infrastructure.EisenhowerQuadrantRepository;
import app.kaiz.life_wheel.infrastructure.LifeWheelAreaRepository;
import app.kaiz.shared.exception.ResourceNotFoundException;
import app.kaiz.tasks.application.dto.TaskTemplateDto;
import app.kaiz.tasks.application.dto.TaskTemplateDto.*;
import app.kaiz.tasks.domain.*;
import app.kaiz.tasks.infrastructure.TaskTemplateRepository;
import app.kaiz.tasks.infrastructure.TemplateFavoriteRepository;
import app.kaiz.tasks.infrastructure.TemplateRatingRepository;
import app.kaiz.tasks.infrastructure.UserTemplateTagRepository;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TaskTemplateService {

  private final TaskTemplateRepository taskTemplateRepository;
  private final TemplateFavoriteRepository templateFavoriteRepository;
  private final TemplateRatingRepository templateRatingRepository;
  private final UserTemplateTagRepository userTemplateTagRepository;
  private final UserRepository userRepository;
  private final LifeWheelAreaRepository lifeWheelAreaRepository;
  private final EisenhowerQuadrantRepository eisenhowerQuadrantRepository;
  private final SdlcMapper sdlcMapper;

  // ============ User Template Operations ============

  public List<TaskTemplateDto> getTemplatesByUserId(UUID userId) {
    List<TaskTemplate> templates = taskTemplateRepository.findByUserIdOrderByNameAsc(userId);
    return enrichTemplatesWithUserData(templates, userId);
  }

  public TaskTemplateDto getTemplateById(UUID userId, UUID templateId) {
    TaskTemplate template =
        taskTemplateRepository
            .findById(templateId)
            .orElseThrow(
                () -> new ResourceNotFoundException("TaskTemplate", templateId.toString()));

    // Check access: user can access their own templates or global templates
    if (template.getCreatorType() == CreatorType.USER
        && (template.getUser() == null || !template.getUser().getId().equals(userId))) {
      throw new ResourceNotFoundException("TaskTemplate", templateId.toString());
    }

    return enrichTemplateWithUserData(template, userId);
  }

  @Transactional
  public TaskTemplateDto createTemplate(UUID userId, CreateTaskTemplateRequest request) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

    TaskTemplate template =
        TaskTemplate.builder()
            .name(request.name())
            .description(request.description())
            .user(user)
            .creatorType(CreatorType.USER)
            .type(parseTemplateType(request.type()))
            .defaultStoryPoints(
                request.defaultStoryPoints() != null ? request.defaultStoryPoints() : 3)
            .icon(request.icon() != null ? request.icon() : "📋")
            .color(request.color() != null ? request.color() : "#3B82F6")
            .tags(request.tags() != null ? new ArrayList<>(request.tags()) : new ArrayList<>())
            .suggestedSprint(parseSuggestedSprint(request.suggestedSprint()))
            .build();

    // Set life wheel area
    if (request.defaultLifeWheelAreaId() != null) {
      lifeWheelAreaRepository
          .findById(request.defaultLifeWheelAreaId())
          .ifPresent(template::setDefaultLifeWheelArea);
    }

    // Set eisenhower quadrant
    if (request.defaultEisenhowerQuadrantId() != null) {
      eisenhowerQuadrantRepository
          .findById(request.defaultEisenhowerQuadrantId())
          .ifPresent(template::setDefaultEisenhowerQuadrant);
    }

    // Set event-specific fields
    if (template.getType() == TemplateType.EVENT) {
      template.setDefaultDuration(request.defaultDuration());
      template.setDefaultLocation(request.defaultLocation());
      template.setAllDay(request.isAllDay() != null && request.isAllDay());
      if (request.defaultAttendees() != null) {
        template.setDefaultAttendees(request.defaultAttendees().toArray(new String[0]));
      }
    }

    // Set recurrence
    if (request.isRecurring() != null && request.isRecurring()) {
      template.setRecurring(true);
      if (request.recurrencePattern() != null) {
        template.setRecurrenceFrequency(
            parseRecurrenceFrequency(request.recurrencePattern().frequency()));
        template.setRecurrenceInterval(request.recurrencePattern().interval());
        template.setRecurrenceEndDate(request.recurrencePattern().endDate());
      }
    }

    TaskTemplate saved = taskTemplateRepository.save(template);
    return enrichTemplateWithUserData(saved, userId);
  }

  @Transactional
  public TaskTemplateDto updateTemplate(
      UUID userId, UUID templateId, UpdateTaskTemplateRequest request) {
    TaskTemplate template =
        taskTemplateRepository
            .findByIdAndUserId(templateId, userId)
            .orElseThrow(
                () -> new ResourceNotFoundException("TaskTemplate", templateId.toString()));

    if (request.name() != null) template.setName(request.name());
    if (request.description() != null) template.setDescription(request.description());
    if (request.type() != null) template.setType(parseTemplateType(request.type()));
    if (request.defaultStoryPoints() != null)
      template.setDefaultStoryPoints(request.defaultStoryPoints());
    if (request.icon() != null) template.setIcon(request.icon());
    if (request.color() != null) template.setColor(request.color());
    if (request.tags() != null) template.setTags(request.tags());
    if (request.suggestedSprint() != null)
      template.setSuggestedSprint(parseSuggestedSprint(request.suggestedSprint()));

    if (request.defaultLifeWheelAreaId() != null) {
      lifeWheelAreaRepository
          .findById(request.defaultLifeWheelAreaId())
          .ifPresent(template::setDefaultLifeWheelArea);
    }
    if (request.defaultEisenhowerQuadrantId() != null) {
      eisenhowerQuadrantRepository
          .findById(request.defaultEisenhowerQuadrantId())
          .ifPresent(template::setDefaultEisenhowerQuadrant);
    }

    // Event fields
    if (request.defaultDuration() != null) template.setDefaultDuration(request.defaultDuration());
    if (request.defaultLocation() != null) template.setDefaultLocation(request.defaultLocation());
    if (request.isAllDay() != null) template.setAllDay(request.isAllDay());
    if (request.defaultAttendees() != null) {
      template.setDefaultAttendees(request.defaultAttendees().toArray(new String[0]));
    }

    // Recurrence
    if (request.isRecurring() != null) {
      template.setRecurring(request.isRecurring());
      if (request.isRecurring() && request.recurrencePattern() != null) {
        template.setRecurrenceFrequency(
            parseRecurrenceFrequency(request.recurrencePattern().frequency()));
        template.setRecurrenceInterval(request.recurrencePattern().interval());
        template.setRecurrenceEndDate(request.recurrencePattern().endDate());
      }
    }

    return enrichTemplateWithUserData(taskTemplateRepository.save(template), userId);
  }

  @Transactional
  public void deleteTemplate(UUID userId, UUID templateId) {
    TaskTemplate template =
        taskTemplateRepository
            .findByIdAndUserId(templateId, userId)
            .orElseThrow(
                () -> new ResourceNotFoundException("TaskTemplate", templateId.toString()));
    taskTemplateRepository.delete(template);
  }

  // ============ Global Templates ============

  public List<TaskTemplateDto> getGlobalTemplates(UUID userId) {
    List<TaskTemplate> templates =
        taskTemplateRepository.findByCreatorTypeOrderByRatingDesc(CreatorType.SYSTEM);
    return enrichTemplatesWithUserData(templates, userId);
  }

  public List<TaskTemplateDto> getGlobalTemplatesByLifeWheelArea(UUID userId, String areaId) {
    List<TaskTemplate> templates = taskTemplateRepository.findGlobalByLifeWheelArea(areaId);
    return enrichTemplatesWithUserData(templates, userId);
  }

  public List<TaskTemplateDto> getAllAvailableTemplates(UUID userId) {
    List<TaskTemplate> templates = taskTemplateRepository.findAllAvailableForUser(userId);
    return enrichTemplatesWithUserData(templates, userId);
  }

  public List<TaskTemplateDto> searchTemplates(UUID userId, String search) {
    List<TaskTemplate> templates = taskTemplateRepository.searchTemplates(userId, search);
    return enrichTemplatesWithUserData(templates, userId);
  }

  // ============ Favorites ============

  public List<TaskTemplateDto> getFavoriteTemplates(UUID userId) {
    List<TemplateFavorite> favorites =
        templateFavoriteRepository.findByUserIdOrderByCreatedAtDesc(userId);
    List<TaskTemplate> templates =
        favorites.stream().map(TemplateFavorite::getTemplate).collect(Collectors.toList());
    return enrichTemplatesWithUserData(templates, userId);
  }

  @Transactional
  public boolean toggleFavorite(UUID userId, UUID templateId) {
    TaskTemplate template =
        taskTemplateRepository
            .findById(templateId)
            .orElseThrow(
                () -> new ResourceNotFoundException("TaskTemplate", templateId.toString()));
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

    Optional<TemplateFavorite> existing =
        templateFavoriteRepository.findByUserIdAndTemplateId(userId, templateId);

    if (existing.isPresent()) {
      templateFavoriteRepository.delete(existing.get());
      return false; // Unfavorited
    } else {
      TemplateFavorite favorite = TemplateFavorite.builder().user(user).template(template).build();
      templateFavoriteRepository.save(favorite);
      return true; // Favorited
    }
  }

  // ============ Rating ============

  @Transactional
  public RatingResponse rateTemplate(UUID userId, UUID templateId, int rating) {
    if (rating < 1 || rating > 5) {
      throw new IllegalArgumentException("Rating must be between 1 and 5");
    }

    TaskTemplate template =
        taskTemplateRepository
            .findById(templateId)
            .orElseThrow(
                () -> new ResourceNotFoundException("TaskTemplate", templateId.toString()));
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

    Optional<TemplateRating> existing =
        templateRatingRepository.findByUserIdAndTemplateId(userId, templateId);

    if (existing.isPresent()) {
      existing.get().setRating(rating);
      templateRatingRepository.save(existing.get());
    } else {
      TemplateRating newRating =
          TemplateRating.builder().user(user).template(template).rating(rating).build();
      templateRatingRepository.save(newRating);
    }

    // Recalculate average (trigger will handle this in DB, but we return fresh data)
    Double avgRating = templateRatingRepository.getAverageRating(templateId);
    long ratingCount = templateRatingRepository.countByTemplateId(templateId);

    return new RatingResponse(
        templateId,
        avgRating != null ? BigDecimal.valueOf(avgRating) : BigDecimal.ZERO,
        (int) ratingCount,
        rating);
  }

  // ============ Clone ============

  @Transactional
  public TaskTemplateDto cloneTemplate(UUID userId, UUID templateId) {
    TaskTemplate source =
        taskTemplateRepository
            .findById(templateId)
            .orElseThrow(
                () -> new ResourceNotFoundException("TaskTemplate", templateId.toString()));
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

    TaskTemplate clone =
        TaskTemplate.builder()
            .name(source.getName() + " (Copy)")
            .description(source.getDescription())
            .user(user)
            .creatorType(CreatorType.USER)
            .type(source.getType())
            .defaultStoryPoints(source.getDefaultStoryPoints())
            .defaultLifeWheelArea(source.getDefaultLifeWheelArea())
            .defaultEisenhowerQuadrant(source.getDefaultEisenhowerQuadrant())
            .defaultDuration(source.getDefaultDuration())
            .defaultLocation(source.getDefaultLocation())
            .isAllDay(source.isAllDay())
            .defaultAttendees(
                source.getDefaultAttendees() != null ? source.getDefaultAttendees().clone() : null)
            .isRecurring(source.isRecurring())
            .recurrenceFrequency(source.getRecurrenceFrequency())
            .recurrenceInterval(source.getRecurrenceInterval())
            .recurrenceEndDate(source.getRecurrenceEndDate())
            .suggestedSprint(source.getSuggestedSprint())
            .icon(source.getIcon())
            .color(source.getColor())
            .tags(new ArrayList<>(source.getTags()))
            .rating(BigDecimal.ZERO)
            .ratingCount(0)
            .usageCount(0)
            .build();

    TaskTemplate saved = taskTemplateRepository.save(clone);
    return enrichTemplateWithUserData(saved, userId);
  }

  // ============ Use Template (increment usage) ============

  @Transactional
  public void incrementUsage(UUID templateId) {
    taskTemplateRepository.incrementUsageCount(templateId);
  }

  // ============ User Template Tags ============

  @Transactional
  public List<String> addTag(UUID userId, UUID templateId, String tag) {
    // Verify template exists
    TaskTemplate template =
        taskTemplateRepository
            .findById(templateId)
            .orElseThrow(
                () -> new ResourceNotFoundException("TaskTemplate", templateId.toString()));

    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

    String normalizedTag = tag.trim().toLowerCase();

    // Check if tag already exists for this user and template
    if (!userTemplateTagRepository.existsByUserIdAndTemplateIdAndTag(
        userId, templateId, normalizedTag)) {
      UserTemplateTag userTag =
          UserTemplateTag.builder().user(user).template(template).tag(normalizedTag).build();
      userTemplateTagRepository.save(userTag);
    }

    // Return all user tags for this template
    return userTemplateTagRepository.findTagsByUserIdAndTemplateId(userId, templateId);
  }

  @Transactional
  public List<String> removeTag(UUID userId, UUID templateId, String tag) {
    // Verify template exists
    taskTemplateRepository
        .findById(templateId)
        .orElseThrow(() -> new ResourceNotFoundException("TaskTemplate", templateId.toString()));

    String normalizedTag = tag.trim().toLowerCase();

    // Delete the tag if it exists
    userTemplateTagRepository
        .findByUserIdAndTemplateIdAndTag(userId, templateId, normalizedTag)
        .ifPresent(userTemplateTagRepository::delete);

    // Return remaining user tags for this template
    return userTemplateTagRepository.findTagsByUserIdAndTemplateId(userId, templateId);
  }

  // ============ Admin Operations ============

  public List<TaskTemplateDto> getAllSystemTemplates() {
    return sdlcMapper.toTaskTemplateDtoList(
        taskTemplateRepository.findByCreatorType(CreatorType.SYSTEM));
  }

  @Transactional
  public TaskTemplateDto createSystemTemplate(CreateTaskTemplateRequest request) {
    TaskTemplate template =
        TaskTemplate.builder()
            .name(request.name())
            .description(request.description())
            .user(null) // System templates have no user
            .creatorType(CreatorType.SYSTEM)
            .type(parseTemplateType(request.type()))
            .defaultStoryPoints(
                request.defaultStoryPoints() != null ? request.defaultStoryPoints() : 3)
            .icon(request.icon() != null ? request.icon() : "📋")
            .color(request.color() != null ? request.color() : "#3B82F6")
            .tags(request.tags() != null ? new ArrayList<>(request.tags()) : new ArrayList<>())
            .suggestedSprint(parseSuggestedSprint(request.suggestedSprint()))
            .build();

    if (request.defaultLifeWheelAreaId() != null) {
      lifeWheelAreaRepository
          .findById(request.defaultLifeWheelAreaId())
          .ifPresent(template::setDefaultLifeWheelArea);
    }
    if (request.defaultEisenhowerQuadrantId() != null) {
      eisenhowerQuadrantRepository
          .findById(request.defaultEisenhowerQuadrantId())
          .ifPresent(template::setDefaultEisenhowerQuadrant);
    }

    // Event fields
    if (template.getType() == TemplateType.EVENT) {
      template.setDefaultDuration(request.defaultDuration());
      template.setDefaultLocation(request.defaultLocation());
      template.setAllDay(request.isAllDay() != null && request.isAllDay());
      if (request.defaultAttendees() != null) {
        template.setDefaultAttendees(request.defaultAttendees().toArray(new String[0]));
      }
    }

    // Recurrence
    if (request.isRecurring() != null && request.isRecurring()) {
      template.setRecurring(true);
      if (request.recurrencePattern() != null) {
        template.setRecurrenceFrequency(
            parseRecurrenceFrequency(request.recurrencePattern().frequency()));
        template.setRecurrenceInterval(request.recurrencePattern().interval());
        template.setRecurrenceEndDate(request.recurrencePattern().endDate());
      }
    }

    return sdlcMapper.toTaskTemplateDto(taskTemplateRepository.save(template));
  }

  @Transactional
  public TaskTemplateDto updateSystemTemplate(UUID templateId, UpdateTaskTemplateRequest request) {
    TaskTemplate template =
        taskTemplateRepository
            .findById(templateId)
            .filter(t -> t.getCreatorType() == CreatorType.SYSTEM)
            .orElseThrow(
                () -> new ResourceNotFoundException("SystemTemplate", templateId.toString()));

    // Apply updates (same as user templates)
    if (request.name() != null) template.setName(request.name());
    if (request.description() != null) template.setDescription(request.description());
    if (request.type() != null) template.setType(parseTemplateType(request.type()));
    if (request.defaultStoryPoints() != null)
      template.setDefaultStoryPoints(request.defaultStoryPoints());
    if (request.icon() != null) template.setIcon(request.icon());
    if (request.color() != null) template.setColor(request.color());
    if (request.tags() != null) template.setTags(request.tags());
    if (request.suggestedSprint() != null)
      template.setSuggestedSprint(parseSuggestedSprint(request.suggestedSprint()));

    if (request.defaultLifeWheelAreaId() != null) {
      lifeWheelAreaRepository
          .findById(request.defaultLifeWheelAreaId())
          .ifPresent(template::setDefaultLifeWheelArea);
    }
    if (request.defaultEisenhowerQuadrantId() != null) {
      eisenhowerQuadrantRepository
          .findById(request.defaultEisenhowerQuadrantId())
          .ifPresent(template::setDefaultEisenhowerQuadrant);
    }

    if (request.defaultDuration() != null) template.setDefaultDuration(request.defaultDuration());
    if (request.defaultLocation() != null) template.setDefaultLocation(request.defaultLocation());
    if (request.isAllDay() != null) template.setAllDay(request.isAllDay());
    if (request.defaultAttendees() != null) {
      template.setDefaultAttendees(request.defaultAttendees().toArray(new String[0]));
    }

    if (request.isRecurring() != null) {
      template.setRecurring(request.isRecurring());
      if (request.isRecurring() && request.recurrencePattern() != null) {
        template.setRecurrenceFrequency(
            parseRecurrenceFrequency(request.recurrencePattern().frequency()));
        template.setRecurrenceInterval(request.recurrencePattern().interval());
        template.setRecurrenceEndDate(request.recurrencePattern().endDate());
      }
    }

    return sdlcMapper.toTaskTemplateDto(taskTemplateRepository.save(template));
  }

  @Transactional
  public void deleteSystemTemplate(UUID templateId) {
    TaskTemplate template =
        taskTemplateRepository
            .findById(templateId)
            .filter(t -> t.getCreatorType() == CreatorType.SYSTEM)
            .orElseThrow(
                () -> new ResourceNotFoundException("SystemTemplate", templateId.toString()));
    taskTemplateRepository.delete(template);
  }

  // ============ Helper Methods ============

  private List<TaskTemplateDto> enrichTemplatesWithUserData(
      List<TaskTemplate> templates, UUID userId) {
    Set<UUID> favoriteIds =
        new HashSet<>(templateFavoriteRepository.findTemplateIdsByUserId(userId));
    Map<UUID, Integer> userRatings = new HashMap<>();
    Map<UUID, List<String>> userTagsMap = new HashMap<>();

    for (TaskTemplate t : templates) {
      templateRatingRepository
          .findByUserIdAndTemplateId(userId, t.getId())
          .ifPresent(r -> userRatings.put(t.getId(), r.getRating()));
      userTagsMap.put(
          t.getId(), userTemplateTagRepository.findTagsByUserIdAndTemplateId(userId, t.getId()));
    }

    return templates.stream()
        .map(
            t ->
                enrichDto(
                    sdlcMapper.toTaskTemplateDto(t),
                    favoriteIds.contains(t.getId()),
                    userRatings.get(t.getId()),
                    userTagsMap.getOrDefault(t.getId(), new ArrayList<>())))
        .collect(Collectors.toList());
  }

  private TaskTemplateDto enrichTemplateWithUserData(TaskTemplate template, UUID userId) {
    boolean isFavorite =
        templateFavoriteRepository.existsByUserIdAndTemplateId(userId, template.getId());
    Integer userRating =
        templateRatingRepository
            .findByUserIdAndTemplateId(userId, template.getId())
            .map(TemplateRating::getRating)
            .orElse(null);
    List<String> userTags =
        userTemplateTagRepository.findTagsByUserIdAndTemplateId(userId, template.getId());

    return enrichDto(sdlcMapper.toTaskTemplateDto(template), isFavorite, userRating, userTags);
  }

  private TaskTemplateDto enrichDto(
      TaskTemplateDto dto, boolean isFavorite, Integer userRating, List<String> userTags) {
    return new TaskTemplateDto(
        dto.id(),
        dto.name(),
        dto.description(),
        dto.type(),
        dto.creatorType(),
        dto.userId(),
        dto.defaultStoryPoints(),
        dto.defaultLifeWheelAreaId(),
        dto.defaultEisenhowerQuadrantId(),
        dto.defaultDuration(),
        dto.defaultLocation(),
        dto.isAllDay(),
        dto.defaultAttendees(),
        dto.isRecurring(),
        dto.recurrencePattern(),
        dto.suggestedSprint(),
        dto.rating(),
        dto.ratingCount(),
        dto.usageCount(),
        dto.icon(),
        dto.color(),
        dto.tags(),
        isFavorite,
        userRating,
        userTags,
        dto.createdAt(),
        dto.updatedAt());
  }

  private TemplateType parseTemplateType(String type) {
    if (type == null) return TemplateType.TASK;
    try {
      return TemplateType.valueOf(type.toUpperCase());
    } catch (IllegalArgumentException e) {
      return TemplateType.TASK;
    }
  }

  private SuggestedSprint parseSuggestedSprint(String sprint) {
    if (sprint == null) return SuggestedSprint.BACKLOG;
    try {
      return SuggestedSprint.valueOf(sprint.toUpperCase());
    } catch (IllegalArgumentException e) {
      return SuggestedSprint.BACKLOG;
    }
  }

  private RecurrenceFrequency parseRecurrenceFrequency(String frequency) {
    if (frequency == null) return null;
    try {
      return RecurrenceFrequency.valueOf(frequency.toUpperCase());
    } catch (IllegalArgumentException e) {
      return null;
    }
  }
}
