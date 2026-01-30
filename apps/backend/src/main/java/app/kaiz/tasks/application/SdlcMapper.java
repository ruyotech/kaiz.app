package app.kaiz.tasks.application;

import app.kaiz.tasks.application.dto.*;
import app.kaiz.tasks.domain.*;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface SdlcMapper {

  // Sprint mappings
  SprintDto toSprintDto(Sprint sprint);

  List<SprintDto> toSprintDtoList(List<Sprint> sprints);

  // Epic mappings
  @Mapping(target = "lifeWheelAreaId", source = "lifeWheelArea.id")
  @Mapping(target = "targetSprintId", source = "targetSprint.id")
  @Mapping(target = "taskIds", expression = "java(mapTaskIds(epic.getTasks()))")
  EpicDto toEpicDto(Epic epic);

  List<EpicDto> toEpicDtoList(List<Epic> epics);

  default List<UUID> mapTaskIds(List<Task> tasks) {
    if (tasks == null) {
      return List.of();
    }
    return tasks.stream().map(Task::getId).toList();
  }

  // Task mappings
  @Mapping(target = "epicId", source = "epic.id")
  @Mapping(target = "epicTitle", source = "epic.title")
  @Mapping(target = "lifeWheelAreaId", source = "lifeWheelArea.id")
  @Mapping(target = "eisenhowerQuadrantId", source = "eisenhowerQuadrant.id")
  @Mapping(target = "sprintId", source = "sprint.id")
  @Mapping(target = "createdFromTemplateId", source = "createdFromTemplate.id")
  @Mapping(target = "recurrence", source = "recurrence")
  @Mapping(target = "tags", expression = "java(mapUserTagsToDto(task.getTags()))")
  @Mapping(target = "attachments", expression = "java(mapAttachmentsToDto(task.getAttachments()))")
  TaskDto toTaskDto(Task task);

  @Mapping(target = "epicId", source = "epic.id")
  @Mapping(target = "epicTitle", source = "epic.title")
  @Mapping(target = "lifeWheelAreaId", source = "lifeWheelArea.id")
  @Mapping(target = "eisenhowerQuadrantId", source = "eisenhowerQuadrant.id")
  @Mapping(target = "sprintId", source = "sprint.id")
  @Mapping(target = "createdFromTemplateId", source = "createdFromTemplate.id")
  @Mapping(target = "comments", ignore = true)
  @Mapping(target = "history", ignore = true)
  @Mapping(target = "recurrence", source = "recurrence")
  @Mapping(target = "tags", expression = "java(mapUserTagsToDto(task.getTags()))")
  @Mapping(target = "attachments", expression = "java(mapAttachmentsToDto(task.getAttachments()))")
  TaskDto toTaskDtoWithoutDetails(Task task);

  @IterableMapping(qualifiedByName = "toTaskDtoFull")
  List<TaskDto> toTaskDtoList(List<Task> tasks);

  @Named("toTaskDtoFull")
  @Mapping(target = "epicId", source = "epic.id")
  @Mapping(target = "epicTitle", source = "epic.title")
  @Mapping(target = "lifeWheelAreaId", source = "lifeWheelArea.id")
  @Mapping(target = "eisenhowerQuadrantId", source = "eisenhowerQuadrant.id")
  @Mapping(target = "sprintId", source = "sprint.id")
  @Mapping(target = "createdFromTemplateId", source = "createdFromTemplate.id")
  default TaskDto toTaskDtoForList(Task task) {
    return toTaskDtoWithoutDetails(task);
  }

  default List<TaskDto> toTaskDtoListWithoutDetails(List<Task> tasks) {
    if (tasks == null) {
      return List.of();
    }
    return tasks.stream().map(this::toTaskDtoWithoutDetails).toList();
  }

  // TaskRecurrence mappings
  TaskDto.RecurrenceDto toRecurrenceDto(TaskRecurrence recurrence);

  // UserTag to TagDto mappings
  default List<TaskDto.TagDto> mapUserTagsToDto(Set<UserTag> tags) {
    if (tags == null || tags.isEmpty()) {
      return List.of();
    }
    return tags.stream()
        .map(tag -> new TaskDto.TagDto(tag.getId(), tag.getName(), tag.getColor()))
        .collect(Collectors.toList());
  }

  // TaskAttachment to AttachmentDto mappings
  default List<TaskDto.AttachmentDto> mapAttachmentsToDto(List<TaskAttachment> attachments) {
    if (attachments == null || attachments.isEmpty()) {
      return List.of();
    }
    return attachments.stream()
        .map(
            att ->
                new TaskDto.AttachmentDto(
                    att.getId(),
                    att.getFilename(),
                    att.getFileUrl(),
                    att.getFileType(),
                    att.getFileSize(),
                    att.getCreatedAt()))
        .collect(Collectors.toList());
  }

  // TaskComment mappings
  @Mapping(target = "taskId", source = "task.id")
  @Mapping(target = "userId", source = "user.id")
  @Mapping(target = "userName", source = "user.fullName")
  @Mapping(
      target = "attachments",
      expression = "java(mapCommentAttachments(comment.getAttachments()))")
  TaskCommentDto toTaskCommentDto(TaskComment comment);

  List<TaskCommentDto> toTaskCommentDtoList(List<TaskComment> comments);

  /** Map comment attachments to DTOs */
  default List<TaskCommentDto.AttachmentDto> mapCommentAttachments(
      List<TaskCommentAttachment> attachments) {
    if (attachments == null) {
      return List.of();
    }
    return attachments.stream()
        .map(
            att ->
                new TaskCommentDto.AttachmentDto(
                    att.getId(),
                    att.getFilename(),
                    att.getFileUrl(),
                    att.getFileType(),
                    att.getFileSize(),
                    att.getCreatedAt()))
        .collect(Collectors.toList());
  }

  // TaskHistory mappings
  @Mapping(target = "taskId", source = "task.id")
  @Mapping(target = "changedByUserId", source = "changedByUser.id")
  @Mapping(target = "changedByUserName", source = "changedByUser.fullName")
  TaskHistoryDto toTaskHistoryDto(TaskHistory history);

  List<TaskHistoryDto> toTaskHistoryDtoList(List<TaskHistory> history);

  // TaskTemplate mappings (extended)
  @Mapping(target = "defaultLifeWheelAreaId", source = "defaultLifeWheelArea.id")
  @Mapping(target = "defaultEisenhowerQuadrantId", source = "defaultEisenhowerQuadrant.id")
  @Mapping(target = "userId", source = "user.id")
  @Mapping(target = "type", source = "type")
  @Mapping(target = "creatorType", source = "creatorType")
  @Mapping(
      target = "defaultAttendees",
      expression = "java(mapStringArrayToList(template.getDefaultAttendees()))")
  @Mapping(target = "recurrencePattern", expression = "java(mapRecurrencePattern(template))")
  @Mapping(target = "isFavorite", ignore = true) // Set by service based on user
  @Mapping(target = "userRating", ignore = true) // Set by service based on user
  @Mapping(target = "userTags", ignore = true) // Set by service based on user
  TaskTemplateDto toTaskTemplateDto(TaskTemplate template);

  List<TaskTemplateDto> toTaskTemplateDtoList(List<TaskTemplate> templates);

  // Helper methods for template mapping
  default List<String> mapStringArrayToList(String[] array) {
    if (array == null) {
      return List.of();
    }
    return Arrays.asList(array);
  }

  default TaskTemplateDto.RecurrencePatternDto mapRecurrencePattern(TaskTemplate template) {
    if (!template.isRecurring() || template.getRecurrenceFrequency() == null) {
      return null;
    }
    return new TaskTemplateDto.RecurrencePatternDto(
        template.getRecurrenceFrequency().name(),
        template.getRecurrenceInterval() != null ? template.getRecurrenceInterval() : 1,
        template.getRecurrenceEndDate());
  }

  // Enums to String
  default String mapTemplateType(TemplateType type) {
    return type != null ? type.name() : null;
  }

  default String mapCreatorType(CreatorType type) {
    return type != null ? type.name() : null;
  }

  default String mapSuggestedSprint(SuggestedSprint sprint) {
    return sprint != null ? sprint.name() : null;
  }
}
