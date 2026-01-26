package app.kaiz.command_center.domain;

/**
 * Status of AI-generated drafts in the approval workflow.
 */
public enum DraftStatus {
    PENDING_APPROVAL,  // Awaiting user decision
    APPROVED,          // User accepted, entity created
    MODIFIED,          // User modified before accepting
    REJECTED,          // User rejected/deleted
    EXPIRED            // Auto-expired after timeout
}
