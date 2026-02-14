package app.kaiz.command_center.application;

import app.kaiz.command_center.domain.DraftFeedbackRecord;
import app.kaiz.command_center.domain.UserCoachPreference;
import app.kaiz.command_center.infrastructure.DraftFeedbackRecordRepository;
import app.kaiz.command_center.infrastructure.UserCoachPreferenceRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Learns user preferences from recurring draft modifications. Analyzes MODIFIED feedback to detect
 * patterns (≥3 occurrences of the same field change) and injects them into {@link
 * UserCoachPreference#getCorrectionPatterns()} so future AI prompts can include {@code
 * {{userCorrectionPatterns}}}.
 *
 * <p>Runs daily via {@code @Scheduled} and can also be invoked on-demand after each modification.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class UserPreferenceLearner {

  /** Minimum occurrences of the same correction before it becomes a "pattern". */
  private static final int PATTERN_THRESHOLD = 3;

  /** Maximum number of correction patterns stored per user. */
  private static final int MAX_PATTERNS = 20;

  private final DraftFeedbackRecordRepository feedbackRepository;
  private final UserCoachPreferenceRepository preferenceRepository;
  private final ObjectMapper objectMapper;

  /**
   * Analyze modifications for a specific user and update their correction patterns.
   *
   * @param userId the user to learn from
   * @return number of new patterns detected
   */
  @Transactional
  public int learnFromUser(UUID userId) {
    List<DraftFeedbackRecord> modifications = feedbackRepository.findModificationsByUser(userId);

    if (modifications.size() < PATTERN_THRESHOLD) {
      log.debug(
          "Not enough modifications for userId={} (have {}, need {})",
          userId,
          modifications.size(),
          PATTERN_THRESHOLD);
      return 0;
    }

    // Extract field-level diffs from original vs modified JSON
    Map<String, Map<String, Integer>> fieldChangeCounts = new HashMap<>();

    for (DraftFeedbackRecord record : modifications) {
      if (record.getOriginalDraftJson() == null || record.getModifiedDraftJson() == null) {
        continue;
      }
      extractDiffs(record.getOriginalDraftJson(), record.getModifiedDraftJson(), fieldChangeCounts);
    }

    // Find patterns that exceed the threshold
    List<CorrectionPattern> patterns =
        fieldChangeCounts.entrySet().stream()
            .flatMap(
                fieldEntry ->
                    fieldEntry.getValue().entrySet().stream()
                        .filter(change -> change.getValue() >= PATTERN_THRESHOLD)
                        .map(
                            change ->
                                new CorrectionPattern(
                                    fieldEntry.getKey(), change.getKey(), change.getValue())))
            .sorted(Comparator.comparingInt(CorrectionPattern::count).reversed())
            .limit(MAX_PATTERNS)
            .toList();

    if (patterns.isEmpty()) {
      log.debug("No recurring correction patterns found for userId={}", userId);
      return 0;
    }

    // Persist to user preferences
    Optional<UserCoachPreference> prefOpt = preferenceRepository.findByUserId(userId);
    if (prefOpt.isEmpty()) {
      log.debug("No coach preferences found for userId={}, skipping pattern save", userId);
      return 0;
    }

    UserCoachPreference prefs = prefOpt.get();
    try {
      String patternsJson = objectMapper.writeValueAsString(patterns);
      prefs.setCorrectionPatterns(patternsJson);
      preferenceRepository.save(prefs);
      log.info(
          "Updated {} correction patterns for userId={}: {}",
          patterns.size(),
          userId,
          patterns.stream().map(CorrectionPattern::field).distinct().toList());
    } catch (JsonProcessingException e) {
      log.error(
          "Failed to serialize correction patterns for userId={}: {}", userId, e.getMessage());
    }

    return patterns.size();
  }

  /**
   * Retrieve the current correction patterns for a user as a human-readable string, suitable for
   * injecting into AI prompts as {@code {{userCorrectionPatterns}}}.
   */
  public String getCorrectionPatternsText(UUID userId) {
    Optional<UserCoachPreference> prefOpt = preferenceRepository.findByUserId(userId);
    if (prefOpt.isEmpty()) {
      return "";
    }

    String json = prefOpt.get().getCorrectionPatterns();
    if (json == null || json.equals("[]")) {
      return "";
    }

    try {
      List<CorrectionPattern> patterns =
          objectMapper.readValue(json, new TypeReference<List<CorrectionPattern>>() {});
      if (patterns.isEmpty()) {
        return "";
      }
      return patterns.stream()
          .map(
              p ->
                  String.format(
                      "- Field '%s': user usually changes to '%s' (%dx)",
                      p.field(), p.preferredValue(), p.count()))
          .collect(Collectors.joining("\n"));
    } catch (JsonProcessingException e) {
      log.warn("Failed to parse correction patterns for userId={}: {}", userId, e.getMessage());
      return "";
    }
  }

  /** Daily scheduled job: re-learn patterns for all users who have MODIFIED feedback. */
  @Scheduled(cron = "0 0 3 * * *", zone = "UTC")
  @Transactional
  public void dailyPatternLearning() {
    log.info("Starting daily correction pattern learning");
    List<UserCoachPreference> allPrefs = preferenceRepository.findAll();
    int totalPatterns = 0;
    int usersUpdated = 0;

    for (UserCoachPreference pref : allPrefs) {
      if (pref.getTotalDraftsModified() >= PATTERN_THRESHOLD) {
        int count = learnFromUser(pref.getUser().getId());
        if (count > 0) {
          totalPatterns += count;
          usersUpdated++;
        }
      }
    }

    log.info(
        "Daily pattern learning complete: {} users updated, {} total patterns",
        usersUpdated,
        totalPatterns);
  }

  // ── Helpers ──

  /**
   * Extract field-level diffs between original and modified draft JSON. Tracks how many times each
   * field was changed to a specific value.
   */
  private void extractDiffs(
      String originalJson,
      String modifiedJson,
      Map<String, Map<String, Integer>> fieldChangeCounts) {
    try {
      JsonNode original = objectMapper.readTree(originalJson);
      JsonNode modified = objectMapper.readTree(modifiedJson);

      Iterator<String> fieldNames = modified.fieldNames();
      while (fieldNames.hasNext()) {
        String field = fieldNames.next();
        JsonNode origValue = original.get(field);
        JsonNode modValue = modified.get(field);

        if (modValue != null && !modValue.equals(origValue)) {
          String newValueStr = modValue.isTextual() ? modValue.asText() : modValue.toString();
          fieldChangeCounts
              .computeIfAbsent(field, k -> new HashMap<>())
              .merge(newValueStr, 1, Integer::sum);
        }
      }
    } catch (JsonProcessingException e) {
      log.debug("Failed to parse draft JSON for diff analysis: {}", e.getMessage());
    }
  }

  /** Immutable record representing a detected correction pattern. */
  public record CorrectionPattern(String field, String preferredValue, int count) {}
}
