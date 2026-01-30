package app.kaiz.sensai.domain;

/** Types of sprint ceremonies. */
public enum CeremonyType {
  /** Sprint planning session */
  PLANNING,

  /** Daily standup */
  STANDUP,

  /** Sprint review/demo */
  REVIEW,

  /** Sprint retrospective */
  RETROSPECTIVE,

  /** Backlog grooming/refinement */
  REFINEMENT
}
