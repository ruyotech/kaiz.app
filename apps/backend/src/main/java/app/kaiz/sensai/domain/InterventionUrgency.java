package app.kaiz.sensai.domain;

/** Urgency level of an intervention. */
public enum InterventionUrgency {
  /** Informational, can be addressed anytime */
  LOW,

  /** Should be addressed within the day */
  MEDIUM,

  /** Requires immediate attention */
  HIGH,

  /** Critical situation requiring immediate action */
  CRITICAL
}
