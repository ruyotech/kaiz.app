package app.kaiz.tasks.application;

import app.kaiz.identity.domain.User;
import app.kaiz.identity.infrastructure.UserRepository;
import app.kaiz.sensai.domain.VelocityRecord;
import app.kaiz.sensai.infrastructure.VelocityRecordRepository;
import app.kaiz.shared.exception.BadRequestException;
import app.kaiz.shared.exception.ResourceNotFoundException;
import app.kaiz.tasks.application.dto.SprintCommitRequest;
import app.kaiz.tasks.application.dto.SprintCommitResponse;
import app.kaiz.tasks.application.dto.SprintDto;
import app.kaiz.tasks.domain.Sprint;
import app.kaiz.tasks.domain.SprintStatus;
import app.kaiz.tasks.domain.Task;
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
   * Commit selected tasks to a sprint. Bulk-assigns tasks, records velocity commitment, and
   * auto-activates the sprint if the start date is today or earlier.
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

    // Update sprint totals
    sprint.setTotalPoints(sprint.getTotalPoints() + totalPoints);

    // Mark sprint as committed
    sprint.setCommittedAt(Instant.now());

    // Auto-activate if start date is today or earlier
    boolean activated = false;
    if (!LocalDate.now().isBefore(sprint.getStartDate())
        && sprint.getStatus() != SprintStatus.ACTIVE) {
      // Deactivate any currently active sprint
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

  private String serializeMap(Map<String, Integer> map) {
    try {
      return objectMapper.writeValueAsString(map);
    } catch (JsonProcessingException e) {
      log.warn("Failed to serialize dimension distribution: {}", e.getMessage());
      return "{}";
    }
  }
}
