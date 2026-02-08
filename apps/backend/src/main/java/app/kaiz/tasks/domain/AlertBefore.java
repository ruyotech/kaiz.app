package app.kaiz.tasks.domain;

import java.time.Duration;

/**
 * Predefined alert-before options matching the mobile UI picker. Each value maps to a fixed
 * duration before the event/task time.
 */
public enum AlertBefore {
  NONE(Duration.ZERO),
  AT_TIME(Duration.ZERO),
  MINUTES_5(Duration.ofMinutes(5)),
  MINUTES_10(Duration.ofMinutes(10)),
  MINUTES_15(Duration.ofMinutes(15)),
  MINUTES_30(Duration.ofMinutes(30)),
  HOURS_1(Duration.ofHours(1)),
  HOURS_2(Duration.ofHours(2)),
  DAYS_1(Duration.ofDays(1)),
  DAYS_2(Duration.ofDays(2)),
  WEEKS_1(Duration.ofDays(7));

  private final Duration duration;

  AlertBefore(Duration duration) {
    this.duration = duration;
  }

  /** Get the duration to subtract from event time to determine alert fire time. */
  public Duration toDuration() {
    return duration;
  }

  /** Whether this option represents an actual alert (not NONE). */
  public boolean isEnabled() {
    return this != NONE;
  }
}
