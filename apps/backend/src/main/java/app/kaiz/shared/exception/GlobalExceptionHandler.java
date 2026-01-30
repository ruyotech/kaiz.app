package app.kaiz.shared.exception;

import app.kaiz.command_center.domain.AIProcessingException;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

  @ExceptionHandler(ApiException.class)
  public ResponseEntity<ErrorResponse> handleApiException(
      ApiException ex, HttpServletRequest request) {
    log.warn("API Exception: {} - {}", ex.getCode(), ex.getMessage());
    ErrorResponse response =
        new ErrorResponse(ex.getCode(), ex.getMessage(), request.getRequestURI());
    return ResponseEntity.status(ex.getStatus()).body(response);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ErrorResponse> handleValidationException(
      MethodArgumentNotValidException ex, HttpServletRequest request) {
    List<ErrorResponse.FieldError> fieldErrors =
        ex.getBindingResult().getFieldErrors().stream().map(this::mapFieldError).toList();

    log.warn("Validation failed: {} errors", fieldErrors.size());
    ErrorResponse response =
        new ErrorResponse(
            "VALIDATION_ERROR", "Validation failed", fieldErrors, request.getRequestURI());
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
  }

  @ExceptionHandler(MethodArgumentTypeMismatchException.class)
  public ResponseEntity<ErrorResponse> handleTypeMismatch(
      MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
    String message =
        String.format("Invalid value '%s' for parameter '%s'", ex.getValue(), ex.getName());
    log.warn("Type mismatch: {}", message);
    ErrorResponse response = new ErrorResponse("TYPE_MISMATCH", message, request.getRequestURI());
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
  }

  @ExceptionHandler(BadCredentialsException.class)
  public ResponseEntity<ErrorResponse> handleBadCredentials(
      BadCredentialsException ex, HttpServletRequest request) {
    log.warn("Bad credentials attempt");
    ErrorResponse response =
        new ErrorResponse(
            "INVALID_CREDENTIALS", "Invalid email or password", request.getRequestURI());
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
  }

  @ExceptionHandler(AuthenticationException.class)
  public ResponseEntity<ErrorResponse> handleAuthenticationException(
      AuthenticationException ex, HttpServletRequest request) {
    log.warn("Authentication failed: {}", ex.getMessage());
    ErrorResponse response =
        new ErrorResponse(
            "AUTHENTICATION_FAILED", "Authentication failed", request.getRequestURI());
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
  }

  @ExceptionHandler(AccessDeniedException.class)
  public ResponseEntity<ErrorResponse> handleAccessDenied(
      AccessDeniedException ex, HttpServletRequest request) {
    log.warn("Access denied: {}", request.getRequestURI());
    ErrorResponse response =
        new ErrorResponse("ACCESS_DENIED", "Access denied", request.getRequestURI());
    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
  }

  @ExceptionHandler(AIProcessingException.class)
  public ResponseEntity<ErrorResponse> handleAIProcessingException(
      AIProcessingException ex, HttpServletRequest request) {
    log.error("🤖 [AI] Processing error: {}", ex.getMessage(), ex);
    ErrorResponse response =
        new ErrorResponse("AI_PROCESSING_ERROR", ex.getMessage(), request.getRequestURI());
    return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErrorResponse> handleGenericException(
      Exception ex, HttpServletRequest request) {
    log.error("Unexpected error occurred", ex);
    ErrorResponse response =
        new ErrorResponse(
            "INTERNAL_ERROR", "An unexpected error occurred", request.getRequestURI());
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
  }

  private ErrorResponse.FieldError mapFieldError(FieldError fieldError) {
    return new ErrorResponse.FieldError(
        fieldError.getField(), fieldError.getDefaultMessage(), fieldError.getRejectedValue());
  }
}
