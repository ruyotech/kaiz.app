package app.kaiz.notification.domain;

/**
 * Notification categories for organizing and filtering notifications.
 */
public enum NotificationCategory {
  TASKS("tasks", "Tasks", "#3B82F6", "#DBEAFE"),
  CHALLENGES("challenges", "Challenges", "#F59E0B", "#FEF3C7"),
  COMMUNITY("community", "Community", "#8B5CF6", "#EDE9FE"),
  ESSENTIA("essentia", "Learning", "#10B981", "#D1FAE5"),
  EVENTS("events", "Events", "#EC4899", "#FCE7F3"),
  SYSTEM("system", "System", "#6B7280", "#F3F4F6"),
  AI("ai", "AI Insights", "#06B6D4", "#CFFAFE");

  private final String id;
  private final String displayName;
  private final String color;
  private final String backgroundColor;

  NotificationCategory(String id, String displayName, String color, String backgroundColor) {
    this.id = id;
    this.displayName = displayName;
    this.color = color;
    this.backgroundColor = backgroundColor;
  }

  public String getId() {
    return id;
  }

  public String getDisplayName() {
    return displayName;
  }

  public String getColor() {
    return color;
  }

  public String getBackgroundColor() {
    return backgroundColor;
  }

  /**
   * Get the default icon for this category.
   */
  public String getIcon() {
    return switch (this) {
      case TASKS -> "checkbox-marked-circle-outline";
      case CHALLENGES -> "trophy-outline";
      case COMMUNITY -> "account-group-outline";
      case ESSENTIA -> "book-open-page-variant";
      case EVENTS -> "calendar-star";
      case SYSTEM -> "cog-outline";
      case AI -> "robot-outline";
    };
  }

  /**
   * Convert from string ID to enum.
   */
  public static NotificationCategory fromId(String id) {
    for (NotificationCategory category : values()) {
      if (category.id.equalsIgnoreCase(id)) {
        return category;
      }
    }
    return SYSTEM; // Default fallback
  }
}
