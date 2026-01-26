package com.kaiz.lifeos.sdlc.domain;

import com.fasterxml.jackson.annotation.JsonValue;

public enum SprintStatus {
  PLANNED("planned"),
  ACTIVE("active"),
  COMPLETED("completed");

  private final String value;

  SprintStatus(String value) {
    this.value = value;
  }

  @JsonValue
  public String getValue() {
    return value;
  }

  public static SprintStatus fromValue(String value) {
    for (SprintStatus status : SprintStatus.values()) {
      if (status.value.equalsIgnoreCase(value)) {
        return status;
      }
    }
    throw new IllegalArgumentException("Unknown SprintStatus: " + value);
  }
}
