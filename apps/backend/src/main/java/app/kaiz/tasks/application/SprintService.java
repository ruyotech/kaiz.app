package app.kaiz.tasks.application;

import app.kaiz.identity.domain.User;
import app.kaiz.identity.infrastructure.UserRepository;
import app.kaiz.sensai.domain.VelocityRecord;
import app.kaiz.sensai.infrastructure.VelocityRecordRepository;
import app.kaiz.shared.exception.BadRequestException;
import app.kaiz.shared.exception.ResourceNotFoundException;
import app.kaiz.tasks.application.dto.CompleteSprintRequest;
import app.kaiz.tasks.application.dto.CompleteSprintResponse;
import app.kaiz.tasks.application.dto.SprintCommitRequest;
import app.kaiz.tasks.application.dto.SprintCommitResponse;
import app.kaiz.tasks.application.dto.SprintDto;
import app.kaiz.tasks.domain.Sprint;
import app.kaiz.tasks.domain.SprintStatus;
import app.kaiz.tasks.domain.Task;
import app.kaiz.tasks.domain.TaskStatus;
import app.kaiz.tasks.infrastructure.SprintRepository;
import app.kaiz.tasks.infrastructure.TaskRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class SprintService {

  private final SprintRepository sprintRepository;
  private final TaskRepository taskRepository;
  private final UserRepository userRepository;
  private final VelocityRecordRepository velocityRecordRepository;
  private final SdlcMapper sdlcMapper;
  private final ObjectMapper objectMapper;

  public List<SprintDto> getAllSprints() {
    return sdlcMapper.toSprintDtoList(sprintRepository.findAll());
  }

  public List<SprintDto> getSprintsByYear(int year) {
    return sdlcMapper.toSprintDtoList(sprintRepository.findByYearOrderByWeekNumberAsc(year));
  }

  public SprintDto getSprintById(String id) {
    Sprint sprint =
        sprintRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Sprint", id));
    return sdlcMapper.toSprintDto(sprint);
  }

  @Cacheable(value = "currentSprint", key = "'active'")
  public SprintDto getCurrentSprint() {
    return sprintRepository
        .findByStatus(SprintStatus.ACTIVE)
        .map(sdlcMapper::toSprintDto)
        .orElseGet(this::calculateCurrentSprint);
  }

  private SprintDto calculateCurrentSprint() {
    LocalDate today = LocalDate.now();
    int year = today.getYear();
    int weekNumber = today.get(WeekFields.of(Locale.getDefault()).weekOfWeekBasedYear());

    return sprintRepository
        .findByWeekNumberAndYear(weekNumber, year)
        .map(sdlcMapper::toSprintDto)
        .orElseThrow(
            () ->
                new ResourceNotFoundException("Sprint", "week " + weekNumber + " of year " + year));
  }

  public List<SprintDto> getUpcomingSprints(int limit) {
    LocalDate today = LocalDate.now();
    int year = today.getYear();
    int weekNumber = today.get(WeekFields.of(Locale.getDefault()).weekOfWeekBasedYear());

    List<Sprint> sprints = sprintRepository.findUpcomingSprints(year, weekNumber);
    return sdlcMapper.toSprintDtoList(sprints.size() > limit ? sprints.subList(0, limit) : sprints);
  }

  @CacheEvict(value = "currentSprint", allEntries = true)
  @Transactional
  public SprintDto activateSprint(String sprintId) {
    // Deactivate any currently active sprint
    sprintRepository
        .findByStatus(SprintStatus.ACTIVE)
        .ifPresent(
            active -> {
              active.setStatus(SprintStatus.COMPLETED);
              sprintRepository.save(active);
            });

    // Activate the new sprint
    Sprint sprint =
        sprintRepository
            .findById(sprintId)
            .orElseThrow(() -> new ResourceNotFoundException("Sprint", sprintId));
    sprint.setStatus(SprintStatus.ACTIVE);
    return sdlcMapper.toSprintDto(sprintRepository.save(sprint));
  }

  /**
   * Commit selected tasks to a sprint. Supports both initial commit and re-commit (edit plan). On
   * re-commit: clears previously assigned non-DONE tasks, then re-assigns the new set.
   */
  @CacheEvict(value = "currentSprint", allEntries = true)
  @Transactional
  public SprintCommitResponse commitSprint(
      UUID userId, String sprintId, SprintCommitRequest request) {
    log.info(
        "Committing sprint: userId={}, sprintId={}, taskCount={}",
        userId,
        sprintId,
        request.taskIds().size());

    Sprint sprint =
        sprintRepository
            .findById(sprintId)
            .orElseThrow(() -> new ResourceNotFoundException("Sprint", sprintId));

    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

    // Re-commit support: clear previously assigned non-DONE tasks from this sprint
    List<Task> existingTasks =
        taskRepository.findByUserIdAndSprintIdAndDeletedAtIsNullOrderByCreatedAtDesc(
            userId, sprintId);
    for (Task existingTask : existingTasks) {
      if (existingTask.getStatus() != TaskStatus.DONE) {
        existingTask.setSprint(null);
        taskRepository.save(existingTask);
      }
    }

    // Reset sprint points (keep completed points from DONE tasks)
    Integer donePoints = taskRepository.sumCompletedPointsByUserIdAndSprintId(userId, sprintId);
    int existingDonePoints = donePoints != null ? donePoints : 0;

    // Fetch and assign tasks to the sprint
    List<Task> tasks = new ArrayList<>();
    int totalPoints = 0;
    Map<String, Integer> dimensionDist = new HashMap<>();

    for (String taskIdStr : request.taskIds()) {
      UUID taskId;
      try {
        taskId = UUID.fromString(taskIdStr);
      } catch (IllegalArgumentException e) {
        log.warn("Invalid task ID format: {}", taskIdStr);
        continue;
      }

      Task task =
          taskRepository
              .findByIdAndUserId(taskId, userId)
              .orElseThrow(() -> new ResourceNotFoundException("Task", taskIdStr));

      task.setSprint(sprint);
      taskRepository.save(task);
      tasks.add(task);

      int points = task.getStoryPoints();
      totalPoints += points;

      // Track dimension distribution
      if (task.getLifeWheelArea() != null) {
        String areaId = task.getLifeWheelArea().getId();
        dimensionDist.merge(areaId, points, Integer::sum);
      }
    }

    if (tasks.isEmpty()) {
      throw new BadRequestException("No valid tasks found for commitment");
    }

    // Update sprint totals (replace, not accumulate)
    sprint.setTotalPoints(totalPoints + existingDonePoints);
    sprint.setCommittedAt(Instant.now());

    // Save sprint goal
    if (request.sprintGoal() != null) {
      sprint.setSprintGoal(request.sprintGoal());
    }

    // Auto-activate if start date is today or earlier
    boolean activated = false;
    if (!LocalDate.now().isBefore(sprint.getStartDate())
        && sprint.getStatus() != SprintStatus.ACTIVE) {
      sprintRepository
          .findByStatus(SprintStatus.ACTIVE)
          .ifPresent(
              active -> {
                if (!active.getId().equals(sprint.getId())) {
                  active.setStatus(SprintStatus.COMPLETED);
                  sprintRepository.save(active);
                }
              });
      sprint.setStatus(SprintStatus.ACTIVE);
      activated = true;
    }

    sprintRepository.save(sprint);

    // Upsert velocity record for this user + sprint
    Instant now = Instant.now();
    String dimDistJson = serializeMap(dimensionDist);

    VelocityRecord velocityRecord =
        velocityRecordRepository
            .findByUserIdAndSprintId(userId, sprintId)
            .orElseGet(
                () ->
                    VelocityRecord.builder()
                        .user(user)
                        .sprintId(sprintId)
                        .sprintStartDate(sprint.getStartDate())
                        .sprintEndDate(sprint.getEndDate())
                        .build());

    velocityRecord.setCommittedPoints(totalPoints);
    velocityRecord.setCommittedAt(now);
    velocityRecord.setDimensionDistribution(dimDistJson);
    velocityRecord.setSprintGoal(request.sprintGoal());

    // Calculate overcommit against average
    Double avgCompleted = velocityRecordRepository.getAverageCompletedPoints(userId);
    if (avgCompleted != null && avgCompleted > 0) {
      BigDecimal overcommitPct =
          BigDecimal.valueOf(totalPoints)
              .subtract(BigDecimal.valueOf(avgCompleted))
              .divide(BigDecimal.valueOf(avgCompleted), 4, RoundingMode.HALF_UP);
      velocityRecord.setOvercommitPercentage(overcommitPct);
      velocityRecord.setOvercommitted(overcommitPct.compareTo(new BigDecimal("0.15")) > 0);
    }

    velocityRecordRepository.save(velocityRecord);

    log.info(
        "Sprint committed: sprintId={}, tasks={}, points={}, activated={}",
        sprintId,
        tasks.size(),
        totalPoints,
        activated);

    return new SprintCommitResponse(
        sprint.getId(),
        sprint.getWeekNumber(),
        sprint.getYear(),
        tasks.size(),
        sprint.getTotalPoints(),
        totalPoints,
        activated,
        request.sprintGoal(),
        dimensionDist,
        now);
  }

  /**
   * Complete a sprint: mark as COMPLETED, finalize velocity record, carry over incomplete tasks to
   * next sprint with user-chosen re-estimation.
   */
  @CacheEvict(value = "currentSprint", allEntries = true)
  @Transactional
  public CompleteSprintResponse completeSprint(
      UUID userId, String sprintId, CompleteSprintRequest request) {
    log.info("Completing sprint: userId={}, sprintId={}", userId, sprintId);

    Sprint sprint =
        sprintRepository
            .findById(sprintId)
            .orElseThrow(() -> new ResourceNotFoundException("Sprint", sprintId));

    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

    // Calculate completed points
    Integer donePoints = taskRepository.sumCompletedPointsByUserIdAndSprintId(userId, sprintId);
    int completedPoints = donePoints != null ? donePoints : 0;

    // Count completed tasks
    List<Task> allSprintTasks =
        taskRepository.findByUserIdAndSprintIdAndDeletedAtIsNullOrderByCreatedAtDesc(
            userId, sprintId);
    int tasksCompleted =
        (int) allSprintTasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count();

    // Handle carry-over: find incomplete tasks
    List<Task> incompleteTasks = taskRepository.findIncompleteByUserIdAndSprintId(userId, sprintId);
    List<String> carriedOverTaskIds = new ArrayList<>();

    // Determine next sprint for carry-over
    Sprint nextSprint = null;
    if (request != null && request.nextSprintId() != null) {
      nextSprint = sprintRepository.findById(request.nextSprintId()).orElse(null);
    }
    if (nextSprint == null) {
      // Find the next planned sprint by date
      List<Sprint> upcoming = sprintRepository.findAllByStatusOrderByDate(SprintStatus.PLANNED);
      if (!upcoming.isEmpty()) {
        nextSprint = upcoming.get(0);
      }
    }

    // Build carry-over map from request (taskId → newPoints)
    Map<String, Integer> carryOverReEstimates = new HashMap<>();
    if (request != null && request.carryOverItems() != null) {
      for (CompleteSprintRequest.CarryOverItem item : request.carryOverItems()) {
        if (item.newStoryPoints() != null) {
          carryOverReEstimates.put(item.taskId(), item.newStoryPoints());
        }
      }
    }

    int carriedOverPoints = 0;
    for (Task task : incompleteTasks) {
      // Save original points before potential re-estimation
      task.setOriginalStoryPoints(task.getStoryPoints());
      task.setCarriedOverFromSprint(sprint);

      // Apply user re-estimation if provided
      String taskIdStr = task.getId().toString();
      if (carryOverReEstimates.containsKey(taskIdStr)) {
        task.setStoryPoints(carryOverReEstimates.get(taskIdStr));
      }

      // Move to next sprint (or unassign if no next sprint)
      if (nextSprint != null) {
        task.setSprint(nextSprint);
      } else {
        task.setSprint(null);
      }

      // Reset status to TODO for fresh start in new sprint
      if (task.getStatus() == TaskStatus.IN_PROGRESS) {
        task.setStatus(TaskStatus.TODO);
      }

      taskRepository.save(task);
      carriedOverTaskIds.add(taskIdStr);
      carriedOverPoints += task.getStoryPoints();
    }

    // Mark sprint as completed
    sprint.setStatus(SprintStatus.COMPLETED);
    sprint.setCompletedPoints(completedPoints);
    sprintRepository.save(sprint);

    // Update velocity record
    VelocityRecord velocityRecord =
        velocityRecordRepository
            .findByUserIdAndSprintId(userId, sprintId)
            .orElseGet(
                () ->
                    VelocityRecord.builder()
                        .user(user)
                        .sprintId(sprintId)
                        .sprintStartDate(sprint.getStartDate())
                        .sprintEndDate(sprint.getEndDate())
                        .build());

    velocityRecord.setCompletedPoints(completedPoints);
    velocityRecord.setCarriedOverPoints(carriedOverPoints);

    double completionRate =
        velocityRecord.getCommittedPoints() > 0
            ? (double) completedPoints / velocityRecord.getCommittedPoints() * 100
            : 0;
    velocityRecord.setCompletionRate(
        BigDecimal.valueOf(completionRate).setScale(2, RoundingMode.HALF_UP));
    velocityRecordRepository.save(velocityRecord);

    log.info(
        "Sprint completed: sprintId={}, completed={}/{}, carriedOver={}",
        sprintId,
        completedPoints,
        sprint.getTotalPoints(),
        carriedOverTaskIds.size());

    return new CompleteSprintResponse(
        sprintId,
        completedPoints,
        sprint.getTotalPoints(),
        Math.round(completionRate * 10) / 10.0,
        tasksCompleted,
        carriedOverTaskIds.size(),
        nextSprint != null ? nextSprint.getId() : null,
        carriedOverTaskIds,
        Instant.now());
  }

  private String serializeMap(Map<String, Integer> map) {
    try {
      return objectMapper.writeValueAsString(map);
    } catch (JsonProcessingException e) {
      log.warn("Failed to serialize dimension distribution: {}", e.getMessage());
      return "{}";
    }
  }
}
