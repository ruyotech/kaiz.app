package app.kaiz.sensai.domain;

/** Types of interventions the AI coach can trigger. */
public enum InterventionType {
  /** When user is overcommitting beyond their capacity */
  OVERCOMMIT,

  /** When user is behind on sprint progress */
  SPRINT_AT_RISK,

  /** When a life dimension needs attention */
  DIMENSION_IMBALANCE,

  /** When there's a calendar conflict */
  CALENDAR_CONFLICT,

  /** When user has been working too long without breaks */
  BURNOUT_WARNING,

  /** When velocity is declining */
  VELOCITY_DROP,

  /** When blockers are not being addressed */
  BLOCKER_ALERT,

  /** When user completes a goal or milestone */
  CELEBRATION,

  /** General guidance or tip */
  GUIDANCE
}
