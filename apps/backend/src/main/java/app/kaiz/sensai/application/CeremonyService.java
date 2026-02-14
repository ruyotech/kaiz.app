package app.kaiz.sensai.application;

import app.kaiz.command_center.domain.ConversationSession;
import app.kaiz.command_center.domain.ConversationSession.ChatMode;
import app.kaiz.command_center.infrastructure.ConversationSessionRepository;
import app.kaiz.identity.domain.User;
import app.kaiz.identity.infrastructure.UserRepository;
import app.kaiz.sensai.application.dto.SprintCeremonyDto;
import app.kaiz.sensai.domain.*;
import app.kaiz.sensai.infrastructure.SprintCeremonyRepository;
import app.kaiz.shared.exception.ResourceNotFoundException;
import app.kaiz.tasks.domain.Task;
import app.kaiz.tasks.domain.TaskStatus;
import app.kaiz.tasks.infrastructure.SprintRepository;
import app.kaiz.tasks.infrastructure.TaskRepository;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Manages sprint ceremonies (planning, review, retrospective, standup, refinement): start,
 * complete, and data aggregation for review and retrospective insights.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CeremonyService {

  private final SprintCeremonyRepository ceremonyRepository;
  private final ConversationSessionRepository conversationSessionRepository;
  private final UserRepository userRepository;
  private final TaskRepository taskRepository;
  private final SprintRepository sprintRepository;
  private final SensAIMapper mapper;

  public List<SprintCeremonyDto> getCeremoniesForSprint(UUID userId, String sprintId) {
    return mapper.toCeremonyDtos(
        ceremonyRepository.findByUserIdAndSprintIdOrderByScheduledAt(userId, sprintId));
  }

  @Transactional
  public SprintCeremonyDto startCeremony(
      UUID userId, SprintCeremonyDto.StartCeremonyRequest request) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    SprintCeremony ceremony =
        ceremonyRepository
            .findByUserIdAndSprintIdAndCeremonyType(
                userId, request.sprintId(), request.ceremonyType())
            .orElseGet(
                () ->
                    SprintCeremony.builder()
                        .user(user)
                        .sprintId(request.sprintId())
                        .ceremonyType(request.ceremonyType())
                        .build());

    ceremony.setStatus(CeremonyStatus.IN_PROGRESS);
    ceremony.setStartedAt(Instant.now());

    SprintCeremony savedCeremony = ceremonyRepository.save(ceremony);

    // Create a ConversationSession linked to this ceremony
    createCeremonySession(user, savedCeremony);

    log.info(
        "Ceremony started: userId={}, sprintId={}, type={}",
        userId,
        request.sprintId(),
        request.ceremonyType());
    return mapper.toDto(savedCeremony);
  }

  @Transactional
  public SprintCeremonyDto completeCeremony(
      UUID userId, UUID ceremonyId, SprintCeremonyDto.CompleteCeremonyRequest request) {
    SprintCeremony ceremony =
        ceremonyRepository
            .findById(ceremonyId)
            .orElseThrow(() -> new ResourceNotFoundException("Ceremony not found"));

    if (!ceremony.getUser().getId().equals(userId)) {
      throw new ResourceNotFoundException("Ceremony not found");
    }

    ceremony.setStatus(CeremonyStatus.COMPLETED);
    ceremony.setCompletedAt(Instant.now());
    ceremony.setNotes(request.notes());

    if (request.outcomes() != null) {
      ceremony.setOutcomes(mapper.toJson(request.outcomes()));
    }
    if (request.actionItems() != null) {
      ceremony.setActionItems(mapper.toJson(request.actionItems()));
    }

    if (ceremony.getStartedAt() != null) {
      long minutes =
          Duration.between(ceremony.getStartedAt(), ceremony.getCompletedAt()).toMinutes();
      ceremony.setDurationMinutes((int) minutes);
    }

    ceremony.setCoachSummary(generateCeremonySummary(ceremony));

    // Close the linked conversation session
    closeCeremonySession(ceremony.getId());

    log.info(
        "Ceremony completed: userId={}, ceremonyId={}, type={}, duration={}min",
        userId,
        ceremonyId,
        ceremony.getCeremonyType(),
        ceremony.getDurationMinutes());
    return mapper.toDto(ceremonyRepository.save(ceremony));
  }

  /** Aggregate sprint review data: completed tasks, carried-over, highlights. */
  public SprintCeremonyDto.CeremonyOutcomes getSprintReviewData(UUID userId, String sprintId) {
    log.debug("Getting sprint review data: userId={}, sprintId={}", userId, sprintId);

    List<Task> allTasks =
        taskRepository.findByUserIdAndSprintIdAndDeletedAtIsNullOrderByCreatedAtDesc(
            userId, sprintId);
    List<Task> completedTasks =
        allTasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).toList();
    List<Task> carriedOverTasks =
        taskRepository.findCarriedOverByUserIdAndSprintId(userId, sprintId);

    int pointsDelivered = completedTasks.stream().mapToInt(Task::getStoryPoints).sum();

    List<String> highlights =
        completedTasks.stream()
            .sorted(Comparator.comparingInt(Task::getStoryPoints).reversed())
            .limit(5)
            .map(Task::getTitle)
            .toList();

    List<String> carriedOverNames =
        carriedOverTasks.stream()
            .map(t -> t.getTitle() + " (" + t.getStoryPoints() + " pts)")
            .toList();

    var sprint = sprintRepository.findById(sprintId).orElse(null);
    String sprintGoal = sprint != null ? sprint.getSprintGoal() : null;

    log.info(
        "Sprint review data: sprintId={}, completed={}, carriedOver={}",
        sprintId,
        completedTasks.size(),
        carriedOverTasks.size());

    return new SprintCeremonyDto.CeremonyOutcomes(
        allTasks.stream().mapToInt(Task::getStoryPoints).sum(),
        completedTasks.size(),
        sprintGoal,
        pointsDelivered,
        completedTasks.size(),
        highlights,
        carriedOverNames,
        null,
        null,
        null);
  }

  /** Auto-generate retrospective insights from sprint data. */
  public SprintCeremonyDto.CeremonyOutcomes getRetrospectiveData(UUID userId, String sprintId) {
    log.debug("Getting retrospective data: userId={}, sprintId={}", userId, sprintId);

    List<Task> allTasks =
        taskRepository.findByUserIdAndSprintIdAndDeletedAtIsNullOrderByCreatedAtDesc(
            userId, sprintId);
    List<Task> completedTasks =
        allTasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).toList();
    List<Task> incompleteTasks =
        allTasks.stream().filter(t -> t.getStatus() != TaskStatus.DONE).toList();
    List<Task> carriedOverTasks =
        taskRepository.findCarriedOverByUserIdAndSprintId(userId, sprintId);
    List<Task> blockedTasks = taskRepository.findBlockedByUserIdAndSprintId(userId, sprintId);

    // Auto-generate "went well"
    List<String> wentWell = new ArrayList<>();
    if (!completedTasks.isEmpty()) {
      int totalDelivered = completedTasks.stream().mapToInt(Task::getStoryPoints).sum();
      wentWell.add(
          "Delivered "
              + totalDelivered
              + " story points across "
              + completedTasks.size()
              + " tasks");
    }
    Map<String, Long> dimensionCounts =
        completedTasks.stream()
            .filter(t -> t.getLifeWheelArea() != null)
            .collect(
                Collectors.groupingBy(t -> t.getLifeWheelArea().getName(), Collectors.counting()));
    dimensionCounts.entrySet().stream()
        .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
        .limit(3)
        .forEach(
            e ->
                wentWell.add(
                    "Strong focus on " + e.getKey() + " (" + e.getValue() + " tasks completed)"));

    // Auto-generate "needs improvement"
    List<String> needsImprovement = new ArrayList<>();
    if (!incompleteTasks.isEmpty()) {
      int unfinishedPoints = incompleteTasks.stream().mapToInt(Task::getStoryPoints).sum();
      needsImprovement.add(
          incompleteTasks.size() + " tasks incomplete (" + unfinishedPoints + " points remaining)");
    }
    if (!blockedTasks.isEmpty()) {
      needsImprovement.add(blockedTasks.size() + " tasks were blocked during the sprint");
    }
    if (!carriedOverTasks.isEmpty()) {
      needsImprovement.add(carriedOverTasks.size() + " tasks carried over from previous sprint");
    }

    // Auto-generate suggestions
    List<String> tryNextSprint = new ArrayList<>();
    if (incompleteTasks.size() > completedTasks.size()) {
      tryNextSprint.add("Consider committing fewer story points next sprint");
    }
    if (!blockedTasks.isEmpty()) {
      tryNextSprint.add("Identify and address blockers earlier in the sprint");
    }
    if (carriedOverTasks.size() > 2) {
      tryNextSprint.add("Break down large carried-over tasks into smaller deliverables");
    }
    if (tryNextSprint.isEmpty()) {
      tryNextSprint.add("Maintain current pace and continue balanced focus");
    }

    List<String> carriedOverNames =
        carriedOverTasks.stream()
            .map(
                t ->
                    t.getTitle()
                        + " (originally "
                        + (t.getOriginalStoryPoints() != null
                            ? t.getOriginalStoryPoints()
                            : t.getStoryPoints())
                        + " pts)")
            .toList();

    int pointsDelivered = completedTasks.stream().mapToInt(Task::getStoryPoints).sum();

    var sprint = sprintRepository.findById(sprintId).orElse(null);
    String sprintGoal = sprint != null ? sprint.getSprintGoal() : null;

    log.info(
        "Retrospective data: sprintId={}, wentWell={}, improvements={}, actions={}",
        sprintId,
        wentWell.size(),
        needsImprovement.size(),
        tryNextSprint.size());

    return new SprintCeremonyDto.CeremonyOutcomes(
        0,
        completedTasks.size(),
        sprintGoal,
        pointsDelivered,
        completedTasks.size(),
        null,
        carriedOverNames,
        wentWell,
        needsImprovement,
        tryNextSprint);
  }

  // ── Ceremony ↔ Conversation Session ──

  private void createCeremonySession(User user, SprintCeremony ceremony) {
    try {
      ChatMode chatMode = mapCeremonyTypeToMode(ceremony.getCeremonyType());
      ConversationSession session =
          ConversationSession.builder()
              .user(user)
              .mode(chatMode)
              .sprintId(ceremony.getSprintId())
              .ceremonyId(ceremony.getId())
              .build();
      conversationSessionRepository.save(session);
      log.info(
          "Created conversation session for ceremony: ceremonyId={}, mode={}",
          ceremony.getId(),
          chatMode);
    } catch (Exception e) {
      log.warn(
          "Failed to create conversation session for ceremony {}: {}",
          ceremony.getId(),
          e.getMessage());
    }
  }

  private void closeCeremonySession(UUID ceremonyId) {
    try {
      conversationSessionRepository
          .findByCeremonyIdAndStatus(ceremonyId, ConversationSession.SessionStatus.ACTIVE)
          .ifPresent(
              session -> {
                session.close();
                conversationSessionRepository.save(session);
              });
      log.debug("Closed conversation sessions for ceremony: {}", ceremonyId);
    } catch (Exception e) {
      log.warn(
          "Failed to close conversation session for ceremony {}: {}", ceremonyId, e.getMessage());
    }
  }

  private ChatMode mapCeremonyTypeToMode(CeremonyType type) {
    return switch (type) {
      case PLANNING -> ChatMode.PLANNING;
      case STANDUP -> ChatMode.STANDUP;
      case REVIEW -> ChatMode.REVIEW;
      case RETROSPECTIVE -> ChatMode.RETROSPECTIVE;
      case REFINEMENT -> ChatMode.REFINEMENT;
    };
  }

  // ── Helpers ──

  private String generateCeremonySummary(SprintCeremony ceremony) {
    return switch (ceremony.getCeremonyType()) {
      case PLANNING -> "Planning complete. Remember to focus on high-priority items first.";
      case REVIEW -> "Great review session! Celebrate your accomplishments.";
      case RETROSPECTIVE -> "Valuable insights gathered. Follow through on your action items.";
      case STANDUP -> "Daily check-in recorded.";
      case REFINEMENT -> "Backlog refined and ready for the next sprint.";
    };
  }
}
