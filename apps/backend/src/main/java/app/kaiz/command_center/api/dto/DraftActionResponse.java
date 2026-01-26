package app.kaiz.command_center.api.dto;

import app.kaiz.command_center.domain.DraftStatus;
import app.kaiz.command_center.domain.DraftType;

/**
 * Response after a draft action is processed.
 *
 * @param success Whether the action was successful
 * @param message Human-readable result message
 * @param draftId The draft that was acted upon
 * @param draftType The type of draft
 * @param newStatus The new status after the action
 * @param createdEntityId If approved/modified, the ID of the created entity
 * @param createdEntityType If approved/modified, the type of entity created
 */
public record DraftActionResponse(
        boolean success,
        String message,
        String draftId,
        DraftType draftType,
        DraftStatus newStatus,
        String createdEntityId,
        String createdEntityType) {

    public static DraftActionResponse approved(
            String draftId, DraftType draftType, String entityId, String entityType) {
        return new DraftActionResponse(
                true,
                "Draft approved and %s created successfully".formatted(entityType.toLowerCase()),
                draftId,
                draftType,
                DraftStatus.APPROVED,
                entityId,
                entityType);
    }

    public static DraftActionResponse modified(
            String draftId, DraftType draftType, String entityId, String entityType) {
        return new DraftActionResponse(
                true,
                "Draft modified and %s created successfully".formatted(entityType.toLowerCase()),
                draftId,
                draftType,
                DraftStatus.MODIFIED,
                entityId,
                entityType);
    }

    public static DraftActionResponse rejected(String draftId, DraftType draftType) {
        return new DraftActionResponse(
                true, "Draft rejected", draftId, draftType, DraftStatus.REJECTED, null, null);
    }

    public static DraftActionResponse error(String draftId, String message) {
        return new DraftActionResponse(false, message, draftId, null, null, null, null);
    }
}
