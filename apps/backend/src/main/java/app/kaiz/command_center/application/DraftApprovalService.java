package app.kaiz.command_center.application;

import app.kaiz.challenge.application.ChallengeService;
import app.kaiz.challenge.application.dto.ChallengeDto;
import app.kaiz.challenge.domain.MetricType;
import app.kaiz.challenge.domain.Recurrence;
import app.kaiz.command_center.application.dto.DraftActionRequest;
import app.kaiz.command_center.application.dto.DraftActionResponse;
import app.kaiz.command_center.domain.*;
import app.kaiz.command_center.infrastructure.PendingDraftRepository;
import app.kaiz.shared.exception.ResourceNotFoundException;
import app.kaiz.tasks.application.EpicService;
import app.kaiz.tasks.application.TaskService;
import app.kaiz.tasks.application.dto.EpicDto;
import app.kaiz.tasks.application.dto.TaskDto;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service to handle draft approval/rejection actions. When approved, creates the actual entity in
 * the system.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DraftApprovalService {

  private final PendingDraftRepository draftRepository;
  private final TaskService taskService;
  private final EpicService epicService;
  private final ChallengeService challengeService;

  // Note: EventService and BillService do not exist yet - will return placeholder IDs

  /** Process a draft action (approve, modify, or reject). */
  @Transactional
  public DraftActionResponse processAction(UUID userId, DraftActionRequest request) {
    log.info("📝 [Draft] Processing action: {} for draft: {}", request.action(), request.draftId());

    // Find the draft
    PendingDraft draft =
        draftRepository
            .findByIdAndUserId(request.draftId(), userId)
            .orElseThrow(
                () -> new ResourceNotFoundException("Draft", request.draftId().toString()));

    // Check if already processed
    if (draft.getStatus() != DraftStatus.PENDING_APPROVAL) {
      return DraftActionResponse.error(
          request.draftId().toString(),
          "Draft has already been processed with status: " + draft.getStatus());
    }

    // Check if expired
    if (draft.isExpired()) {
      draft.setStatus(DraftStatus.EXPIRED);
      draftRepository.save(draft);
      return DraftActionResponse.error(request.draftId().toString(), "Draft has expired");
    }

    return switch (request.action()) {
      case APPROVE -> approveAndCreate(draft);
      case MODIFY -> modifyAndCreate(draft, request.modifiedDraft());
      case REJECT -> rejectDraft(draft);
    };
  }

  /** Approve a draft and create the actual entity. */
  private DraftActionResponse approveAndCreate(PendingDraft pendingDraft) {
    Draft draft = pendingDraft.getDraftContent();
    UUID userId = pendingDraft.getUser().getId();
    String entityId = createEntity(draft, userId);

    pendingDraft.approve(entityId);
    draftRepository.save(pendingDraft);

    log.info("✅ [Draft] Approved and created {} with ID: {}", draft.type(), entityId);

    return DraftActionResponse.approved(
        pendingDraft.getId().toString(), draft.type(), entityId, draft.type().name());
  }

  /** Modify a draft and create with the modified content. */
  private DraftActionResponse modifyAndCreate(PendingDraft pendingDraft, Draft modifiedDraft) {
    if (modifiedDraft == null) {
      return DraftActionResponse.error(
          pendingDraft.getId().toString(), "Modified draft content is required for MODIFY action");
    }

    UUID userId = pendingDraft.getUser().getId();
    String entityId = createEntity(modifiedDraft, userId);

    pendingDraft.setDraftContent(modifiedDraft);
    pendingDraft.markModified(entityId);
    draftRepository.save(pendingDraft);

    log.info("✏️ [Draft] Modified and created {} with ID: {}", modifiedDraft.type(), entityId);

    return DraftActionResponse.modified(
        pendingDraft.getId().toString(),
        modifiedDraft.type(),
        entityId,
        modifiedDraft.type().name());
  }

  /** Reject a draft (delete it). */
  private DraftActionResponse rejectDraft(PendingDraft pendingDraft) {
    DraftType type = pendingDraft.getDraftType();
    pendingDraft.reject();
    draftRepository.save(pendingDraft);

    log.info("❌ [Draft] Rejected draft: {}", pendingDraft.getId());

    return DraftActionResponse.rejected(pendingDraft.getId().toString(), type);
  }

  /**
   * Create the actual entity based on draft type. Uses Java 21 pattern matching for sealed types.
   */
  private String createEntity(Draft draft, UUID userId) {
    String entityId =
        switch (draft) {
          case Draft.TaskDraft task -> {
            log.info(
                "📋 Creating Task: '{}' in {} ({})",
                task.title(),
                LifeWheelAreaCode.fromCode(task.lifeWheelAreaId()).getDisplayName(),
                EisenhowerQuadrantCode.fromCode(task.eisenhowerQuadrantId()).getDescription());
            var request =
                new TaskDto.CreateTaskRequest(
                    task.title(),
                    task.description(),
                    null, // epicId
                    task.lifeWheelAreaId(),
                    task.eisenhowerQuadrantId(),
                    task.suggestedSprintId(),
                    task.storyPoints(),
                    null, // status - will default to TODO
                    BigDecimal.valueOf(0.9), // aiConfidence
                    null, // createdFromTemplateId
                    null, // targetDate
                    false, // isRecurring
                    null, // recurrence
                    false, // isEvent
                    null, // location
                    false, // isAllDay
                    null, // eventStartTime
                    null, // eventEndTime
                    null, // tags
                    null, // attachments
                    null // comment
                    );
            TaskDto created = taskService.createTask(userId, request);
            yield created.id().toString();
          }
          case Draft.EpicDraft epic -> {
            log.info(
                "🎯 Creating Epic: '{}' in {} with {} suggested tasks",
                epic.title(),
                LifeWheelAreaCode.fromCode(epic.lifeWheelAreaId()).getDisplayName(),
                epic.suggestedTasks().size());
            var request =
                new EpicDto.CreateEpicRequest(
                    epic.title(),
                    epic.description(),
                    epic.lifeWheelAreaId(),
                    null, // targetSprintId
                    epic.color(),
                    epic.icon());
            EpicDto created = epicService.createEpic(userId, request);
            // Note: suggestedTasks would need separate creation in a future enhancement
            yield created.id().toString();
          }
          case Draft.ChallengeDraft challenge -> {
            log.info(
                "🏆 Creating Challenge: '{}' ({} days, {}) in {}",
                challenge.name(),
                challenge.duration(),
                challenge.metricType(),
                LifeWheelAreaCode.fromCode(challenge.lifeWheelAreaId()).getDisplayName());
            MetricType metricType = mapMetricType(challenge.metricType());
            Recurrence recurrence = mapRecurrence(challenge.recurrence());
            BigDecimal targetValue =
                challenge.targetValue() != null ? challenge.targetValue() : BigDecimal.ONE;
            var request =
                new ChallengeDto.CreateChallengeRequest(
                    challenge.name(),
                    challenge.description(),
                    challenge.lifeWheelAreaId(),
                    metricType,
                    targetValue,
                    challenge.unit(),
                    challenge.duration(),
                    recurrence,
                    challenge.whyStatement(),
                    challenge.rewardDescription(),
                    challenge.graceDays(),
                    null, // challengeType
                    null, // visibility
                    null // createdFromTemplateId
                    );
            ChallengeDto created = challengeService.createChallenge(userId, request);
            yield created.id().toString();
          }
          case Draft.EventDraft event -> {
            log.info(
                "📅 Creating Event: '{}' on {} in {}",
                event.title(),
                event.date(),
                LifeWheelAreaCode.fromCode(event.lifeWheelAreaId()).getDisplayName());
            // EventService does not exist yet - return placeholder ID
            log.warn("EventService not yet implemented, returning placeholder ID");
            yield "event-" + UUID.randomUUID();
          }
          case Draft.BillDraft bill -> {
            log.info(
                "💰 Creating Bill: '{}' - {} {} due {}",
                bill.vendorName(),
                bill.currency(),
                bill.amount(),
                bill.dueDate());
            // BillService does not exist yet - return placeholder ID
            log.warn("BillService not yet implemented, returning placeholder ID");
            yield "bill-" + UUID.randomUUID();
          }
          case Draft.NoteDraft note -> {
            log.info("📝 Creating Note: '{}'", note.title());
            // NoteService does not exist yet - return placeholder ID
            log.warn("NoteService not yet implemented, returning placeholder ID");
            yield "note-" + UUID.randomUUID();
          }
        };

    return entityId;
  }

  /** Map draft metric type string to MetricType enum. */
  private MetricType mapMetricType(String draftMetricType) {
    if (draftMetricType == null) {
      return MetricType.YESNO;
    }
    return switch (draftMetricType.toLowerCase()) {
      case "yesno", "yes_no" -> MetricType.YESNO;
      case "count" -> MetricType.COUNT;
      case "duration", "time" -> MetricType.TIME;
      case "streak" -> MetricType.STREAK;
      case "completion" -> MetricType.COMPLETION;
      default -> MetricType.YESNO;
    };
  }

  /** Map draft recurrence string to Recurrence enum. */
  private Recurrence mapRecurrence(String draftRecurrence) {
    if (draftRecurrence == null) {
      return Recurrence.DAILY;
    }
    return switch (draftRecurrence.toLowerCase()) {
      case "daily" -> Recurrence.DAILY;
      case "weekly" -> Recurrence.WEEKLY;
      case "biweekly" -> Recurrence.BIWEEKLY;
      case "monthly" -> Recurrence.MONTHLY;
      case "custom" -> Recurrence.CUSTOM;
      default -> Recurrence.DAILY;
    };
  }
}
