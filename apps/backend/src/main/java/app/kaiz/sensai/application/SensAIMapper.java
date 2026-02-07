package app.kaiz.sensai.application;

import app.kaiz.sensai.application.dto.*;
import app.kaiz.sensai.domain.*;
import java.util.List;
import java.util.Map;
import org.mapstruct.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** MapStruct mapper for SensAI DTOs. */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface SensAIMapper {

  Logger log = LoggerFactory.getLogger(SensAIMapper.class);

  // DailyStandup mappings
  DailyStandupDto toDto(DailyStandup entity);

  List<DailyStandupDto> toStandupDtos(List<DailyStandup> entities);

  // Intervention mappings
  @Mapping(target = "dataContext", expression = "java(parseJsonToMap(entity.getDataContext()))")
  InterventionDto toDto(Intervention entity);

  List<InterventionDto> toInterventionDtos(List<Intervention> entities);

  // SprintCeremony mappings
  @Mapping(target = "outcomes", expression = "java(parseCeremonyOutcomes(entity.getOutcomes()))")
  @Mapping(target = "actionItems", expression = "java(parseJsonToList(entity.getActionItems()))")
  SprintCeremonyDto toDto(SprintCeremony entity);

  List<SprintCeremonyDto> toCeremonyDtos(List<SprintCeremony> entities);

  // VelocityRecord mappings
  @Mapping(
      target = "dimensionDistribution",
      expression = "java(parseJsonToIntMap(entity.getDimensionDistribution()))")
  VelocityDto toDto(VelocityRecord entity);

  List<VelocityDto> toVelocityDtos(List<VelocityRecord> entities);

  // SensAISettings mappings
  @Mapping(
      target = "dimensionPriorities",
      expression = "java(parseJsonToIntMap(entity.getDimensionPriorities()))")
  SensAISettingsDto toDto(SensAISettings entity);

  // Helper methods for JSON parsing - implemented in SensAIMapperImpl or via default methods
  default Map<String, Object> parseJsonToMap(String json) {
    if (json == null || json.isEmpty()) {
      return Map.of();
    }
    try {
      com.fasterxml.jackson.databind.ObjectMapper mapper =
          new com.fasterxml.jackson.databind.ObjectMapper();
      return mapper.readValue(
          json, new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});
    } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
      log.warn("Failed to parse JSON map: {}", e.getMessage());
      return Map.of();
    }
  }

  default Map<String, Integer> parseJsonToIntMap(String json) {
    if (json == null || json.isEmpty()) {
      return Map.of();
    }
    try {
      com.fasterxml.jackson.databind.ObjectMapper mapper =
          new com.fasterxml.jackson.databind.ObjectMapper();
      return mapper.readValue(
          json, new com.fasterxml.jackson.core.type.TypeReference<Map<String, Integer>>() {});
    } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
      log.warn("Failed to parse JSON int map: {}", e.getMessage());
      return Map.of();
    }
  }

  default List<String> parseJsonToList(String json) {
    if (json == null || json.isEmpty()) {
      return List.of();
    }
    try {
      com.fasterxml.jackson.databind.ObjectMapper mapper =
          new com.fasterxml.jackson.databind.ObjectMapper();
      return mapper.readValue(
          json, new com.fasterxml.jackson.core.type.TypeReference<List<String>>() {});
    } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
      log.warn("Failed to parse JSON list: {}", e.getMessage());
      return List.of();
    }
  }

  default SprintCeremonyDto.CeremonyOutcomes parseCeremonyOutcomes(String json) {
    if (json == null || json.isEmpty()) {
      return null;
    }
    try {
      com.fasterxml.jackson.databind.ObjectMapper mapper =
          new com.fasterxml.jackson.databind.ObjectMapper();
      return mapper.readValue(json, SprintCeremonyDto.CeremonyOutcomes.class);
    } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
      log.warn("Failed to parse ceremony outcomes: {}", e.getMessage());
      return null;
    }
  }

  default String toJson(Object obj) {
    if (obj == null) {
      return null;
    }
    try {
      com.fasterxml.jackson.databind.ObjectMapper mapper =
          new com.fasterxml.jackson.databind.ObjectMapper();
      return mapper.writeValueAsString(obj);
    } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
      log.warn("Failed to serialize to JSON: {}", e.getMessage());
      return null;
    }
  }
}
