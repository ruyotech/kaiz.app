package app.kaiz.shared.persistence;

import java.util.Optional;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@Configuration
public class AuditConfig {

  @Bean
  public AuditorAware<String> auditorProvider() {
    return () -> {
      Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
      if (authentication == null || !authentication.isAuthenticated()) {
        return Optional.of("system");
      }
      return Optional.of(authentication.getName());
    };
  }
}
