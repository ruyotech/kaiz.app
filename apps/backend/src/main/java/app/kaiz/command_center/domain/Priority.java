package app.kaiz.command_center.domain;

/**
 * Task priority levels.
 */
public enum Priority {
    LOW("Low priority - can be done when time allows"),
    MEDIUM("Medium priority - should be done soon"),
    HIGH("High priority - needs attention today"),
    URGENT("Urgent - needs immediate attention");

    private final String description;

    Priority(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
