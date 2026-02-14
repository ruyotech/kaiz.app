package app.kaiz.command_center.application;

import app.kaiz.command_center.domain.DraftFeedbackRecord;
import app.kaiz.command_center.domain.DraftFeedbackRecord.FeedbackAction;
import app.kaiz.command_center.infrastructure.DraftFeedbackRecordRepository;
import app.kaiz.command_center.infrastructure.UserCoachPreferenceRepository;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Weekly aggregation service that summarizes feedback trends for the admin dashboard. Produces
 * approval rates, top correction patterns, rejection reasons, and time-to-decide statistics.
 *
 * <p>The aggregated data is queried on-demand by {@link
 * app.kaiz.admin.application.AiFeedbackDashboardService} — this service provides the computation
 * methods.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class RuleEvolutionService {

  private final DraftFeedbackRecordRepository feedbackRepository;
  private final UserCoachPreferenceRepository preferenceRepository;

  /**
   * Compute global approval/modification/rejection rates for a given time window.
   *
   * @param since start of the window
   * @return map with keys "approvalRate", "modificationRate", "rejectionRate", "totalFeedback"
   */
  public Map<String, Object> computeFeedbackRates(Instant since) {
    List<DraftFeedbackRecord> allFeedback = feedbackRepository.findAll();

    List<DraftFeedbackRecord> filtered =
        allFeedback.stream()
            .filter(f -> f.getCreatedAt() != null && f.getCreatedAt().isAfter(since))
            .toList();

    long total = filtered.size();
    if (total == 0) {
      return Map.of(
          "approvalRate", 0.0,
          "modificationRate", 0.0,
          "rejectionRate", 0.0,
          "totalFeedback", 0L);
    }

    long approved = filtered.stream().filter(f -> f.getAction() == FeedbackAction.APPROVED).count();
    long modified = filtered.stream().filter(f -> f.getAction() == FeedbackAction.MODIFIED).count();
    long rejected = filtered.stream().filter(f -> f.getAction() == FeedbackAction.REJECTED).count();

    return Map.of(
        "approvalRate", (double) approved / total * 100,
        "modificationRate", (double) modified / total * 100,
        "rejectionRate", (double) rejected / total * 100,
        "totalFeedback", total);
  }

  /**
   * Compute average time-to-decide across all feedback in a time window.
   *
   * @param since start of the window
   * @return average milliseconds, or 0 if no data
   */
  public double computeAverageDecisionTime(Instant since) {
    List<DraftFeedbackRecord> allFeedback = feedbackRepository.findAll();

    return allFeedback.stream()
        .filter(f -> f.getCreatedAt() != null && f.getCreatedAt().isAfter(since))
        .filter(f -> f.getTimeToDecideMs() != null)
        .mapToLong(DraftFeedbackRecord::getTimeToDecideMs)
        .average()
        .orElse(0.0);
  }

  /**
   * Get the most common rejection reasons from user comments.
   *
   * @param since start of the window
   * @param limit max results
   * @return list of maps with "reason" and "count"
   */
  public List<Map<String, Object>> topRejectionReasons(Instant since, int limit) {
    List<DraftFeedbackRecord> allFeedback = feedbackRepository.findAll();

    return allFeedback.stream()
        .filter(f -> f.getCreatedAt() != null && f.getCreatedAt().isAfter(since))
        .filter(f -> f.getAction() == FeedbackAction.REJECTED)
        .filter(f -> f.getUserComment() != null && !f.getUserComment().isBlank())
        .collect(Collectors.groupingBy(DraftFeedbackRecord::getUserComment, Collectors.counting()))
        .entrySet()
        .stream()
        .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
        .limit(limit)
        .map(e -> Map.<String, Object>of("reason", e.getKey(), "count", e.getValue()))
        .toList();
  }

  /**
   * Get user-level feedback summary: per-user approval/modification/rejection counts.
   *
   * @param limit top N users by total feedback
   * @return list of user summaries
   */
  public List<Map<String, Object>> topUsersByFeedback(int limit) {
    return preferenceRepository.findAll().stream()
        .filter(p -> p.getTotalInteractions() > 0)
        .sorted(Comparator.comparingInt(p -> -p.getTotalInteractions()))
        .limit(limit)
        .map(
            p ->
                Map.<String, Object>of(
                    "userId", p.getUser().getId(),
                    "totalInteractions", p.getTotalInteractions(),
                    "approved", p.getTotalDraftsApproved(),
                    "modified", p.getTotalDraftsModified(),
                    "rejected", p.getTotalDraftsRejected()))
        .toList();
  }

  /** Weekly log of feedback evolution — runs every Monday at 2 AM UTC. */
  @Scheduled(cron = "0 0 2 * * MON", zone = "UTC")
  public void weeklyEvolutionReport() {
    Instant oneWeekAgo = Instant.now().minus(7, ChronoUnit.DAYS);
    Map<String, Object> rates = computeFeedbackRates(oneWeekAgo);
    double avgDecision = computeAverageDecisionTime(oneWeekAgo);

    log.info(
        "Weekly AI feedback report: total={}, approvalRate={}%, modRate={}%, "
            + "rejectRate={}%, avgDecideMs={}",
        rates.get("totalFeedback"),
        String.format("%.1f", rates.get("approvalRate")),
        String.format("%.1f", rates.get("modificationRate")),
        String.format("%.1f", rates.get("rejectionRate")),
        String.format("%.0f", avgDecision));
  }
}
