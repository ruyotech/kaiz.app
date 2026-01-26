package app.kaiz.tasks.application;

import app.kaiz.tasks.application.dto.*;
import app.kaiz.tasks.domain.*;
import java.util.List;
import java.util.UUID;
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
  TaskDto toTaskDto(Task task);

  @Mapping(target = "epicId", source = "epic.id")
  @Mapping(target = "epicTitle", source = "epic.title")
  @Mapping(target = "lifeWheelAreaId", source = "lifeWheelArea.id")
  @Mapping(target = "eisenhowerQuadrantId", source = "eisenhowerQuadrant.id")
  @Mapping(target = "sprintId", source = "sprint.id")
  @Mapping(target = "createdFromTemplateId", source = "createdFromTemplate.id")
  @Mapping(target = "comments", ignore = true)
  @Mapping(target = "history", ignore = true)
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

  // TaskComment mappings
  @Mapping(target = "taskId", source = "task.id")
  @Mapping(target = "userId", source = "user.id")
  @Mapping(target = "userName", source = "user.fullName")
  TaskCommentDto toTaskCommentDto(TaskComment comment);

  List<TaskCommentDto> toTaskCommentDtoList(List<TaskComment> comments);

  // TaskHistory mappings
  @Mapping(target = "taskId", source = "task.id")
  @Mapping(target = "changedByUserId", source = "changedByUser.id")
  @Mapping(target = "changedByUserName", source = "changedByUser.fullName")
  TaskHistoryDto toTaskHistoryDto(TaskHistory history);

  List<TaskHistoryDto> toTaskHistoryDtoList(List<TaskHistory> history);

  // TaskTemplate mappings
  @Mapping(target = "defaultLifeWheelAreaId", source = "defaultLifeWheelArea.id")
  @Mapping(target = "defaultEisenhowerQuadrantId", source = "defaultEisenhowerQuadrant.id")
  TaskTemplateDto toTaskTemplateDto(TaskTemplate template);

  List<TaskTemplateDto> toTaskTemplateDtoList(List<TaskTemplate> templates);
}
