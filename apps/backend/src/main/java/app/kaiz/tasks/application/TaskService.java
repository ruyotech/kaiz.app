package app.kaiz.tasks.application;

import app.kaiz.identity.domain.User;
import app.kaiz.identity.infrastructure.UserRepository;
import app.kaiz.life_wheel.infrastructure.EisenhowerQuadrantRepository;
import app.kaiz.life_wheel.infrastructure.LifeWheelAreaRepository;
import app.kaiz.tasks.application.dto.TaskCommentDto;
import app.kaiz.tasks.application.dto.TaskDto;
import app.kaiz.tasks.application.dto.TaskHistoryDto;
import app.kaiz.tasks.domain.*;
import app.kaiz.tasks.infrastructure.*;
import app.kaiz.shared.exception.ResourceNotFoundException;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TaskService {

  private final TaskRepository taskRepository;
  private final TaskCommentRepository taskCommentRepository;
  private final TaskHistoryRepository taskHistoryRepository;
  private final TaskTemplateRepository taskTemplateRepository;
  private final EpicRepository epicRepository;
  private final SprintRepository sprintRepository;
  private final UserRepository userRepository;
  private final LifeWheelAreaRepository lifeWheelAreaRepository;
  private final EisenhowerQuadrantRepository eisenhowerQuadrantRepository;
  private final SdlcMapper sdlcMapper;

  public List<TaskDto> getTasksByUserId(UUID userId) {
    return sdlcMapper.toTaskDtoListWithoutDetails(
        taskRepository.findByUserIdOrderByCreatedAtDesc(userId));
  }

  public Page<TaskDto> getTasksByUserId(UUID userId, Pageable pageable) {
    return taskRepository.findByUserId(userId, pageable).map(sdlcMapper::toTaskDtoWithoutDetails);
  }

  public List<TaskDto> getTasksBySprintId(UUID userId, String sprintId) {
    return sdlcMapper.toTaskDtoListWithoutDetails(
        taskRepository.findByUserIdAndSprintIdOrderByCreatedAtDesc(userId, sprintId));
  }

  public List<TaskDto> getTasksByEpicId(UUID userId, UUID epicId) {
    return sdlcMapper.toTaskDtoListWithoutDetails(
        taskRepository.findByUserIdAndEpicIdOrderByCreatedAtDesc(userId, epicId));
  }

  public List<TaskDto> getTasksByStatus(UUID userId, TaskStatus status) {
    return sdlcMapper.toTaskDtoListWithoutDetails(
        taskRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, status));
  }

  public List<TaskDto> getDraftTasks(UUID userId) {
    return sdlcMapper.toTaskDtoListWithoutDetails(taskRepository.findDraftsByUserId(userId));
  }

  public List<TaskDto> getBacklogTasks(UUID userId) {
    return sdlcMapper.toTaskDtoListWithoutDetails(taskRepository.findBacklogByUserId(userId));
  }

  public TaskDto getTaskById(UUID userId, UUID taskId) {
    Task task =
        taskRepository
            .findByIdAndUserIdWithDetails(taskId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Task", taskId.toString()));
    return sdlcMapper.toTaskDto(task);
  }

  @Transactional
  public TaskDto createTask(UUID userId, TaskDto.CreateTaskRequest request) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

    var lifeWheelArea =
        lifeWheelAreaRepository
            .findById(request.lifeWheelAreaId())
            .orElseThrow(
                () -> new ResourceNotFoundException("LifeWheelArea", request.lifeWheelAreaId()));

    var eisenhowerQuadrant =
        eisenhowerQuadrantRepository
            .findById(request.eisenhowerQuadrantId())
            .orElseThrow(
                () ->
                    new ResourceNotFoundException(
                        "EisenhowerQuadrant", request.eisenhowerQuadrantId()));

    Task task =
        Task.builder()
            .title(request.title())
            .description(request.description())
            .user(user)
            .lifeWheelArea(lifeWheelArea)
            .eisenhowerQuadrant(eisenhowerQuadrant)
            .storyPoints(request.storyPoints() != null ? request.storyPoints() : 3)
            .isDraft(request.isDraft())
            .aiConfidence(request.aiConfidence())
            .status(request.isDraft() ? TaskStatus.DRAFT : TaskStatus.TODO)
            .build();

    if (request.epicId() != null) {
      epicRepository.findByIdAndUserId(request.epicId(), userId).ifPresent(task::setEpic);
    }

    if (request.sprintId() != null) {
      sprintRepository.findById(request.sprintId()).ifPresent(task::setSprint);
    }

    if (request.createdFromTemplateId() != null) {
      taskTemplateRepository
          .findByIdAndUserId(request.createdFromTemplateId(), userId)
          .ifPresent(task::setCreatedFromTemplate);
    }

    return sdlcMapper.toTaskDto(taskRepository.save(task));
  }

  @Transactional
  public TaskDto updateTask(UUID userId, UUID taskId, TaskDto.UpdateTaskRequest request) {
    Task task =
        taskRepository
            .findByIdAndUserId(taskId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Task", taskId.toString()));

    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

    if (request.title() != null && !request.title().equals(task.getTitle())) {
      recordHistory(task, user, "title", task.getTitle(), request.title());
      task.setTitle(request.title());
    }

    if (request.description() != null) {
      task.setDescription(request.description());
    }

    if (request.epicId() != null) {
      epicRepository.findByIdAndUserId(request.epicId(), userId).ifPresent(task::setEpic);
    }

    if (request.lifeWheelAreaId() != null) {
      var lifeWheelArea =
          lifeWheelAreaRepository
              .findById(request.lifeWheelAreaId())
              .orElseThrow(
                  () ->
                      new ResourceNotFoundException("LifeWheelArea", request.lifeWheelAreaId()));
      if (!lifeWheelArea.getId().equals(task.getLifeWheelArea().getId())) {
        recordHistory(
            task, user, "lifeWheelAreaId", task.getLifeWheelArea().getId(), lifeWheelArea.getId());
        task.setLifeWheelArea(lifeWheelArea);
      }
    }

    if (request.eisenhowerQuadrantId() != null) {
      var quadrant =
          eisenhowerQuadrantRepository
              .findById(request.eisenhowerQuadrantId())
              .orElseThrow(
                  () ->
                      new ResourceNotFoundException(
                          "EisenhowerQuadrant", request.eisenhowerQuadrantId()));
      if (!quadrant.getId().equals(task.getEisenhowerQuadrant().getId())) {
        recordHistory(
            task,
            user,
            "eisenhowerQuadrantId",
            task.getEisenhowerQuadrant().getId(),
            quadrant.getId());
        task.setEisenhowerQuadrant(quadrant);
      }
    }

    if (request.sprintId() != null) {
      sprintRepository.findById(request.sprintId()).ifPresent(task::setSprint);
    }

    if (request.storyPoints() != null && request.storyPoints() != task.getStoryPoints()) {
      recordHistory(
          task,
          user,
          "storyPoints",
          String.valueOf(task.getStoryPoints()),
          String.valueOf(request.storyPoints()));
      task.setStoryPoints(request.storyPoints());
    }

    if (request.status() != null && request.status() != task.getStatus()) {
      recordHistory(task, user, "status", task.getStatus().name(), request.status().name());
      task.setStatus(request.status());
      if (request.status() == TaskStatus.DONE) {
        task.setCompletedAt(Instant.now());
      } else {
        task.setCompletedAt(null);
      }
    }

    task.setDraft(request.isDraft());

    return sdlcMapper.toTaskDto(taskRepository.save(task));
  }

  @Transactional
  public TaskDto updateTaskStatus(UUID userId, UUID taskId, TaskStatus newStatus) {
    Task task =
        taskRepository
            .findByIdAndUserId(taskId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Task", taskId.toString()));

    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

    if (task.getStatus() != newStatus) {
      recordHistory(task, user, "status", task.getStatus().name(), newStatus.name());
      task.setStatus(newStatus);
      if (newStatus == TaskStatus.DONE) {
        task.setCompletedAt(Instant.now());
      } else {
        task.setCompletedAt(null);
      }
    }

    return sdlcMapper.toTaskDto(taskRepository.save(task));
  }

  @Transactional
  public void deleteTask(UUID userId, UUID taskId) {
    Task task =
        taskRepository
            .findByIdAndUserId(taskId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Task", taskId.toString()));
    taskRepository.delete(task);
  }

  public List<TaskHistoryDto> getTaskHistory(UUID userId, UUID taskId) {
    // Verify user owns the task
    taskRepository
        .findByIdAndUserId(taskId, userId)
        .orElseThrow(() -> new ResourceNotFoundException("Task", taskId.toString()));

    return sdlcMapper.toTaskHistoryDtoList(taskHistoryRepository.findByTaskIdOrderByCreatedAtDesc(taskId));
  }

  public List<TaskCommentDto> getTaskComments(UUID userId, UUID taskId) {
    // Verify user owns the task
    taskRepository
        .findByIdAndUserId(taskId, userId)
        .orElseThrow(() -> new ResourceNotFoundException("Task", taskId.toString()));

    return sdlcMapper.toTaskCommentDtoList(taskCommentRepository.findByTaskIdOrderByCreatedAtAsc(taskId));
  }

  @Transactional
  public TaskCommentDto addComment(
      UUID userId, UUID taskId, TaskCommentDto.CreateTaskCommentRequest request) {
    Task task =
        taskRepository
            .findByIdAndUserId(taskId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Task", taskId.toString()));

    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

    TaskComment comment =
        TaskComment.builder()
            .task(task)
            .user(user)
            .commentText(request.commentText())
            .isAiGenerated(request.isAiGenerated())
            .build();

    return sdlcMapper.toTaskCommentDto(taskCommentRepository.save(comment));
  }

  private void recordHistory(Task task, User user, String field, String oldValue, String newValue) {
    TaskHistory history =
        TaskHistory.builder()
            .task(task)
            .changedByUser(user)
            .fieldName(field)
            .oldValue(oldValue)
            .newValue(newValue)
            .build();
    taskHistoryRepository.save(history);
  }
}
