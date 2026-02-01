package app.kaiz.shared.config;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.ReloadableResourceBundleMessageSource;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.i18n.AcceptHeaderLocaleResolver;
import org.springframework.web.servlet.i18n.LocaleChangeInterceptor;

/**
 * Internationalization (i18n) Configuration for Kaiz
 *
 * <p>Configures: - Message source for loading translations from properties files - Locale resolver
 * using Accept-Language header - Locale change interceptor for URL parameter switching
 *
 * <p>Supported locales: - English (en) - Default - Turkish (tr)
 *
 * @author Kaiz Team
 * @version 1.0.0
 */
@Configuration
public class I18nConfig implements WebMvcConfigurer {

  /** Supported locales in the application */
  private static final List<Locale> SUPPORTED_LOCALES =
      Arrays.asList(Locale.ENGLISH, new Locale("tr"));

  /** Default locale when no preference is specified */
  private static final Locale DEFAULT_LOCALE = Locale.ENGLISH;

  /** Configure MessageSource to load translations from messages*.properties files */
  @Bean
  public MessageSource messageSource() {
    ReloadableResourceBundleMessageSource messageSource =
        new ReloadableResourceBundleMessageSource();

    // Base name of the message files (without locale suffix and .properties)
    messageSource.setBasename("classpath:messages");

    // UTF-8 encoding for proper character handling (Turkish, etc.)
    messageSource.setDefaultEncoding(StandardCharsets.UTF_8.name());

    // Cache messages for 1 hour in production (0 for development to reload)
    messageSource.setCacheSeconds(3600);

    // Use message code as default message if key is not found
    messageSource.setUseCodeAsDefaultMessage(true);

    // Fall back to default locale if message not found for requested locale
    messageSource.setFallbackToSystemLocale(false);

    return messageSource;
  }

  /** Resolve locale from Accept-Language header Falls back to English if locale is not supported */
  @Bean
  public LocaleResolver localeResolver() {
    AcceptHeaderLocaleResolver resolver = new AcceptHeaderLocaleResolver();
    resolver.setDefaultLocale(DEFAULT_LOCALE);
    resolver.setSupportedLocales(SUPPORTED_LOCALES);
    return resolver;
  }

  /**
   * Allow changing locale via URL parameter (?lang=tr) Useful for testing and explicit user
   * selection
   */
  @Bean
  public LocaleChangeInterceptor localeChangeInterceptor() {
    LocaleChangeInterceptor interceptor = new LocaleChangeInterceptor();
    interceptor.setParamName("lang");
    return interceptor;
  }

  /** Register the locale change interceptor */
  @Override
  public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(localeChangeInterceptor());
  }
}
