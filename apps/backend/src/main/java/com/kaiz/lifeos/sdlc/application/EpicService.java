package com.kaiz.lifeos.sdlc.application;

import com.kaiz.lifeos.identity.domain.User;
import com.kaiz.lifeos.identity.infrastructure.UserRepository;
import com.kaiz.lifeos.lifewheel.infrastructure.LifeWheelAreaRepository;
import com.kaiz.lifeos.sdlc.application.dto.EpicDto;
import com.kaiz.lifeos.sdlc.domain.Epic;
import com.kaiz.lifeos.sdlc.domain.EpicStatus;
import com.kaiz.lifeos.sdlc.infrastructure.EpicRepository;
import com.kaiz.lifeos.sdlc.infrastructure.SprintRepository;
import com.kaiz.lifeos.shared.exception.ResourceNotFoundException;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EpicService {

  private final EpicRepository epicRepository;
  private final UserRepository userRepository;
  private final LifeWheelAreaRepository lifeWheelAreaRepository;
  private final SprintRepository sprintRepository;
  private final SdlcMapper sdlcMapper;

  public List<EpicDto> getEpicsByUserId(UUID userId) {
    return sdlcMapper.toEpicDtoList(epicRepository.findByUserIdOrderByCreatedAtDesc(userId));
  }

  public List<EpicDto> getEpicsByUserIdAndStatus(UUID userId, EpicStatus status) {
    return sdlcMapper.toEpicDtoList(
        epicRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, status));
  }

  public EpicDto getEpicById(UUID userId, UUID epicId) {
    Epic epic =
        epicRepository
            .findByIdAndUserIdWithTasks(epicId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Epic", epicId.toString()));
    return sdlcMapper.toEpicDto(epic);
  }

  @Transactional
  public EpicDto createEpic(UUID userId, EpicDto.CreateEpicRequest request) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

    var lifeWheelArea =
        lifeWheelAreaRepository
            .findById(request.lifeWheelAreaId())
            .orElseThrow(
                () -> new ResourceNotFoundException("LifeWheelArea", request.lifeWheelAreaId()));

    Epic epic =
        Epic.builder()
            .title(request.title())
            .description(request.description())
            .user(user)
            .lifeWheelArea(lifeWheelArea)
            .color(request.color() != null ? request.color() : "#3B82F6")
            .icon(request.icon())
            .status(EpicStatus.PLANNING)
            .build();

    if (request.targetSprintId() != null) {
      sprintRepository
          .findById(request.targetSprintId())
          .ifPresent(epic::setTargetSprint);
    }

    return sdlcMapper.toEpicDto(epicRepository.save(epic));
  }

  @Transactional
  public EpicDto updateEpic(UUID userId, UUID epicId, EpicDto.UpdateEpicRequest request) {
    Epic epic =
        epicRepository
            .findByIdAndUserId(epicId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Epic", epicId.toString()));

    if (request.title() != null) {
      epic.setTitle(request.title());
    }
    if (request.description() != null) {
      epic.setDescription(request.description());
    }
    if (request.lifeWheelAreaId() != null) {
      var lifeWheelArea =
          lifeWheelAreaRepository
              .findById(request.lifeWheelAreaId())
              .orElseThrow(
                  () -> new ResourceNotFoundException("LifeWheelArea", request.lifeWheelAreaId()));
      epic.setLifeWheelArea(lifeWheelArea);
    }
    if (request.targetSprintId() != null) {
      sprintRepository.findById(request.targetSprintId()).ifPresent(epic::setTargetSprint);
    }
    if (request.status() != null) {
      epic.setStatus(request.status());
    }
    if (request.color() != null) {
      epic.setColor(request.color());
    }
    if (request.icon() != null) {
      epic.setIcon(request.icon());
    }
    if (request.startDate() != null) {
      epic.setStartDate(request.startDate());
    }
    if (request.endDate() != null) {
      epic.setEndDate(request.endDate());
    }

    return sdlcMapper.toEpicDto(epicRepository.save(epic));
  }

  @Transactional
  public void deleteEpic(UUID userId, UUID epicId) {
    Epic epic =
        epicRepository
            .findByIdAndUserId(epicId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Epic", epicId.toString()));
    epicRepository.delete(epic);
  }
}
