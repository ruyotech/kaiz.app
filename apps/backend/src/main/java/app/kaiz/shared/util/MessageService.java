package app.kaiz.shared.util;

import java.util.Locale;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;

/**
 * MessageService - Utility service for accessing i18n messages
 *
 * <p>Provides convenient methods for retrieving translated messages from the MessageSource, using
 * the current request's locale.
 *
 * <p>Usage: ```java // Inject the service @Autowired private MessageService messageService;
 *
 * <p>// Get a message String message = messageService.get("auth.login.success");
 *
 * <p>// Get a message with parameters String message =
 * messageService.get("notification.task_reminder", taskName, dueDate); ```
 *
 * @author Kaiz Team
 * @version 1.0.0
 */
@Service
public class MessageService {

  private final MessageSource messageSource;

  public MessageService(MessageSource messageSource) {
    this.messageSource = messageSource;
  }

  /**
   * Get a message for the current locale
   *
   * @param code The message key (e.g., "auth.login.success")
   * @return The translated message
   */
  public String get(String code) {
    return messageSource.getMessage(code, null, getCurrentLocale());
  }

  /**
   * Get a message with parameters for the current locale
   *
   * @param code The message key
   * @param args Arguments to insert into the message placeholders
   * @return The translated message with parameters substituted
   */
  public String get(String code, Object... args) {
    return messageSource.getMessage(code, args, getCurrentLocale());
  }

  /**
   * Get a message for a specific locale
   *
   * @param code The message key
   * @param locale The locale to use
   * @return The translated message
   */
  public String get(String code, Locale locale) {
    return messageSource.getMessage(code, null, locale);
  }

  /**
   * Get a message with parameters for a specific locale
   *
   * @param code The message key
   * @param locale The locale to use
   * @param args Arguments to insert into the message placeholders
   * @return The translated message with parameters substituted
   */
  public String get(String code, Locale locale, Object... args) {
    return messageSource.getMessage(code, args, locale);
  }

  /**
   * Get a message with a default value if key is not found
   *
   * @param code The message key
   * @param defaultMessage The default message to return if key is not found
   * @return The translated message or the default
   */
  public String getOrDefault(String code, String defaultMessage) {
    return messageSource.getMessage(code, null, defaultMessage, getCurrentLocale());
  }

  /**
   * Get a message with parameters and a default value
   *
   * @param code The message key
   * @param defaultMessage The default message to return if key is not found
   * @param args Arguments to insert into the message placeholders
   * @return The translated message or the default
   */
  public String getOrDefault(String code, String defaultMessage, Object... args) {
    return messageSource.getMessage(code, args, defaultMessage, getCurrentLocale());
  }

  /**
   * Get the current locale from the request context
   *
   * @return The current locale
   */
  public Locale getCurrentLocale() {
    return LocaleContextHolder.getLocale();
  }

  // =========================================================================
  // Convenience methods for common message categories
  // =========================================================================

  /** Get an authentication-related message */
  public String auth(String key) {
    return get("auth." + key);
  }

  /** Get a task-related message */
  public String task(String key) {
    return get("task." + key);
  }

  /** Get a sprint-related message */
  public String sprint(String key) {
    return get("sprint." + key);
  }

  /** Get a validation message */
  public String validation(String key, Object... args) {
    return get("validation." + key, args);
  }

  /** Get a common/generic message */
  public String common(String key) {
    return get("common." + key);
  }
}
