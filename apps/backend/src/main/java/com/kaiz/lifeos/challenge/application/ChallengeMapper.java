package com.kaiz.lifeos.challenge.application;

import com.kaiz.lifeos.challenge.application.dto.*;
import com.kaiz.lifeos.challenge.domain.*;
import java.util.List;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface ChallengeMapper {

  // ChallengeTemplate mappings
  @Mapping(target = "lifeWheelAreaId", source = "lifeWheelArea.id")
  ChallengeTemplateDto toChallengeTemplateDto(ChallengeTemplate template);

  List<ChallengeTemplateDto> toChallengeTemplateDtoList(List<ChallengeTemplate> templates);

  // Challenge mappings
  @Mapping(target = "lifeWheelAreaId", source = "lifeWheelArea.id")
  @Mapping(target = "createdFromTemplateId", source = "createdFromTemplate.id")
  ChallengeDto toChallengeDto(Challenge challenge);

  @Mapping(target = "lifeWheelAreaId", source = "lifeWheelArea.id")
  @Mapping(target = "createdFromTemplateId", source = "createdFromTemplate.id")
  @Mapping(target = "participants", ignore = true)
  ChallengeDto toChallengeDtoWithoutParticipants(Challenge challenge);

  @IterableMapping(qualifiedByName = "toChallengeDtoForList")
  List<ChallengeDto> toChallengeDtoList(List<Challenge> challenges);

  @Named("toChallengeDtoForList")
  @Mapping(target = "lifeWheelAreaId", source = "lifeWheelArea.id")
  @Mapping(target = "createdFromTemplateId", source = "createdFromTemplate.id")
  @Mapping(target = "participants", ignore = true)
  default ChallengeDto toChallengeDtoForList(Challenge challenge) {
    return toChallengeDtoWithoutParticipants(challenge);
  }

  default List<ChallengeDto> toChallengeDtoListWithoutParticipants(List<Challenge> challenges) {
    if (challenges == null) {
      return List.of();
    }
    return challenges.stream().map(this::toChallengeDtoWithoutParticipants).toList();
  }

  // ChallengeParticipant mappings
  @Mapping(target = "challengeId", source = "challenge.id")
  @Mapping(target = "userId", source = "user.id")
  @Mapping(target = "userName", source = "user.fullName")
  ChallengeParticipantDto toChallengeParticipantDto(ChallengeParticipant participant);

  List<ChallengeParticipantDto> toChallengeParticipantDtoList(
      List<ChallengeParticipant> participants);

  // ChallengeEntry mappings
  @Mapping(target = "challengeId", source = "challenge.id")
  @Mapping(target = "userId", source = "user.id")
  ChallengeEntryDto toChallengeEntryDto(ChallengeEntry entry);

  List<ChallengeEntryDto> toChallengeEntryDtoList(List<ChallengeEntry> entries);
}
