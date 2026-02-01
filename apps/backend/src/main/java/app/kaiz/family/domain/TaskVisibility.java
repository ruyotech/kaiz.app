package app.kaiz.family.domain;

/**
 * Task visibility levels for family-shared tasks. Determines who can see and interact with tasks
 * within a family workspace.
 */
public enum TaskVisibility {
  /**
   * Private task - only the creator can see it. Adults can still see private tasks of minors they
   * supervise.
   */
  PRIVATE,

  /**
   * Shared task - all family members can see it. Visible in family view for everyone in the
   * workspace.
   */
  SHARED,

  /**
   * Assigned task - visible to assignee and adults. Used when assigning tasks to specific family
   * members.
   */
  ASSIGNED
}
