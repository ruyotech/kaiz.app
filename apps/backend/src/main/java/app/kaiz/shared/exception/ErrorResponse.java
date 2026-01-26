package app.kaiz.shared.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
    boolean success,
    String code,
    String message,
    List<FieldError> errors,
    String path,
    Instant timestamp) {

  public ErrorResponse(String code, String message, String path) {
    this(false, code, message, null, path, Instant.now());
  }

  public ErrorResponse(String code, String message, List<FieldError> errors, String path) {
    this(false, code, message, errors, path, Instant.now());
  }

  public record FieldError(String field, String message, Object rejectedValue) {}
}
