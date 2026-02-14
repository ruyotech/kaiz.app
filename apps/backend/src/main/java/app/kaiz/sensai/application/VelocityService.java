package app.kaiz.sensai.application;

import app.kaiz.sensai.application.dto.VelocityDto;
import app.kaiz.sensai.domain.VelocityRecord;
import app.kaiz.sensai.infrastructure.VelocityRecordRepository;
import app.kaiz.tasks.domain.Sprint;
import app.kaiz.tasks.domain.Task;
import app.kaiz.tasks.domain.TaskStatus;
import app.kaiz.tasks.infrastructure.SprintRepository;
import app.kaiz.tasks.infrastructure.TaskRepository;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Computes velocity metrics, sprint health assessments, burndown data, and velocity history. */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class VelocityService {

  private final VelocityRecordRepository velocityRepository;
  private final TaskRepository taskRepository;
  private final SprintRepository sprintRepository;
  private final SensAIMapper mapper;

  public VelocityDto.VelocityMetrics getVelocityMetrics(UUID userId) {
    List<VelocityRecord> recent =
        velocityRepository.findRecentVelocityRecords(userId, PageRequest.of(0, 10));

    Double avgCompleted = velocityRepository.getAverageCompletedPoints(userId);
    Double avgCompletionRate = velocityRepository.getAverageCompletionRate(userId);
    Integer bestSprint = velocityRepository.getBestSprintPoints(userId);

    int currentCommitted = recent.isEmpty() ? 0 : recent.get(0).getCommittedPoints();
    int currentCompleted = recent.isEmpty() ? 0 : recent.get(0).getCompletedPoints();
    boolean isOvercommitted = !recent.isEmpty() && recent.get(0).isOvercommitted();

    double trend = 0;
    if (recent.size() >= 2) {
      int latest = recent.get(0).getCompletedPoints();
      int previous = recent.get(1).getCompletedPoints();
      trend = previous > 0 ? ((double) (latest - previous) / previous) * 100 : 0;
    }

    int suggested = avgCompleted != null ? (int) Math.round(avgCompleted * 0.9) : 35;

    return new VelocityDto.VelocityMetrics(
        avgCompleted != null ? avgCompleted : 0,
        currentCommitted,
        currentCompleted,
        Math.round(trend * 100) / 100.0,
        isOvercommitted,
        avgCompletionRate != null ? avgCompletionRate : 0,
        bestSprint != null ? bestSprint : 0,
        suggested);
  }

  public VelocityDto.SprintHealth getSprintHealth(UUID userId, String sprintId) {
    VelocityRecord record =
        velocityRepository.findByUserIdAndSprintId(userId, sprintId).orElse(null);

    if (record == null) {
      return new VelocityDto.SprintHealth(
          sprintId,
          0,
          14,
          14,
          0,
          0,
          0,
          0,
          0,
          100,
          "low",
          "on_track",
          List.of(),
          "Sprint not started yet.");
    }

    int totalDays =
        (int) ChronoUnit.DAYS.between(record.getSprintStartDate(), record.getSprintEndDate());
    int daysElapsed = (int) ChronoUnit.DAYS.between(record.getSprintStartDate(), LocalDate.now());
    int daysRemaining = Math.max(0, totalDays - daysElapsed);

    double dailyRate = daysElapsed > 0 ? (double) record.getCompletedPoints() / daysElapsed : 0;
    double projectedCompletion =
        record.getCommittedPoints() > 0
            ? Math.min(
                100,
                ((record.getCompletedPoints() + (dailyRate * daysRemaining))
                        / record.getCommittedPoints())
                    * 100)
            : 100;

    int healthScore = calculateHealthScore(record, daysElapsed, totalDays, projectedCompletion);
    String riskLevel = healthScore >= 70 ? "low" : healthScore >= 40 ? "medium" : "high";

    String healthStatus;
    if (projectedCompletion >= 110) {
      healthStatus = "ahead";
    } else if (healthScore >= 70) {
      healthStatus = "on_track";
    } else if (healthScore >= 40) {
      healthStatus = "at_risk";
    } else {
      healthStatus = "behind";
    }

    List<String> riskFactors =
        identifyRiskFactors(record, daysElapsed, totalDays, projectedCompletion);
    String assessment = generateHealthAssessment(healthScore, riskFactors);

    int remainingPoints = record.getCommittedPoints() - record.getCompletedPoints();

    return new VelocityDto.SprintHealth(
        sprintId,
        daysElapsed,
        daysRemaining,
        totalDays,
        record.getCommittedPoints(),
        record.getCompletedPoints(),
        remainingPoints,
        0,
        Math.round(projectedCompletion * 10) / 10.0,
        healthScore,
        riskLevel,
        healthStatus,
        riskFactors,
        assessment);
  }

  public VelocityDto.VelocityHistory getVelocityHistory(UUID userId, int sprintCount) {
    List<VelocityRecord> records =
        velocityRepository.findRecentVelocityRecords(userId, PageRequest.of(0, sprintCount));

    List<VelocityDto> sprints = mapper.toVelocityDtos(records);

    double avgCommitted =
        records.stream().mapToInt(VelocityRecord::getCommittedPoints).average().orElse(0);
    double avgCompleted =
        records.stream().mapToInt(VelocityRecord::getCompletedPoints).average().orElse(0);
    int totalDelivered = records.stream().mapToInt(VelocityRecord::getCompletedPoints).sum();
    double overallRate = avgCommitted > 0 ? (avgCompleted / avgCommitted) * 100 : 0;

    return new VelocityDto.VelocityHistory(
        sprints,
        Math.round(avgCommitted * 10) / 10.0,
        Math.round(avgCompleted * 10) / 10.0,
        Math.round(overallRate * 10) / 10.0,
        totalDelivered,
        records.size());
  }

  /** Generate burndown data for a sprint. */
  public List<VelocityDto.BurndownPoint> getBurndownData(UUID userId, String sprintId) {
    log.debug("Getting burndown data: userId={}, sprintId={}", userId, sprintId);

    VelocityRecord record =
        velocityRepository.findByUserIdAndSprintId(userId, sprintId).orElse(null);
    Sprint sprint = sprintRepository.findById(sprintId).orElse(null);
    if (sprint == null || record == null) {
      return List.of();
    }

    LocalDate startDate = sprint.getStartDate();
    LocalDate endDate = sprint.getEndDate();
    int totalDays = (int) ChronoUnit.DAYS.between(startDate, endDate);
    int totalPoints = record.getCommittedPoints();

    List<Task> sprintTasks =
        taskRepository.findByUserIdAndSprintIdAndDeletedAtIsNullOrderByCreatedAtDesc(
            userId, sprintId);

    List<VelocityDto.BurndownPoint> points = new ArrayList<>();
    LocalDate today = LocalDate.now();

    for (int day = 0; day <= totalDays; day++) {
      LocalDate currentDate = startDate.plusDays(day);
      int idealRemaining =
          totalDays > 0 ? (int) Math.round(totalPoints * (1.0 - (double) day / totalDays)) : 0;

      if (currentDate.isAfter(today)) {
        points.add(new VelocityDto.BurndownPoint(currentDate, -1, idealRemaining, 0));
      } else {
        java.time.Instant dayEnd =
            currentDate.plusDays(1).atStartOfDay(java.time.ZoneId.systemDefault()).toInstant();
        java.time.Instant dayStart =
            currentDate.atStartOfDay(java.time.ZoneId.systemDefault()).toInstant();

        int completedByDay = 0;
        int completedToday = 0;
        for (Task task : sprintTasks) {
          if (task.getStatus() == TaskStatus.DONE && task.getCompletedAt() != null) {
            if (task.getCompletedAt().isBefore(dayEnd)) {
              completedByDay += task.getStoryPoints();
              if (!task.getCompletedAt().isBefore(dayStart)) {
                completedToday += task.getStoryPoints();
              }
            }
          }
        }

        int actualRemaining = totalPoints - completedByDay;
        points.add(
            new VelocityDto.BurndownPoint(
                currentDate, actualRemaining, idealRemaining, completedToday));
      }
    }

    log.info("Burndown data generated: sprintId={}, dataPoints={}", sprintId, points.size());
    return points;
  }

  // ── Helpers ──

  private int calculateHealthScore(
      VelocityRecord record, int daysElapsed, int totalDays, double projectedCompletion) {
    int score = 100;

    if (projectedCompletion < 100) {
      score -= (int) ((100 - projectedCompletion) * 0.5);
    }
    if (record.isOvercommitted()) {
      score -= 15;
    }

    double expectedProgress = totalDays > 0 ? (double) daysElapsed / totalDays : 0;
    double actualProgress =
        record.getCommittedPoints() > 0
            ? (double) record.getCompletedPoints() / record.getCommittedPoints()
            : 0;

    if (actualProgress < expectedProgress - 0.1) {
      score -= 20;
    }

    return Math.max(0, Math.min(100, score));
  }

  private List<String> identifyRiskFactors(
      VelocityRecord record, int daysElapsed, int totalDays, double projectedCompletion) {
    List<String> risks = new ArrayList<>();

    if (projectedCompletion < 80) {
      risks.add("Low projected completion rate");
    }
    if (record.isOvercommitted()) {
      risks.add("Sprint is overcommitted");
    }
    if (record.getCarriedOverPoints() > record.getCommittedPoints() * 0.2) {
      risks.add("High carryover from previous sprint");
    }

    double expectedProgress = totalDays > 0 ? (double) daysElapsed / totalDays : 0;
    double actualProgress =
        record.getCommittedPoints() > 0
            ? (double) record.getCompletedPoints() / record.getCommittedPoints()
            : 0;

    if (actualProgress < expectedProgress - 0.15) {
      risks.add("Behind expected progress");
    }

    return risks;
  }

  private String generateHealthAssessment(int healthScore, List<String> riskFactors) {
    if (healthScore >= 80) {
      return "Sprint is on track! Keep up the good work.";
    } else if (healthScore >= 60) {
      return "Sprint health is moderate. "
          + (riskFactors.isEmpty() ? "" : "Watch out for: " + riskFactors.get(0));
    } else if (healthScore >= 40) {
      return "Sprint needs attention. Consider reducing scope or addressing blockers.";
    } else {
      return "Sprint is at risk. Immediate action recommended - consider emergency scope reduction.";
    }
  }
}
