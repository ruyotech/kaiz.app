package app.kaiz.tasks.domain;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class SprintStatusConverter implements AttributeConverter<SprintStatus, String> {

  @Override
  public String convertToDatabaseColumn(SprintStatus status) {
    return status == null ? null : status.getValue();
  }

  @Override
  public SprintStatus convertToEntityAttribute(String value) {
    return value == null ? null : SprintStatus.fromValue(value);
  }
}
