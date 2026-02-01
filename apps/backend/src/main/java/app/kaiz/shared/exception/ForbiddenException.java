package app.kaiz.shared.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown when access to a resource is forbidden. Used when the user is authenticated but
 * doesn't have permission.
 */
public class ForbiddenException extends ApiException {

  public ForbiddenException(String message) {
    super(HttpStatus.FORBIDDEN, "FORBIDDEN", message);
  }

  /**
   * Create a forbidden exception with resource name and action. Use static factory method to avoid
   * constructor signature conflict.
   */
  public static ForbiddenException forAction(String resourceName, String action) {
    return new ForbiddenException(
        String.format("You don't have permission to %s this %s", action, resourceName));
  }
}
