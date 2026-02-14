package app.kaiz.admin.application;

import app.kaiz.command_center.application.RuleEvolutionService;
import app.kaiz.command_center.infrastructure.ConversationSessionRepository;
import app.kaiz.command_center.infrastructure.DraftFeedbackRecordRepository;
import app.kaiz.command_center.infrastructure.PendingDraftRepository;
import app.kaiz.sensai.infrastructure.InterventionRepository;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Aggregates data across feedback records, conversation sessions, and interventions for the admin
 * AI dashboard. Provides high-level metrics: approval rates, session counts, intervention trends,
 * and user engagement statistics.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AiFeedbackDashboardService {

  private final RuleEvolutionService ruleEvolutionService;
  private final DraftFeedbackRecordRepository feedbackRepository;
  private final ConversationSessionRepository sessionRepository;
  private final PendingDraftRepository draftRepository;
  private final InterventionRepository interventionRepository;

  /**
   * Get a full dashboard snapshot for the admin panel.
   *
   * @param days number of days to look back (default 7)
   * @return comprehensive dashboard data
   */
  public DashboardSnapshot getDashboard(int days) {
    Instant since = Instant.now().minus(days, ChronoUnit.DAYS);

    Map<String, Object> feedbackRates = ruleEvolutionService.computeFeedbackRates(since);
    double avgDecisionTime = ruleEvolutionService.computeAverageDecisionTime(since);
    List<Map<String, Object>> topRejections = ruleEvolutionService.topRejectionReasons(since, 10);
    List<Map<String, Object>> topUsers = ruleEvolutionService.topUsersByFeedback(20);

    long totalSessions = sessionRepository.count();
    long totalDrafts = draftRepository.count();
    long totalFeedback = feedbackRepository.count();
    long totalInterventions = interventionRepository.count();

    log.debug(
        "Dashboard snapshot: days={}, feedback={}, sessions={}, drafts={}, interventions={}",
        days,
        totalFeedback,
        totalSessions,
        totalDrafts,
        totalInterventions);

    return new DashboardSnapshot(
        days,
        feedbackRates,
        avgDecisionTime,
        topRejections,
        topUsers,
        totalSessions,
        totalDrafts,
        totalFeedback,
        totalInterventions);
  }

  /**
   * Get feedback trends: weekly breakdown of approval/modification/rejection rates over the last N
   * weeks.
   *
   * @param weeks number of weeks to show
   * @return list of weekly summaries (newest first)
   */
  public List<Map<String, Object>> getWeeklyTrends(int weeks) {
    return java.util.stream.IntStream.range(0, weeks)
        .mapToObj(
            i -> {
              Instant weekEnd = Instant.now().minus((long) i * 7, ChronoUnit.DAYS);
              Instant weekStart = weekEnd.minus(7, ChronoUnit.DAYS);
              Map<String, Object> rates = ruleEvolutionService.computeFeedbackRates(weekStart);
              rates = new java.util.HashMap<>(rates);
              rates.put("weekStart", weekStart.toString());
              rates.put("weekEnd", weekEnd.toString());
              return rates;
            })
        .toList();
  }

  // ── DTOs ──

  public record DashboardSnapshot(
      int lookbackDays,
      Map<String, Object> feedbackRates,
      double avgDecisionTimeMs,
      List<Map<String, Object>> topRejectionReasons,
      List<Map<String, Object>> topUsers,
      long totalSessions,
      long totalDrafts,
      long totalFeedback,
      long totalInterventions) {}
}
