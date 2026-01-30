package app.kaiz.tasks.application;

import app.kaiz.identity.domain.User;
import app.kaiz.identity.domain.User.AccountType;
import app.kaiz.identity.domain.User.SubscriptionTier;
import app.kaiz.identity.infrastructure.UserRepository;
import app.kaiz.life_wheel.domain.EisenhowerQuadrant;
import app.kaiz.life_wheel.domain.LifeWheelArea;
import app.kaiz.life_wheel.infrastructure.EisenhowerQuadrantRepository;
import app.kaiz.life_wheel.infrastructure.LifeWheelAreaRepository;
import app.kaiz.shared.exception.ResourceNotFoundException;
import app.kaiz.tasks.application.dto.OnboardingDto.*;
import app.kaiz.tasks.domain.*;
import app.kaiz.tasks.infrastructure.*;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for handling onboarding flow - creates initial tasks, epics, and events based on user
 * selections during onboarding
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OnboardingService {

  private final TaskRepository taskRepository;
  private final EpicRepository epicRepository;
  private final SprintRepository sprintRepository;
  private final UserRepository userRepository;
  private final LifeWheelAreaRepository lifeWheelAreaRepository;
  private final EisenhowerQuadrantRepository eisenhowerQuadrantRepository;

  // Static task templates - these match the mobile app's onboarding store
  private static final List<TaskTemplateCategoryDto> TASK_TEMPLATE_CATEGORIES =
      initializeTaskTemplates();
  private static final List<EpicTemplateDto> EPIC_TEMPLATES = initializeEpicTemplates();

  /** Complete onboarding by creating tasks, epics, and events */
  public OnboardingResponse completeOnboarding(UUID userId, OnboardingRequest request) {
    log.info("Starting onboarding for user: {}", userId);

    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

    // Update user profile with onboarding data
    updateUserProfile(user, request);

    // Get current and next sprint
    String currentSprintId = getCurrentSprintId();
    String nextSprintId = getNextSprintId();

    // Create tasks from selected templates
    List<CreatedTask> createdTasks =
        createTasksFromTemplates(
            user, request.selectedTaskTemplateIds(), currentSprintId, nextSprintId);

    // Create epics from selected templates
    List<CreatedEpic> createdEpics =
        createEpicsFromTemplates(user, request.selectedEpicTemplateIds(), currentSprintId);

    // Create events from important dates (as tasks with reminders)
    List<CreatedEvent> createdEvents = createEventsFromDates(user, request.importantDates());

    // Calculate estimated weekly points
    int estimatedPoints = calculateWeeklyPoints(createdTasks);

    OnboardingSummary summary =
        new OnboardingSummary(createdTasks, createdEpics, createdEvents, estimatedPoints);

    log.info(
        "Onboarding completed for user {}: {} tasks, {} epics, {} events",
        userId,
        createdTasks.size(),
        createdEpics.size(),
        createdEvents.size());

    return new OnboardingResponse(
        createdTasks.size(),
        createdEpics.size(),
        createdEvents.size(),
        String.format(
            "Welcome to Kaiz, %s! Your personalized setup is ready.", request.firstName()),
        summary);
  }

  /** Get task templates for onboarding UI */
  public TaskTemplatesResponse getTaskTemplates() {
    return new TaskTemplatesResponse(TASK_TEMPLATE_CATEGORIES);
  }

  /** Get epic templates for onboarding UI */
  public EpicTemplatesResponse getEpicTemplates() {
    return new EpicTemplatesResponse(EPIC_TEMPLATES);
  }

  /** Validate corporate code */
  public CorporateCodeValidation validateCorporateCode(String code) {
    // TODO: Implement actual corporate code validation with database
    // For now, accept some test codes
    Map<String, String> validCodes =
        Map.of(
            "KAIZ2024", "Kaiz Inc.",
            "DEMO", "Demo Company",
            "TESTCORP", "Test Corporation");

    String companyName = validCodes.get(code.toUpperCase());
    if (companyName != null) {
      return new CorporateCodeValidation(true, companyName, "Code validated successfully");
    }
    return new CorporateCodeValidation(false, null, "Invalid corporate code");
  }

  // ========== Private Helper Methods ==========

  private void updateUserProfile(User user, OnboardingRequest request) {
    // Update user's name if changed
    String fullName =
        request.firstName() + (request.lastName() != null ? " " + request.lastName() : "");
    user.setFullName(fullName);

    // Update account type based on plan
    switch (request.planType()) {
      case CORPORATE:
        user.setAccountType(AccountType.CORPORATE);
        user.setSubscriptionTier(SubscriptionTier.CORPORATE);
        break;
      case FAMILY:
        user.setAccountType(AccountType.FAMILY_ADULT);
        user.setSubscriptionTier(SubscriptionTier.FAMILY);
        break;
      default:
        user.setAccountType(AccountType.INDIVIDUAL);
        break;
    }

    userRepository.save(user);
  }

  private String getCurrentSprintId() {
    LocalDate today = LocalDate.now();
    int week = today.getDayOfYear() / 7 + 1;
    int year = today.getYear();
    return String.format("S%02d-%s-%d", week, today.getMonth().toString().substring(0, 3), year);
  }

  private String getNextSprintId() {
    LocalDate nextWeek = LocalDate.now().plusWeeks(1);
    int week = nextWeek.getDayOfYear() / 7 + 1;
    int year = nextWeek.getYear();
    return String.format("S%02d-%s-%d", week, nextWeek.getMonth().toString().substring(0, 3), year);
  }

  private List<CreatedTask> createTasksFromTemplates(
      User user, List<String> templateIds, String currentSprintId, String nextSprintId) {

    List<CreatedTask> created = new ArrayList<>();

    // Get all templates
    Map<String, TaskTemplateDto> templateMap =
        TASK_TEMPLATE_CATEGORIES.stream()
            .flatMap(cat -> cat.templates().stream())
            .collect(Collectors.toMap(TaskTemplateDto::id, t -> t));

    // Get required entities
    Map<String, LifeWheelArea> lifeWheelAreas =
        lifeWheelAreaRepository.findAll().stream()
            .collect(Collectors.toMap(LifeWheelArea::getId, a -> a));

    Map<String, EisenhowerQuadrant> quadrants =
        eisenhowerQuadrantRepository.findAll().stream()
            .collect(Collectors.toMap(EisenhowerQuadrant::getId, q -> q));

    for (String templateId : templateIds) {
      TaskTemplateDto template = templateMap.get(templateId);
      if (template == null) continue;

      // Determine sprint
      String sprintId =
          switch (template.suggestedSprint()) {
            case "current" -> currentSprintId;
            case "next" -> nextSprintId;
            default -> null; // backlog
          };

      // Get life wheel area (with fallback)
      LifeWheelArea area = lifeWheelAreas.get(template.lifeWheelAreaId());
      if (area == null) {
        area = lifeWheelAreas.values().iterator().next(); // fallback to first
      }

      // Get quadrant (with fallback)
      EisenhowerQuadrant quadrant = quadrants.get(template.eisenhowerQuadrant());
      if (quadrant == null) {
        quadrant = quadrants.get("q2"); // default to Q2 (important, not urgent)
      }

      Task task =
          Task.builder()
              .title(template.title())
              .description(template.description())
              .user(user)
              .lifeWheelArea(area)
              .eisenhowerQuadrant(quadrant)
              .storyPoints(template.storyPoints())
              .isDraft(false)
              .status(TaskStatus.TODO)
              .build();

      // Set sprint if assigned
      if (sprintId != null) {
        sprintRepository.findById(sprintId).ifPresent(task::setSprint);
      }

      // TODO: Handle recurring tasks - for now just create single instance
      // In future, create RecurringTask entity and TaskRecurrence

      Task saved = taskRepository.save(task);
      created.add(
          new CreatedTask(
              saved.getId().toString(),
              saved.getTitle(),
              saved.getStoryPoints(),
              sprintId,
              template.isRecurring()));
    }

    return created;
  }

  private List<CreatedEpic> createEpicsFromTemplates(
      User user, List<String> epicIds, String currentSprintId) {

    if (epicIds == null || epicIds.isEmpty()) {
      return Collections.emptyList();
    }

    List<CreatedEpic> created = new ArrayList<>();

    Map<String, EpicTemplateDto> epicMap =
        EPIC_TEMPLATES.stream().collect(Collectors.toMap(EpicTemplateDto::id, e -> e));

    Map<String, LifeWheelArea> lifeWheelAreas =
        lifeWheelAreaRepository.findAll().stream()
            .collect(Collectors.toMap(LifeWheelArea::getId, a -> a));

    for (String epicId : epicIds) {
      EpicTemplateDto template = epicMap.get(epicId);
      if (template == null) continue;

      LifeWheelArea area = lifeWheelAreas.get(template.lifeWheelAreaId());
      if (area == null) {
        area = lifeWheelAreas.values().iterator().next();
      }

      Epic epic =
          Epic.builder()
              .title(template.title())
              .description(template.description())
              .user(user)
              .lifeWheelArea(area)
              .icon(template.icon())
              .color(template.color())
              .status(EpicStatus.PLANNING)
              .totalPoints(0)
              .completedPoints(0)
              .build();

      // Set target sprint
      sprintRepository.findById(currentSprintId).ifPresent(epic::setTargetSprint);

      Epic saved = epicRepository.save(epic);
      created.add(
          new CreatedEpic(
              saved.getId().toString(),
              saved.getTitle(),
              saved.getIcon(),
              template.taskTemplateIds().size()));
    }

    return created;
  }

  private List<CreatedEvent> createEventsFromDates(User user, List<ImportantDateRequest> dates) {

    if (dates == null || dates.isEmpty()) {
      return Collections.emptyList();
    }

    List<CreatedEvent> created = new ArrayList<>();

    // Get relationships life wheel area for events
    LifeWheelArea relationshipsArea =
        lifeWheelAreaRepository
            .findById("life-relationships")
            .orElse(lifeWheelAreaRepository.findAll().get(0));

    EisenhowerQuadrant q2 =
        eisenhowerQuadrantRepository
            .findById("q2")
            .orElse(eisenhowerQuadrantRepository.findAll().get(0));

    for (ImportantDateRequest dateReq : dates) {
      // Create a recurring task for this event
      String title =
          switch (dateReq.dateType()) {
            case "birthday" -> "🎂 " + dateReq.personName() + "'s Birthday";
            case "anniversary" -> "💍 Anniversary with " + dateReq.personName();
            default -> "📅 " + dateReq.personName() + " - Special Day";
          };

      String description =
          String.format(
              "Annual reminder for %s (%s). Date: %s. Reminder set %d days before.",
              dateReq.personName(),
              dateReq.dateType(),
              dateReq.date(),
              dateReq.reminderDaysBefore() != null ? dateReq.reminderDaysBefore() : 7);

      Task task =
          Task.builder()
              .title(title)
              .description(description)
              .user(user)
              .lifeWheelArea(relationshipsArea)
              .eisenhowerQuadrant(q2)
              .storyPoints(1)
              .isDraft(false)
              .status(TaskStatus.TODO)
              .build();

      // TODO: Set up recurring yearly reminder
      // For now, just create the task

      Task saved = taskRepository.save(task);
      created.add(
          new CreatedEvent(
              saved.getId().toString(), dateReq.personName(), dateReq.dateType(), dateReq.date()));
    }

    return created;
  }

  private int calculateWeeklyPoints(List<CreatedTask> tasks) {
    // Simple estimate based on created tasks
    return tasks.stream().mapToInt(CreatedTask::storyPoints).sum();
  }

  // ========== Static Template Initialization ==========

  private static List<TaskTemplateCategoryDto> initializeTaskTemplates() {
    return List.of(
        new TaskTemplateCategoryDto(
            "health",
            "Health & Fitness",
            "💪",
            "#10B981",
            "Exercise, nutrition, sleep",
            List.of(
                new TaskTemplateDto(
                    "health-1",
                    "Morning workout routine",
                    "30 min exercise to start the day",
                    2,
                    "life-health",
                    "q2",
                    true,
                    new RecurrencePattern("daily", 1),
                    "current"),
                new TaskTemplateDto(
                    "health-2",
                    "Meal prep for the week",
                    "Prepare healthy meals in advance",
                    3,
                    "life-health",
                    "q2",
                    true,
                    new RecurrencePattern("weekly", 1),
                    "current"),
                new TaskTemplateDto(
                    "health-3",
                    "Schedule annual checkup",
                    "Book doctor appointment",
                    1,
                    "life-health",
                    "q2",
                    false,
                    null,
                    "next"),
                new TaskTemplateDto(
                    "health-4",
                    "Track daily water intake",
                    "Drink 8 glasses of water",
                    1,
                    "life-health",
                    "q2",
                    true,
                    new RecurrencePattern("daily", 1),
                    "current"),
                new TaskTemplateDto(
                    "health-5",
                    "Evening walk or stretch",
                    "15 min wind-down activity",
                    1,
                    "life-health",
                    "q2",
                    true,
                    new RecurrencePattern("daily", 1),
                    "current"))),
        new TaskTemplateCategoryDto(
            "career",
            "Career & Work",
            "💼",
            "#3B82F6",
            "Professional growth, skills",
            List.of(
                new TaskTemplateDto(
                    "career-1",
                    "Update resume/LinkedIn",
                    "Keep professional profile current",
                    3,
                    "life-career",
                    "q2",
                    false,
                    null,
                    "next"),
                new TaskTemplateDto(
                    "career-2",
                    "Learn a new skill",
                    "1 hour of professional development",
                    2,
                    "life-career",
                    "q2",
                    true,
                    new RecurrencePattern("weekly", 1),
                    "current"),
                new TaskTemplateDto(
                    "career-3",
                    "Network with a colleague",
                    "Build professional relationships",
                    2,
                    "life-career",
                    "q2",
                    true,
                    new RecurrencePattern("biweekly", 1),
                    "current"),
                new TaskTemplateDto(
                    "career-4",
                    "Review career goals",
                    "Quarterly career reflection",
                    2,
                    "life-career",
                    "q2",
                    true,
                    new RecurrencePattern("monthly", 3),
                    "backlog"))),
        new TaskTemplateCategoryDto(
            "finance",
            "Finance & Money",
            "💰",
            "#F59E0B",
            "Budget, savings, investments",
            List.of(
                new TaskTemplateDto(
                    "finance-1",
                    "Review weekly spending",
                    "Check expenses against budget",
                    1,
                    "life-finance",
                    "q2",
                    true,
                    new RecurrencePattern("weekly", 1),
                    "current"),
                new TaskTemplateDto(
                    "finance-2",
                    "Pay monthly bills",
                    "Ensure all bills are paid on time",
                    2,
                    "life-finance",
                    "q1",
                    true,
                    new RecurrencePattern("monthly", 1),
                    "current"),
                new TaskTemplateDto(
                    "finance-3",
                    "Review investment portfolio",
                    "Check investments performance",
                    2,
                    "life-finance",
                    "q2",
                    true,
                    new RecurrencePattern("monthly", 1),
                    "next"),
                new TaskTemplateDto(
                    "finance-4",
                    "Set savings goal",
                    "Define monthly savings target",
                    2,
                    "life-finance",
                    "q2",
                    false,
                    null,
                    "current"))),
        new TaskTemplateCategoryDto(
            "relationships",
            "Family & Relationships",
            "❤️",
            "#EF4444",
            "Quality time, connections",
            List.of(
                new TaskTemplateDto(
                    "relationships-1",
                    "Family dinner night",
                    "Weekly quality time with family",
                    2,
                    "life-relationships",
                    "q2",
                    true,
                    new RecurrencePattern("weekly", 1),
                    "current"),
                new TaskTemplateDto(
                    "relationships-2",
                    "Call a friend or relative",
                    "Stay connected with loved ones",
                    1,
                    "life-relationships",
                    "q2",
                    true,
                    new RecurrencePattern("weekly", 1),
                    "current"),
                new TaskTemplateDto(
                    "relationships-3",
                    "Date night",
                    "Quality time with partner",
                    3,
                    "life-relationships",
                    "q2",
                    true,
                    new RecurrencePattern("biweekly", 1),
                    "current"),
                new TaskTemplateDto(
                    "relationships-4",
                    "Send thank you message",
                    "Express gratitude to someone",
                    1,
                    "life-relationships",
                    "q2",
                    true,
                    new RecurrencePattern("weekly", 1),
                    "current"))),
        new TaskTemplateCategoryDto(
            "growth",
            "Personal Growth",
            "📚",
            "#8B5CF6",
            "Learning, mindfulness, hobbies",
            List.of(
                new TaskTemplateDto(
                    "growth-1",
                    "Read for 30 minutes",
                    "Daily reading habit",
                    1,
                    "life-growth",
                    "q2",
                    true,
                    new RecurrencePattern("daily", 1),
                    "current"),
                new TaskTemplateDto(
                    "growth-2",
                    "Morning meditation",
                    "10 min mindfulness practice",
                    1,
                    "life-growth",
                    "q2",
                    true,
                    new RecurrencePattern("daily", 1),
                    "current"),
                new TaskTemplateDto(
                    "growth-3",
                    "Journal reflection",
                    "Write about the day",
                    1,
                    "life-growth",
                    "q2",
                    true,
                    new RecurrencePattern("daily", 1),
                    "current"),
                new TaskTemplateDto(
                    "growth-4",
                    "Learn something new",
                    "Online course or tutorial",
                    2,
                    "life-growth",
                    "q2",
                    true,
                    new RecurrencePattern("weekly", 1),
                    "current"))),
        new TaskTemplateCategoryDto(
            "fun",
            "Fun & Recreation",
            "🎮",
            "#06B6D4",
            "Hobbies, entertainment, rest",
            List.of(
                new TaskTemplateDto(
                    "fun-1",
                    "Hobby time",
                    "Enjoy your favorite activity",
                    2,
                    "life-fun",
                    "q2",
                    true,
                    new RecurrencePattern("weekly", 1),
                    "current"),
                new TaskTemplateDto(
                    "fun-2",
                    "Plan a fun activity",
                    "Schedule something enjoyable",
                    1,
                    "life-fun",
                    "q2",
                    true,
                    new RecurrencePattern("weekly", 1),
                    "current"),
                new TaskTemplateDto(
                    "fun-3",
                    "Digital detox hour",
                    "Unplug from devices",
                    1,
                    "life-fun",
                    "q2",
                    true,
                    new RecurrencePattern("daily", 1),
                    "current"))),
        new TaskTemplateCategoryDto(
            "home",
            "Home & Environment",
            "🏡",
            "#84CC16",
            "Organization, cleaning, projects",
            List.of(
                new TaskTemplateDto(
                    "home-1",
                    "Weekly cleaning routine",
                    "Keep living space tidy",
                    2,
                    "life-environment",
                    "q2",
                    true,
                    new RecurrencePattern("weekly", 1),
                    "current"),
                new TaskTemplateDto(
                    "home-2",
                    "Declutter one area",
                    "Organize a drawer, closet, or room",
                    2,
                    "life-environment",
                    "q2",
                    true,
                    new RecurrencePattern("weekly", 1),
                    "current"),
                new TaskTemplateDto(
                    "home-3",
                    "Home maintenance check",
                    "Check for repairs needed",
                    2,
                    "life-environment",
                    "q2",
                    true,
                    new RecurrencePattern("monthly", 1),
                    "next"))),
        new TaskTemplateCategoryDto(
            "social",
            "Social Life",
            "👥",
            "#EC4899",
            "Friends, community, events",
            List.of(
                new TaskTemplateDto(
                    "social-1",
                    "Plan a social outing",
                    "Meet friends for an activity",
                    2,
                    "life-social",
                    "q2",
                    true,
                    new RecurrencePattern("biweekly", 1),
                    "current"),
                new TaskTemplateDto(
                    "social-2",
                    "Attend community event",
                    "Participate in local activities",
                    2,
                    "life-social",
                    "q2",
                    true,
                    new RecurrencePattern("monthly", 1),
                    "next"),
                new TaskTemplateDto(
                    "social-3",
                    "Reconnect with old friend",
                    "Reach out to someone you miss",
                    1,
                    "life-social",
                    "q2",
                    true,
                    new RecurrencePattern("monthly", 1),
                    "next"))),
        new TaskTemplateCategoryDto(
            "bills",
            "Bills & Reminders",
            "💳",
            "#DC2626",
            "Never miss a payment",
            List.of(
                new TaskTemplateDto(
                    "bills-1",
                    "Credit card payment due",
                    "Pay credit card before due date",
                    1,
                    "life-finance",
                    "q1",
                    true,
                    new RecurrencePattern("monthly", 1),
                    "current"),
                new TaskTemplateDto(
                    "bills-2",
                    "Rent/Mortgage payment",
                    "Monthly housing payment",
                    1,
                    "life-finance",
                    "q1",
                    true,
                    new RecurrencePattern("monthly", 1),
                    "current"),
                new TaskTemplateDto(
                    "bills-3",
                    "Utility bills (Electric/Gas/Water)",
                    "Pay monthly utilities",
                    1,
                    "life-finance",
                    "q1",
                    true,
                    new RecurrencePattern("monthly", 1),
                    "current"),
                new TaskTemplateDto(
                    "bills-4",
                    "Internet/Phone bill",
                    "Pay monthly telecom bills",
                    1,
                    "life-finance",
                    "q1",
                    true,
                    new RecurrencePattern("monthly", 1),
                    "current"),
                new TaskTemplateDto(
                    "bills-5",
                    "Insurance premium",
                    "Pay insurance (health/car/home)",
                    1,
                    "life-finance",
                    "q1",
                    true,
                    new RecurrencePattern("monthly", 1),
                    "current"),
                new TaskTemplateDto(
                    "bills-6",
                    "Subscription review",
                    "Review and cancel unused subscriptions",
                    2,
                    "life-finance",
                    "q2",
                    true,
                    new RecurrencePattern("monthly", 3),
                    "backlog"))),
        new TaskTemplateCategoryDto(
            "family-calls",
            "Stay Connected",
            "📞",
            "#7C3AED",
            "Regular check-ins with loved ones",
            List.of(
                new TaskTemplateDto(
                    "call-1",
                    "Call Mom",
                    "Weekly check-in with mom",
                    1,
                    "life-relationships",
                    "q2",
                    true,
                    new RecurrencePattern("weekly", 1),
                    "current"),
                new TaskTemplateDto(
                    "call-2",
                    "Call Dad",
                    "Weekly check-in with dad",
                    1,
                    "life-relationships",
                    "q2",
                    true,
                    new RecurrencePattern("weekly", 1),
                    "current"),
                new TaskTemplateDto(
                    "call-3",
                    "Video call with siblings",
                    "Bi-weekly family video chat",
                    1,
                    "life-relationships",
                    "q2",
                    true,
                    new RecurrencePattern("biweekly", 1),
                    "current"),
                new TaskTemplateDto(
                    "call-4",
                    "Check in with grandparents",
                    "Regular call to grandparents",
                    1,
                    "life-relationships",
                    "q2",
                    true,
                    new RecurrencePattern("weekly", 1),
                    "current"),
                new TaskTemplateDto(
                    "call-5",
                    "Catch up with best friend",
                    "Regular friend check-in",
                    1,
                    "life-relationships",
                    "q2",
                    true,
                    new RecurrencePattern("biweekly", 1),
                    "current"))));
  }

  private static List<EpicTemplateDto> initializeEpicTemplates() {
    return List.of(
        new EpicTemplateDto(
            "epic-fitness-journey",
            "🏃 Fitness Journey",
            "Build a sustainable exercise routine",
            "🏃",
            "#10B981",
            "life-health",
            List.of("health-1", "health-4", "health-5"),
            8),
        new EpicTemplateDto(
            "epic-financial-freedom",
            "💎 Financial Freedom",
            "Get your finances in order",
            "💎",
            "#F59E0B",
            "life-finance",
            List.of("finance-1", "finance-2", "finance-4", "bills-1", "bills-6"),
            12),
        new EpicTemplateDto(
            "epic-learn-skill",
            "🎓 Learn New Skill",
            "Master something new in 30 days",
            "🎓",
            "#8B5CF6",
            "life-growth",
            List.of("career-2", "growth-4"),
            4),
        new EpicTemplateDto(
            "epic-relationship-boost",
            "💕 Relationship Boost",
            "Strengthen your connections",
            "💕",
            "#EF4444",
            "life-relationships",
            List.of("relationships-1", "relationships-2", "relationships-3", "call-1", "call-5"),
            8),
        new EpicTemplateDto(
            "epic-mindfulness",
            "🧘 Mindfulness Practice",
            "Build daily meditation habit",
            "🧘",
            "#8B5CF6",
            "life-growth",
            List.of("growth-2", "growth-3"),
            6),
        new EpicTemplateDto(
            "epic-home-organization",
            "🏠 Home Organization",
            "Transform your living space",
            "🏠",
            "#84CC16",
            "life-environment",
            List.of("home-1", "home-2"),
            4),
        new EpicTemplateDto(
            "epic-reading-challenge",
            "📖 Reading Challenge",
            "Read 12 books this year",
            "📖",
            "#8B5CF6",
            "life-growth",
            List.of("growth-1"),
            52),
        new EpicTemplateDto(
            "epic-career-growth",
            "🚀 Career Growth",
            "Level up professionally",
            "🚀",
            "#3B82F6",
            "life-career",
            List.of("career-1", "career-2", "career-3"),
            12),
        new EpicTemplateDto(
            "epic-bills-autopilot",
            "💳 Bills on Autopilot",
            "Never miss a payment again",
            "💳",
            "#DC2626",
            "life-finance",
            List.of("bills-1", "bills-2", "bills-3", "bills-4", "bills-5"),
            4),
        new EpicTemplateDto(
            "epic-family-bonds",
            "👨‍👩‍👧‍👦 Family Bonds",
            "Stay connected with loved ones",
            "👨‍👩‍👧‍👦",
            "#7C3AED",
            "life-relationships",
            List.of("call-1", "call-2", "call-3", "call-4"),
            8));
  }
}
