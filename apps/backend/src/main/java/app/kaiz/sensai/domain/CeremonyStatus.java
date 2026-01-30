package app.kaiz.sensai.domain;

/** Status of a sprint ceremony. */
public enum CeremonyStatus {
  /** Ceremony is scheduled but not started */
  SCHEDULED,

  /** Ceremony is currently in progress */
  IN_PROGRESS,

  /** Ceremony has been completed */
  COMPLETED,

  /** Ceremony was skipped */
  SKIPPED,

  /** Ceremony was cancelled */
  CANCELLED
}
