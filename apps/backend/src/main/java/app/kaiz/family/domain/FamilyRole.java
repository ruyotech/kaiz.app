package app.kaiz.family.domain;

/** Roles within a family workspace. Determines permissions and visibility for family members. */
public enum FamilyRole {
  /** Family creator with full control. Can manage all family settings, members, and billing. */
  OWNER,

  /**
   * Adult family member with co-management permissions. Can view all tasks, approve kids' tasks,
   * invite members.
   */
  ADULT,

  /**
   * Teenage family member with limited autonomy. Can create and edit shared tasks, view family
   * calendar.
   */
  TEEN,

  /**
   * Child family member with restricted access. Can view assigned tasks and family shared content.
   */
  CHILD
}
