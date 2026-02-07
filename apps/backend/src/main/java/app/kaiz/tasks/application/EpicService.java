package app.kaiz.tasks.application;

import app.kaiz.identity.domain.User;
import app.kaiz.identity.infrastructure.UserRepository;
import app.kaiz.life_wheel.infrastructure.LifeWheelAreaRepository;
import app.kaiz.shared.exception.ResourceNotFoundException;
import app.kaiz.tasks.application.dto.EpicDto;
import app.kaiz.tasks.domain.Epic;
import app.kaiz.tasks.domain.EpicStatus;
import app.kaiz.tasks.infrastructure.EpicRepository;
import app.kaiz.tasks.infrastructure.SprintRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
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
      sprintRepository.findById(request.targetSprintId()).ifPresent(epic::setTargetSprint);
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
