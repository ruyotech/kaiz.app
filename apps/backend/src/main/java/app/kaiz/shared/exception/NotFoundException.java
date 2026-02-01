package app.kaiz.shared.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown when a requested resource is not found. Similar to ResourceNotFoundException but
 * with simpler constructors.
 */
public class NotFoundException extends ApiException {

  public NotFoundException(String message) {
    super(HttpStatus.NOT_FOUND, "NOT_FOUND", message);
  }

  public NotFoundException(String resourceName, String fieldName, Object fieldValue) {
    super(
        HttpStatus.NOT_FOUND,
        "NOT_FOUND",
        String.format("%s not found with %s: %s", resourceName, fieldName, fieldValue));
  }

  public NotFoundException(String resourceName, Object id) {
    super(
        HttpStatus.NOT_FOUND,
        "NOT_FOUND",
        String.format("%s not found with id: %s", resourceName, id));
  }
}
