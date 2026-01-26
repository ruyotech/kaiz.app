package app.kaiz.command_center.application;

import app.kaiz.command_center.api.dto.DraftActionRequest;
import app.kaiz.command_center.api.dto.DraftActionResponse;
import app.kaiz.command_center.domain.*;
import app.kaiz.command_center.infrastructure.PendingDraftRepository;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service to handle draft approval/rejection actions.
 * When approved, creates the actual entity in the system.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DraftApprovalService {

    private final PendingDraftRepository draftRepository;
    // TODO: Inject actual entity services when ready
    // private final TaskService taskService;
    // private final EpicService epicService;
    // private final ChallengeService challengeService;
    // private final EventService eventService;
    // private final BillService billService;

    /**
     * Process a draft action (approve, modify, or reject).
     */
    @Transactional
    public DraftActionResponse processAction(UUID userId, DraftActionRequest request) {
        log.info("📝 [Draft] Processing action: {} for draft: {}", request.action(), request.draftId());

        // Find the draft
        PendingDraft draft =
                draftRepository
                        .findByIdAndUserId(request.draftId(), userId)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Draft not found: " + request.draftId()));

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

    /**
     * Approve a draft and create the actual entity.
     */
    private DraftActionResponse approveAndCreate(PendingDraft pendingDraft) {
        Draft draft = pendingDraft.getDraftContent();
        String entityId = createEntity(draft);

        pendingDraft.approve(entityId);
        draftRepository.save(pendingDraft);

        log.info(
                "✅ [Draft] Approved and created {} with ID: {}",
                draft.type(),
                entityId);

        return DraftActionResponse.approved(
                pendingDraft.getId().toString(),
                draft.type(),
                entityId,
                draft.type().name());
    }

    /**
     * Modify a draft and create with the modified content.
     */
    private DraftActionResponse modifyAndCreate(PendingDraft pendingDraft, Draft modifiedDraft) {
        if (modifiedDraft == null) {
            return DraftActionResponse.error(
                    pendingDraft.getId().toString(),
                    "Modified draft content is required for MODIFY action");
        }

        String entityId = createEntity(modifiedDraft);

        pendingDraft.setDraftContent(modifiedDraft);
        pendingDraft.markModified(entityId);
        draftRepository.save(pendingDraft);

        log.info(
                "✏️ [Draft] Modified and created {} with ID: {}",
                modifiedDraft.type(),
                entityId);

        return DraftActionResponse.modified(
                pendingDraft.getId().toString(),
                modifiedDraft.type(),
                entityId,
                modifiedDraft.type().name());
    }

    /**
     * Reject a draft (delete it).
     */
    private DraftActionResponse rejectDraft(PendingDraft pendingDraft) {
        DraftType type = pendingDraft.getDraftType();
        pendingDraft.reject();
        draftRepository.save(pendingDraft);

        log.info("❌ [Draft] Rejected draft: {}", pendingDraft.getId());

        return DraftActionResponse.rejected(pendingDraft.getId().toString(), type);
    }

    /**
     * Create the actual entity based on draft type.
     * Uses Java 21 pattern matching for sealed types.
     */
    private String createEntity(Draft draft) {
        // TODO: Replace with actual entity creation when services are ready
        // For now, return a placeholder ID

        String entityId =
                switch (draft) {
                    case Draft.TaskDraft task -> {
                        log.info(
                                "📋 Creating Task: '{}' in {} ({})",
                                task.title(),
                                LifeWheelAreaCode.fromCode(task.lifeWheelAreaId()).getDisplayName(),
                                EisenhowerQuadrantCode.fromCode(task.eisenhowerQuadrantId())
                                        .getDescription());
                        // TODO: return taskService.create(task).getId().toString();
                        yield "task-" + UUID.randomUUID();
                    }
                    case Draft.EpicDraft epic -> {
                        log.info(
                                "🎯 Creating Epic: '{}' in {} with {} suggested tasks",
                                epic.title(),
                                LifeWheelAreaCode.fromCode(epic.lifeWheelAreaId()).getDisplayName(),
                                epic.suggestedTasks().size());
                        // TODO: return epicService.create(epic).getId().toString();
                        yield "epic-" + UUID.randomUUID();
                    }
                    case Draft.ChallengeDraft challenge -> {
                        log.info(
                                "🏆 Creating Challenge: '{}' ({} days, {}) in {}",
                                challenge.name(),
                                challenge.duration(),
                                challenge.metricType(),
                                LifeWheelAreaCode.fromCode(challenge.lifeWheelAreaId()).getDisplayName());
                        // TODO: return challengeService.create(challenge).getId().toString();
                        yield "challenge-" + UUID.randomUUID();
                    }
                    case Draft.EventDraft event -> {
                        log.info(
                                "📅 Creating Event: '{}' on {} in {}",
                                event.title(),
                                event.date(),
                                LifeWheelAreaCode.fromCode(event.lifeWheelAreaId()).getDisplayName());
                        // TODO: return eventService.create(event).getId().toString();
                        yield "event-" + UUID.randomUUID();
                    }
                    case Draft.BillDraft bill -> {
                        log.info(
                                "💰 Creating Bill: '{}' - {} {} due {}",
                                bill.vendorName(),
                                bill.currency(),
                                bill.amount(),
                                bill.dueDate());
                        // TODO: return billService.create(bill).getId().toString();
                        yield "bill-" + UUID.randomUUID();
                    }
                    case Draft.NoteDraft note -> {
                        log.info("📝 Creating Note: '{}'", note.title());
                        // TODO: return noteService.create(note).getId().toString();
                        yield "note-" + UUID.randomUUID();
                    }
                };

        return entityId;
    }
}
