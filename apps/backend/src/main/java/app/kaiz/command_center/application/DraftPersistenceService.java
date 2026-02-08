package app.kaiz.command_center.application;

import app.kaiz.command_center.application.dto.CreatePendingDraftRequest;
import app.kaiz.command_center.domain.Draft;
import app.kaiz.identity.domain.User;
import app.kaiz.identity.infrastructure.UserRepository;
import app.kaiz.life_wheel.domain.EisenhowerQuadrant;
import app.kaiz.life_wheel.domain.LifeWheelArea;
import app.kaiz.life_wheel.infrastructure.EisenhowerQuadrantRepository;
import app.kaiz.life_wheel.infrastructure.LifeWheelAreaRepository;
import app.kaiz.shared.exception.BadRequestException;
import app.kaiz.shared.exception.ResourceNotFoundException;
import app.kaiz.tasks.domain.Task;
import app.kaiz.tasks.domain.TaskStatus;
import app.kaiz.tasks.domain.TaskType;
import app.kaiz.tasks.infrastructure.TaskRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Converts AI-generated drafts into persisted Task entities. Handles both session-based saves and
 * direct draft-to-task creation.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DraftPersistenceService {

  private final TaskRepository taskRepository;
  private final UserRepository userRepository;
  private final LifeWheelAreaRepository lifeWheelAreaRepository;
  private final EisenhowerQuadrantRepository eisenhowerQuadrantRepository;

  /**
   * Save a draft from a conversation session as a Task with PENDING_APPROVAL status.
   *
   * @param userId The user ID
   * @param sessionId The session ID for tracking
   * @param draft The draft to convert
   * @return The saved Task ID
   */
  @Transactional
  public UUID saveDraftAsTask(UUID userId, UUID sessionId, Draft draft) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

    Task savedTask =
        switch (draft) {
          case Draft.TaskDraft taskDraft ->
              createTaskFromDraft(user, sessionId, taskDraft, TaskType.TASK);
          case Draft.EventDraft eventDraft -> createTaskFromEventDraft(user, sessionId, eventDraft);
          default ->
              throw new BadRequestException("Unsupported draft type for pending: " + draft.type());
        };

    log.info("Task created with ID: {}, status: PENDING_APPROVAL", savedTask.getId());
    return savedTask.getId();
  }

  /**
   * Create a Task entity directly from request data (bypasses session lookup). Useful when the
   * session has expired or when user has edited the draft fields.
   */
  @Transactional
  public UUID createFromRequest(UUID userId, CreatePendingDraftRequest request) {
    log.info("Creating task from draft for user: {}, type: {}", userId, request.draftType());

    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

    LifeWheelArea lifeWheelArea = resolveLifeWheelArea(request.lifeWheelAreaId());
    EisenhowerQuadrant eisenhowerQuadrant =
        resolveEisenhowerQuadrant(request.eisenhowerQuadrantId());

    TaskType taskType = request.isEvent() ? TaskType.EVENT : TaskType.TASK;
    ZoneId zone = ZoneId.systemDefault();

    Instant targetDate = null;
    Instant eventStartTime = null;
    Instant eventEndTime = null;

    LocalDate effectiveDate = request.getEffectiveDate();
    if (effectiveDate != null) {
      targetDate = effectiveDate.atStartOfDay(zone).toInstant();
      if (request.startTime() != null) {
        eventStartTime = effectiveDate.atTime(request.startTime()).atZone(zone).toInstant();
      }
      if (request.endTime() != null) {
        eventEndTime = effectiveDate.atTime(request.endTime()).atZone(zone).toInstant();
      }
    }

    int storyPoints = request.storyPoints() != null ? request.storyPoints() : 3;

    Task task =
        Task.builder()
            .title(request.title())
            .description(request.description())
            .user(user)
            .lifeWheelArea(lifeWheelArea)
            .eisenhowerQuadrant(eisenhowerQuadrant)
            .storyPoints(storyPoints)
            .status(TaskStatus.PENDING_APPROVAL)
            .aiConfidence(BigDecimal.valueOf(0.85))
            .targetDate(targetDate)
            .isRecurring(request.isRecurring() != null ? request.isRecurring() : false)
            .taskType(taskType)
            .eventStartTime(eventStartTime)
            .eventEndTime(eventEndTime)
            .location(request.location())
            .build();

    Task savedTask = taskRepository.save(task);
    log.info("Task created with ID: {}, taskType: {}", savedTask.getId(), taskType);
    return savedTask.getId();
  }

  /** Create a Task entity from TaskDraft with PENDING_APPROVAL status. */
  Task createTaskFromDraft(
      User user, UUID sessionId, Draft.TaskDraft taskDraft, TaskType taskType) {
    LifeWheelArea lifeWheelArea = resolveLifeWheelArea(taskDraft.lifeWheelAreaId());
    EisenhowerQuadrant eisenhowerQuadrant =
        resolveEisenhowerQuadrant(taskDraft.eisenhowerQuadrantId());

    Instant targetDate = null;
    if (taskDraft.dueDate() != null) {
      targetDate = taskDraft.dueDate().atStartOfDay(ZoneId.systemDefault()).toInstant();
    }

    Task task =
        Task.builder()
            .title(taskDraft.title())
            .description(taskDraft.description())
            .user(user)
            .lifeWheelArea(lifeWheelArea)
            .eisenhowerQuadrant(eisenhowerQuadrant)
            .storyPoints(taskDraft.storyPoints())
            .status(TaskStatus.PENDING_APPROVAL)
            .aiConfidence(BigDecimal.valueOf(0.85))
            .aiSessionId(sessionId)
            .targetDate(targetDate)
            .isRecurring(taskDraft.isRecurring())
            .taskType(taskType)
            .build();

    return taskRepository.save(task);
  }

  /** Create a Task entity from EventDraft. Events are stored as tasks with taskType=EVENT. */
  Task createTaskFromEventDraft(User user, UUID sessionId, Draft.EventDraft eventDraft) {
    LifeWheelArea lifeWheelArea = resolveLifeWheelArea(eventDraft.lifeWheelAreaId());
    EisenhowerQuadrant eisenhowerQuadrant = resolveEisenhowerQuadrant("eq-2");

    Instant targetDate = null;
    Instant eventStartTime = null;
    Instant eventEndTime = null;

    if (eventDraft.date() != null) {
      ZoneId zone = ZoneId.systemDefault();
      targetDate = eventDraft.date().atStartOfDay(zone).toInstant();
      if (eventDraft.startTime() != null) {
        eventStartTime = eventDraft.date().atTime(eventDraft.startTime()).atZone(zone).toInstant();
      }
      if (eventDraft.endTime() != null) {
        eventEndTime = eventDraft.date().atTime(eventDraft.endTime()).atZone(zone).toInstant();
      }
    }

    Task task =
        Task.builder()
            .title(eventDraft.title())
            .description(eventDraft.description())
            .user(user)
            .lifeWheelArea(lifeWheelArea)
            .eisenhowerQuadrant(eisenhowerQuadrant)
            .storyPoints(3)
            .status(TaskStatus.PENDING_APPROVAL)
            .aiConfidence(BigDecimal.valueOf(0.85))
            .aiSessionId(sessionId)
            .targetDate(targetDate)
            .taskType(TaskType.EVENT)
            .location(eventDraft.location())
            .isAllDay(eventDraft.isAllDay())
            .eventStartTime(eventStartTime)
            .eventEndTime(eventEndTime)
            .build();

    return taskRepository.save(task);
  }

  // =========================================================================
  // Shared resolution helpers (eliminates duplication across methods)
  // =========================================================================

  private LifeWheelArea resolveLifeWheelArea(String lifeWheelId) {
    String effectiveId = lifeWheelId != null ? lifeWheelId : "lw-4";
    return lifeWheelAreaRepository
        .findById(effectiveId)
        .orElseGet(
            () ->
                lifeWheelAreaRepository
                    .findById("lw-4")
                    .orElseThrow(() -> new ResourceNotFoundException("LifeWheelArea", "lw-4")));
  }

  private EisenhowerQuadrant resolveEisenhowerQuadrant(String quadrantId) {
    String effectiveId = quadrantId != null ? quadrantId : "eq-2";
    return eisenhowerQuadrantRepository
        .findById(effectiveId)
        .orElseGet(
            () ->
                eisenhowerQuadrantRepository
                    .findById("eq-2")
                    .orElseThrow(
                        () -> new ResourceNotFoundException("EisenhowerQuadrant", "eq-2")));
  }
}
