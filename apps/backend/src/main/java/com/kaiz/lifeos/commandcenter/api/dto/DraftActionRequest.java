package com.kaiz.lifeos.commandcenter.api.dto;

import com.kaiz.lifeos.commandcenter.domain.Draft;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

/**
 * Request to approve, modify, or reject a pending draft.
 *
 * @param draftId The ID of the draft to act upon
 * @param action The action to take
 * @param modifiedDraft If action is MODIFY, the updated draft content
 */
public record DraftActionRequest(
        @NotNull UUID draftId,
        @NotNull DraftAction action,
        Draft modifiedDraft) {

    public enum DraftAction {
        APPROVE,  // Accept as-is, create the entity
        MODIFY,   // Accept with changes, create the entity
        REJECT    // Discard the draft
    }
}
