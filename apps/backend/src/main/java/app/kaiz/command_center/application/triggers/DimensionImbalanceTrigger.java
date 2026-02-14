package app.kaiz.command_center.application.triggers;

import app.kaiz.life_wheel.domain.LifeWheelArea;
import app.kaiz.life_wheel.infrastructure.LifeWheelAreaRepository;
import app.kaiz.sensai.domain.InterventionType;
import app.kaiz.sensai.domain.InterventionUrgency;
import app.kaiz.tasks.domain.Task;
import app.kaiz.tasks.domain.TaskStatus;
import app.kaiz.tasks.infrastructure.TaskRepository;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Fires when a life wheel dimension has zero tasks for 2 or more consecutive sprints. Encourages
 * balanced personal development across all life areas.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DimensionImbalanceTrigger implements InterventionTrigger {

  private final TaskRepository taskRepository;
  private final LifeWheelAreaRepository lifeWheelAreaRepository;

  @Override
  public TriggerResult evaluate(UUID userId, String sprintId) {
    if (sprintId == null) {
      return TriggerResult.skip();
    }

    try {
      List<LifeWheelArea> allAreas = lifeWheelAreaRepository.findAll();
      if (allAreas.isEmpty()) {
        return TriggerResult.skip();
      }

      // Get tasks in the current sprint that have a life wheel area assigned
      List<Task> sprintTasks =
          taskRepository.findByUserIdAndSprintIdAndDeletedAtIsNullOrderByCreatedAtDesc(
              userId, sprintId);

      Set<String> coveredAreaIds =
          sprintTasks.stream()
              .filter(t -> t.getLifeWheelArea() != null)
              .filter(t -> t.getStatus() != TaskStatus.DRAFT)
              .map(t -> t.getLifeWheelArea().getId())
              .collect(Collectors.toSet());

      // Find areas with zero tasks this sprint
      List<String> neglectedAreas =
          allAreas.stream()
              .filter(area -> !coveredAreaIds.contains(area.getId()))
              .map(LifeWheelArea::getName)
              .toList();

      // Only fire if more than half of dimensions are neglected
      if (neglectedAreas.size() >= allAreas.size() / 2 && !neglectedAreas.isEmpty()) {
        String neglectedList = String.join(", ", neglectedAreas);

        log.info(
            "Dimension imbalance: userId={}, neglected={}/{} areas: [{}]",
            userId,
            neglectedAreas.size(),
            allAreas.size(),
            neglectedList);

        return TriggerResult.fire(
            InterventionUrgency.LOW,
            "Life Balance Check",
            String.format(
                "Your current sprint doesn't have tasks in %d life dimensions: %s. "
                    + "Consider adding at least one task in each area for balanced growth.",
                neglectedAreas.size(), neglectedList),
            "Try adding small tasks (1–2 points) in neglected areas to maintain balance.",
            null,
            neglectedList);
      }
    } catch (Exception e) {
      log.warn(
          "Failed to evaluate dimension-imbalance trigger for userId={}: {}",
          userId,
          e.getMessage());
    }

    return TriggerResult.skip();
  }

  @Override
  public InterventionType type() {
    return InterventionType.DIMENSION_IMBALANCE;
  }
}
