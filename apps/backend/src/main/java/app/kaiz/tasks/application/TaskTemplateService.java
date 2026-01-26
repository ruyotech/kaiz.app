package app.kaiz.tasks.application;

import app.kaiz.identity.domain.User;
import app.kaiz.identity.infrastructure.UserRepository;
import app.kaiz.life_wheel.infrastructure.EisenhowerQuadrantRepository;
import app.kaiz.life_wheel.infrastructure.LifeWheelAreaRepository;
import app.kaiz.tasks.application.dto.TaskTemplateDto;
import app.kaiz.tasks.domain.TaskTemplate;
import app.kaiz.tasks.infrastructure.TaskTemplateRepository;
import app.kaiz.shared.exception.ResourceNotFoundException;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TaskTemplateService {

  private final TaskTemplateRepository taskTemplateRepository;
  private final UserRepository userRepository;
  private final LifeWheelAreaRepository lifeWheelAreaRepository;
  private final EisenhowerQuadrantRepository eisenhowerQuadrantRepository;
  private final SdlcMapper sdlcMapper;

  public List<TaskTemplateDto> getTemplatesByUserId(UUID userId) {
    return sdlcMapper.toTaskTemplateDtoList(
        taskTemplateRepository.findByUserIdOrderByNameAsc(userId));
  }

  public TaskTemplateDto getTemplateById(UUID userId, UUID templateId) {
    TaskTemplate template =
        taskTemplateRepository
            .findByIdAndUserId(templateId, userId)
            .orElseThrow(
                () -> new ResourceNotFoundException("TaskTemplate", templateId.toString()));
    return sdlcMapper.toTaskTemplateDto(template);
  }

  @Transactional
  public TaskTemplateDto createTemplate(
      UUID userId, TaskTemplateDto.CreateTaskTemplateRequest request) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

    TaskTemplate template =
        TaskTemplate.builder()
            .name(request.name())
            .description(request.description())
            .user(user)
            .defaultStoryPoints(
                request.defaultStoryPoints() != null ? request.defaultStoryPoints() : 3)
            .build();

    if (request.defaultLifeWheelAreaId() != null) {
      lifeWheelAreaRepository
          .findById(request.defaultLifeWheelAreaId())
          .ifPresent(template::setDefaultLifeWheelArea);
    }

    if (request.defaultEisenhowerQuadrantId() != null) {
      eisenhowerQuadrantRepository
          .findById(request.defaultEisenhowerQuadrantId())
          .ifPresent(template::setDefaultEisenhowerQuadrant);
    }

    return sdlcMapper.toTaskTemplateDto(taskTemplateRepository.save(template));
  }

  @Transactional
  public TaskTemplateDto updateTemplate(
      UUID userId, UUID templateId, TaskTemplateDto.UpdateTaskTemplateRequest request) {
    TaskTemplate template =
        taskTemplateRepository
            .findByIdAndUserId(templateId, userId)
            .orElseThrow(
                () -> new ResourceNotFoundException("TaskTemplate", templateId.toString()));

    if (request.name() != null) {
      template.setName(request.name());
    }
    if (request.description() != null) {
      template.setDescription(request.description());
    }
    if (request.defaultStoryPoints() != null) {
      template.setDefaultStoryPoints(request.defaultStoryPoints());
    }
    if (request.defaultLifeWheelAreaId() != null) {
      lifeWheelAreaRepository
          .findById(request.defaultLifeWheelAreaId())
          .ifPresent(template::setDefaultLifeWheelArea);
    }
    if (request.defaultEisenhowerQuadrantId() != null) {
      eisenhowerQuadrantRepository
          .findById(request.defaultEisenhowerQuadrantId())
          .ifPresent(template::setDefaultEisenhowerQuadrant);
    }

    return sdlcMapper.toTaskTemplateDto(taskTemplateRepository.save(template));
  }

  @Transactional
  public void deleteTemplate(UUID userId, UUID templateId) {
    TaskTemplate template =
        taskTemplateRepository
            .findByIdAndUserId(templateId, userId)
            .orElseThrow(
                () -> new ResourceNotFoundException("TaskTemplate", templateId.toString()));
    taskTemplateRepository.delete(template);
  }
}
