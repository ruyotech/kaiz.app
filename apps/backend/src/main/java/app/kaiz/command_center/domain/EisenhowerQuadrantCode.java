package app.kaiz.command_center.domain;

/** Eisenhower Matrix quadrants for task prioritization. */
public enum EisenhowerQuadrantCode {
  Q1("q1", "Urgent & Important", "Do First"),
  Q2("q2", "Not Urgent & Important", "Schedule"),
  Q3("q3", "Urgent & Not Important", "Delegate"),
  Q4("q4", "Not Urgent & Not Important", "Eliminate");

  private final String code;
  private final String description;
  private final String action;

  EisenhowerQuadrantCode(String code, String description, String action) {
    this.code = code;
    this.description = description;
    this.action = action;
  }

  public String getCode() {
    return code;
  }

  public String getDescription() {
    return description;
  }

  public String getAction() {
    return action;
  }

  public static EisenhowerQuadrantCode fromCode(String code) {
    for (EisenhowerQuadrantCode quadrant : values()) {
      if (quadrant.code.equalsIgnoreCase(code)) {
        return quadrant;
      }
    }
    return Q2; // Default to "Schedule" - most valuable quadrant
  }
}
