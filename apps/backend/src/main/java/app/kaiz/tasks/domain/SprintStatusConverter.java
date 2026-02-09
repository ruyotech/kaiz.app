package app.kaiz.tasks.domain;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class SprintStatusConverter implements AttributeConverter<SprintStatus, String> {

  @Override
  public String convertToDatabaseColumn(SprintStatus status) {
    return status == null ? null : status.name(); // UPPERCASE to match DB CHECK constraint
  }

  @Override
  public SprintStatus convertToEntityAttribute(String value) {
    if (value == null) return null;
    try {
      return SprintStatus.valueOf(value.toUpperCase());
    } catch (IllegalArgumentException e) {
      return SprintStatus.fromValue(value);
    }
  }
}
