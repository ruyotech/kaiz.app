package app.kaiz.tasks.application;

import app.kaiz.identity.domain.User;
import app.kaiz.identity.infrastructure.UserRepository;
import app.kaiz.life_wheel.infrastructure.EisenhowerQuadrantRepository;
import app.kaiz.life_wheel.infrastructure.LifeWheelAreaRepository;
import app.kaiz.shared.exception.ResourceNotFoundException;
import app.kaiz.tasks.application.dto.TaskCommentDto;
import app.kaiz.tasks.application.dto.TaskDto;
import app.kaiz.tasks.application.dto.TaskHistoryDto;
import app.kaiz.tasks.domain.*;
import app.kaiz.tasks.infrastructure.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class TaskService {

  private final TaskRepository taskRepository;
  private final TaskCommentRepository taskCommentRepository;
  private final TaskCommentAttachmentRepository taskCommentAttachmentRepository;
  private final TaskHistoryRepository taskHistoryRepository;
  private final TaskTemplateRepository taskTemplateRepository;
  private final TaskRecurrenceRepository taskRecurrenceRepository;
  private final TaskAttachmentRepository taskAttachmentRepository;
  private final UserTagRepository userTagRepository;
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
    // Get tasks directly assigned to this sprint
    List<Task> sprintTasks =
        taskRepository.findByUserIdAndSprintIdOrderByCreatedAtDesc(userId, sprintId);

    // Get the sprint to find its date range
    var sprintOpt = sprintRepository.findById(sprintId);
    if (sprintOpt.isEmpty()) {
      return sdlcMapper.toTaskDtoListWithoutDetails(sprintTasks);
    }

    var sprint = sprintOpt.get();

    // Get recurring tasks that overlap with this sprint's date range
    List<Task> recurringTasks =
        taskRepository.findRecurringTasksForDateRange(
            userId, sprint.getStartDate(), sprint.getEndDate());

    // Combine both lists, avoiding duplicates (in case a recurring task is also assigned to sprint)
    Set<UUID> sprintTaskIds = new HashSet<>();
    for (Task t : sprintTasks) {
      sprintTaskIds.add(t.getId());
    }

    List<Task> combinedTasks = new ArrayList<>(sprintTasks);
    for (Task recurringTask : recurringTasks) {
      if (!sprintTaskIds.contains(recurringTask.getId())) {
        combinedTasks.add(recurringTask);
      }
    }

    return sdlcMapper.toTaskDtoListWithoutDetails(combinedTasks);
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

    // Determine status - use provided status or default based on context
    TaskStatus status = request.status() != null ? request.status() : TaskStatus.TODO;

    Task task =
        Task.builder()
            .title(request.title())
            .description(request.description())
            .user(user)
            .lifeWheelArea(lifeWheelArea)
            .eisenhowerQuadrant(eisenhowerQuadrant)
            .storyPoints(request.storyPoints() != null ? request.storyPoints() : 3)
            .aiConfidence(request.aiConfidence())
            .status(status)
            .targetDate(request.targetDate())
            .isRecurring(request.isRecurring())
            .isEvent(request.isEvent())
            .location(request.location())
            .isAllDay(request.isAllDay())
            .eventStartTime(request.eventStartTime())
            .eventEndTime(request.eventEndTime())
            .build();

    // Set epic if provided
    if (request.epicId() != null) {
      epicRepository.findByIdAndUserId(request.epicId(), userId).ifPresent(task::setEpic);
    }

    // Set sprint if provided (only for non-recurring tasks)
    if (request.sprintId() != null && !request.isRecurring()) {
      sprintRepository.findById(request.sprintId()).ifPresent(task::setSprint);
    }

    // Set created from template if provided
    if (request.createdFromTemplateId() != null) {
      taskTemplateRepository
          .findById(request.createdFromTemplateId())
          .ifPresent(task::setCreatedFromTemplate);
    }

    // Save the task first to get an ID
    Task savedTask = taskRepository.save(task);

    // Handle recurrence if task is recurring
    if (request.isRecurring() && request.recurrence() != null) {
      TaskRecurrence recurrence =
          TaskRecurrence.builder()
              .task(savedTask)
              .frequency(request.recurrence().frequency())
              .intervalValue(
                  request.recurrence().intervalValue() != null
                      ? request.recurrence().intervalValue()
                      : 1)
              .startDate(request.recurrence().startDate())
              .endDate(request.recurrence().endDate())
              .dayOfWeek(request.recurrence().dayOfWeek())
              .dayOfMonth(request.recurrence().dayOfMonth())
              .yearlyDate(request.recurrence().yearlyDate())
              .scheduledTime(request.recurrence().scheduledTime())
              .scheduledEndTime(request.recurrence().scheduledEndTime())
              .isActive(true)
              .build();
      taskRecurrenceRepository.save(recurrence);
      savedTask.setRecurrence(recurrence);
    }

    // Handle tags - find or create user tags
    if (request.tags() != null && !request.tags().isEmpty()) {
      Set<UserTag> taskTags = new HashSet<>();
      for (String tagName : request.tags()) {
        String normalizedTagName = tagName.trim().toLowerCase();
        if (normalizedTagName.isEmpty()) continue;

        UserTag tag =
            userTagRepository
                .findByUserIdAndName(userId, normalizedTagName)
                .orElseGet(
                    () -> {
                      UserTag newTag = UserTag.builder().user(user).name(normalizedTagName).build();
                      return userTagRepository.save(newTag);
                    });
        tag.incrementUsage();
        taskTags.add(tag);
      }
      savedTask.setTags(taskTags);
    }

    // Handle attachments
    if (request.attachments() != null && !request.attachments().isEmpty()) {
      List<TaskAttachment> attachments = new ArrayList<>();
      for (TaskDto.AttachmentRequest attReq : request.attachments()) {
        TaskAttachment attachment =
            TaskAttachment.builder()
                .task(savedTask)
                .filename(attReq.filename())
                .fileUrl(attReq.fileUrl())
                .fileType(attReq.fileType())
                .fileSize(attReq.fileSize())
                .uploadedBy(user)
                .build();
        attachments.add(attachment);
      }
      taskAttachmentRepository.saveAll(attachments);
      savedTask.setAttachments(attachments);
    }

    // Handle initial comment
    if (request.comment() != null && !request.comment().trim().isEmpty()) {
      TaskComment comment =
          TaskComment.builder()
              .task(savedTask)
              .user(user)
              .commentText(request.comment().trim())
              .isAiGenerated(false)
              .build();
      taskCommentRepository.save(comment);
    }

    // Record creation in history
    recordHistory(savedTask, user, "status", null, status.name());

    return sdlcMapper.toTaskDto(savedTask);
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
                  () -> new ResourceNotFoundException("LifeWheelArea", request.lifeWheelAreaId()));
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

    // Update target date
    if (request.targetDate() != null) {
      task.setTargetDate(request.targetDate());
    }

    // Update event fields
    if (request.location() != null) {
      task.setLocation(request.location());
    }
    task.setAllDay(request.isAllDay());
    if (request.eventStartTime() != null) {
      task.setEventStartTime(request.eventStartTime());
    }
    if (request.eventEndTime() != null) {
      task.setEventEndTime(request.eventEndTime());
    }

    // Update tags if provided
    if (request.tags() != null) {
      // Decrement usage on old tags
      for (UserTag oldTag : task.getTags()) {
        oldTag.decrementUsage();
      }

      // Set new tags
      Set<UserTag> newTags = new HashSet<>();
      for (String tagName : request.tags()) {
        String normalizedTagName = tagName.trim().toLowerCase();
        if (normalizedTagName.isEmpty()) continue;

        UserTag tag =
            userTagRepository
                .findByUserIdAndName(userId, normalizedTagName)
                .orElseGet(
                    () -> {
                      UserTag newTag = UserTag.builder().user(user).name(normalizedTagName).build();
                      return userTagRepository.save(newTag);
                    });
        tag.incrementUsage();
        newTags.add(tag);
      }
      task.setTags(newTags);
    }

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

    return sdlcMapper.toTaskHistoryDtoList(
        taskHistoryRepository.findByTaskIdOrderByCreatedAtDesc(taskId));
  }

  public List<TaskCommentDto> getTaskComments(UUID userId, UUID taskId) {
    // Verify user owns the task
    taskRepository
        .findByIdAndUserId(taskId, userId)
        .orElseThrow(() -> new ResourceNotFoundException("Task", taskId.toString()));

    return sdlcMapper.toTaskCommentDtoList(
        taskCommentRepository.findByTaskIdWithAttachmentsOrderByCreatedAtAsc(taskId));
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

    TaskComment savedComment = taskCommentRepository.save(comment);

    // Handle attachments if provided
    if (request.attachments() != null && !request.attachments().isEmpty()) {
      List<TaskCommentAttachment> attachments = new ArrayList<>();
      for (TaskCommentDto.AttachmentRequest attReq : request.attachments()) {
        TaskCommentAttachment attachment =
            TaskCommentAttachment.builder()
                .comment(savedComment)
                .filename(attReq.filename())
                .fileUrl(attReq.fileUrl())
                .fileType(attReq.fileType())
                .fileSize(attReq.fileSize())
                .build();
        attachments.add(attachment);
      }
      taskCommentAttachmentRepository.saveAll(attachments);
      savedComment.setAttachments(attachments);
    }

    // Record in history that a comment was added
    recordHistory(task, user, "comment", null, "Comment added");

    return sdlcMapper.toTaskCommentDto(savedComment);
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
