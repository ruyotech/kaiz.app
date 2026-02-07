package app.kaiz.shared.exception;

/** Exception thrown when AI processing encounters an error. */
public class AIProcessingException extends RuntimeException {

  public AIProcessingException(String message) {
    super(message);
  }

  public AIProcessingException(String message, Throwable cause) {
    super(message, cause);
  }
}
