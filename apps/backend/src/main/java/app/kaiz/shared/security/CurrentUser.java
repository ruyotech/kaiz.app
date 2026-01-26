package app.kaiz.shared.security;

import java.lang.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

/**
 * Annotation to inject the current user's ID from the JWT token into controller methods.
 *
 * <p>Usage: {@code @CurrentUser UUID userId}
 */
@Target({ElementType.PARAMETER, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@AuthenticationPrincipal(expression = "T(java.util.UUID).fromString(#this)")
public @interface CurrentUser {}
