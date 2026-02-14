package app.kaiz.sensai.application;

import app.kaiz.life_wheel.domain.LifeWheelArea;
import app.kaiz.life_wheel.infrastructure.LifeWheelAreaRepository;
import app.kaiz.sensai.application.dto.LifeWheelDto;
import app.kaiz.sensai.domain.LifeWheelMetric;
import app.kaiz.sensai.infrastructure.LifeWheelMetricRepository;
import java.util.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Computes life-wheel dimension scores, balance analysis, and neglect detection. */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class LifeWheelMetricService {

  private final LifeWheelAreaRepository lifeWheelAreaRepository;
  private final LifeWheelMetricRepository lifeWheelMetricRepository;

  public LifeWheelDto getLifeWheelMetrics(UUID userId) {
    List<LifeWheelArea> areas = lifeWheelAreaRepository.findAllOrderByDisplayOrder();
    List<LifeWheelMetric> existingMetrics = lifeWheelMetricRepository.findByUserId(userId);

    Map<String, LifeWheelMetric> metricsMap = new HashMap<>();
    for (LifeWheelMetric metric : existingMetrics) {
      metricsMap.put(metric.getLifeWheelAreaId(), metric);
    }

    List<LifeWheelDto.DimensionMetric> dimensions = new ArrayList<>();
    double totalScore = 0;
    String lowestDimension = null;
    String highestDimension = null;
    double lowestScore = 11;
    double highestScore = -1;

    for (LifeWheelArea area : areas) {
      LifeWheelMetric metric = metricsMap.get(area.getId());

      double score = metric != null ? metric.getScore() : 5.0;
      String trend = metric != null ? metric.getTrend() : "stable";
      int tasksCompleted = metric != null ? metric.getTasksCompleted() : 0;
      int pointsDelivered = metric != null ? metric.getPointsEarned() : 0;

      double trendDelta = "up".equals(trend) ? 0.5 : "down".equals(trend) ? -0.5 : 0;

      boolean needsAttention = score < 4 || (metric != null && metric.isNeglected());
      int sprintsNeglected = needsAttention ? 1 : 0;

      List<String> recoveryTasks =
          needsAttention
              ? List.of("Schedule focused time for " + area.getName().toLowerCase())
              : List.of();

      dimensions.add(
          new LifeWheelDto.DimensionMetric(
              area.getId(),
              area.getName(),
              area.getIcon(),
              area.getColor(),
              score,
              score - trendDelta,
              trendDelta,
              tasksCompleted,
              pointsDelivered,
              sprintsNeglected,
              needsAttention,
              recoveryTasks));

      totalScore += score;

      if (score < lowestScore) {
        lowestScore = score;
        lowestDimension = area.getId();
      }
      if (score > highestScore) {
        highestScore = score;
        highestDimension = area.getId();
      }
    }

    double overallBalance = areas.isEmpty() ? 5.0 : totalScore / areas.size();
    double variance = 0;
    for (LifeWheelDto.DimensionMetric dim : dimensions) {
      variance += Math.pow(dim.currentScore() - overallBalance, 2);
    }
    variance = areas.isEmpty() ? 0 : Math.sqrt(variance / areas.size());

    log.info(
        "Life wheel metrics: userId={}, balance={}, dimensions={}",
        userId,
        Math.round(overallBalance * 10) / 10.0,
        dimensions.size());

    return new LifeWheelDto(
        Math.round(overallBalance * 10) / 10.0,
        dimensions,
        lowestDimension,
        highestDimension,
        Math.round(variance * 100) / 100.0,
        "Current Sprint");
  }
}
