package app.kaiz.notification.domain;

/** Notification priority levels for organizing notification importance. */
public enum NotificationPriority {
  LOW("low", 0, "#9CA3AF"),
  MEDIUM("medium", 1, "#3B82F6"),
  HIGH("high", 2, "#F59E0B"),
  URGENT("urgent", 3, "#EF4444");

  private final String id;
  private final int weight;
  private final String color;

  NotificationPriority(String id, int weight, String color) {
    this.id = id;
    this.weight = weight;
    this.color = color;
  }

  public String getId() {
    return id;
  }

  public int getWeight() {
    return weight;
  }

  public String getColor() {
    return color;
  }

  /** Convert from string ID to enum. */
  public static NotificationPriority fromId(String id) {
    for (NotificationPriority priority : values()) {
      if (priority.id.equalsIgnoreCase(id)) {
        return priority;
      }
    }
    return MEDIUM; // Default fallback
  }
}
