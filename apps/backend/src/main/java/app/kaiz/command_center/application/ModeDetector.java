package app.kaiz.command_center.application;

import app.kaiz.sensai.domain.CeremonyStatus;
import app.kaiz.sensai.domain.SprintCeremony;
import app.kaiz.sensai.infrastructure.SprintCeremonyRepository;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Detects the chat mode for an incoming message using a priority chain:
 *
 * <ol>
 *   <li>Explicit override (user or system requested a specific mode)
 *   <li>Active ceremony (an in-progress sprint ceremony)
 *   <li>Day/time heuristic (e.g., morning = standup, Sunday = planning)
 *   <li>Input keyword matching
 *   <li>Fallback: FREEFORM
 * </ol>
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ModeDetector {

  private final SprintCeremonyRepository ceremonyRepository;

  // Keyword patterns for mode detection (case-insensitive)
  private static final Pattern STANDUP_PATTERN =
      Pattern.compile(
          "\\b(standup|stand-up|daily|check.?in|yesterday|today.?plan|blocker)\\b",
          Pattern.CASE_INSENSITIVE);
  private static final Pattern PLANNING_PATTERN =
      Pattern.compile(
          "\\b(plan|planning|sprint.?plan|commit|capacity|next.?sprint|backlog)\\b",
          Pattern.CASE_INSENSITIVE);
  private static final Pattern RETRO_PATTERN =
      Pattern.compile(
          "\\b(retro|retrospective|went.?well|improve|action.?item|review)\\b",
          Pattern.CASE_INSENSITIVE);
  private static final Pattern CAPTURE_PATTERN =
      Pattern.compile(
          "\\b(add|create|new|quick|capture|task|todo|remind)\\b", Pattern.CASE_INSENSITIVE);

  private static final Set<String> VALID_MODES =
      Set.of("STANDUP", "PLANNING", "RETROSPECTIVE", "CAPTURE", "FREEFORM", "REVIEW", "REFINEMENT");

  /**
   * Detects the chat mode for the given user and input.
   *
   * @param userId the current user
   * @param input the user's message text
   * @param explicitMode an explicit mode override (may be null)
   * @param activeSprintId the current sprint ID (may be null)
   * @return the detected chat mode string
   */
  public String detect(UUID userId, String input, String explicitMode, String activeSprintId) {
    // 1. Explicit override
    if (explicitMode != null && !explicitMode.isBlank()) {
      String normalized = explicitMode.toUpperCase().trim();
      if (VALID_MODES.contains(normalized)) {
        log.debug("Mode detected via explicit override: {}", normalized);
        return normalized;
      }
      log.warn("Invalid explicit mode '{}', falling through to detection", explicitMode);
    }

    // 2. Active ceremony (any in-progress ceremony for this user)
    List<SprintCeremony> activeCeremonies =
        ceremonyRepository.findByUserIdAndStatusOrderByScheduledAt(
            userId, CeremonyStatus.IN_PROGRESS);
    if (!activeCeremonies.isEmpty()) {
      SprintCeremony active = activeCeremonies.getFirst();
      String mode = mapCeremonyTypeToMode(active.getCeremonyType().name());
      log.debug("Mode detected via active ceremony: {} (ceremonyId={})", mode, active.getId());
      return mode;
    }

    // 3. Day/time heuristic
    String timeBasedMode = detectByDayAndTime();
    if (timeBasedMode != null) {
      log.debug("Mode detected via day/time heuristic: {}", timeBasedMode);
      // Don't force time-based — only suggest if keywords also match
      if (inputMatchesMode(input, timeBasedMode)) {
        return timeBasedMode;
      }
    }

    // 4. Keyword matching
    if (STANDUP_PATTERN.matcher(input).find()) {
      log.debug("Mode detected via keywords: STANDUP");
      return "STANDUP";
    }
    if (PLANNING_PATTERN.matcher(input).find()) {
      log.debug("Mode detected via keywords: PLANNING");
      return "PLANNING";
    }
    if (RETRO_PATTERN.matcher(input).find()) {
      log.debug("Mode detected via keywords: RETROSPECTIVE");
      return "RETROSPECTIVE";
    }
    if (CAPTURE_PATTERN.matcher(input).find()) {
      log.debug("Mode detected via keywords: CAPTURE");
      return "CAPTURE";
    }

    // 5. Fallback
    log.debug("Mode defaulting to FREEFORM");
    return "FREEFORM";
  }

  // ── Helpers ──

  private String detectByDayAndTime() {
    LocalDate today = LocalDate.now();
    LocalTime now = LocalTime.now();

    // Sunday afternoon → planning
    if (today.getDayOfWeek() == DayOfWeek.SUNDAY && now.isAfter(LocalTime.of(14, 0))) {
      return "PLANNING";
    }

    // Weekday morning 7–10 → standup
    if (today.getDayOfWeek() != DayOfWeek.SATURDAY
        && today.getDayOfWeek() != DayOfWeek.SUNDAY
        && now.isAfter(LocalTime.of(7, 0))
        && now.isBefore(LocalTime.of(10, 0))) {
      return "STANDUP";
    }

    // Friday late afternoon → retrospective (if sprint end)
    if (today.getDayOfWeek() == DayOfWeek.FRIDAY && now.isAfter(LocalTime.of(16, 0))) {
      return "RETROSPECTIVE";
    }

    return null;
  }

  private boolean inputMatchesMode(String input, String mode) {
    return switch (mode) {
      case "STANDUP" -> STANDUP_PATTERN.matcher(input).find();
      case "PLANNING" -> PLANNING_PATTERN.matcher(input).find();
      case "RETROSPECTIVE" -> RETRO_PATTERN.matcher(input).find();
      default -> false;
    };
  }

  private String mapCeremonyTypeToMode(String ceremonyType) {
    return switch (ceremonyType) {
      case "PLANNING" -> "PLANNING";
      case "REVIEW" -> "REVIEW";
      case "RETROSPECTIVE" -> "RETROSPECTIVE";
      case "STANDUP" -> "STANDUP";
      case "REFINEMENT" -> "REFINEMENT";
      default -> "FREEFORM";
    };
  }
}
