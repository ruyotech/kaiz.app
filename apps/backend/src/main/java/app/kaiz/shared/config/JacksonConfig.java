package app.kaiz.shared.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

/**
 * Jackson configuration for JSON serialization/deserialization. Handles empty strings gracefully
 * for LocalDate and LocalTime types.
 */
@Configuration
public class JacksonConfig {

  @Bean
  @Primary
  public ObjectMapper objectMapper() {
    ObjectMapper mapper = new ObjectMapper();

    // Register Java 8 time module
    mapper.registerModule(new JavaTimeModule());
    mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    // Custom module for handling empty strings
    SimpleModule emptyStringModule = new SimpleModule();

    // LocalDate deserializer that handles empty strings
    emptyStringModule.addDeserializer(
        LocalDate.class,
        new JsonDeserializer<LocalDate>() {
          @Override
          public LocalDate deserialize(JsonParser p, DeserializationContext ctxt)
              throws IOException {
            String value = p.getValueAsString();
            if (value == null || value.trim().isEmpty()) {
              return null;
            }
            return LocalDate.parse(value, DateTimeFormatter.ISO_LOCAL_DATE);
          }
        });

    // LocalTime deserializer that handles empty strings
    emptyStringModule.addDeserializer(
        LocalTime.class,
        new JsonDeserializer<LocalTime>() {
          // Support both HH:mm and HH:mm:ss formats
          private final DateTimeFormatter formatter =
              DateTimeFormatter.ofPattern("[HH:mm:ss][HH:mm]");

          @Override
          public LocalTime deserialize(JsonParser p, DeserializationContext ctxt)
              throws IOException {
            String value = p.getValueAsString();
            if (value == null || value.trim().isEmpty()) {
              return null;
            }
            return LocalTime.parse(value, formatter);
          }
        });

    mapper.registerModule(emptyStringModule);

    return mapper;
  }
}
