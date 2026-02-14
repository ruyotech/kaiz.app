package app.kaiz.command_center.application;

import app.kaiz.command_center.domain.*;
import app.kaiz.command_center.domain.DraftFeedbackRecord.FeedbackAction;
import app.kaiz.command_center.infrastructure.DraftFeedbackRecordRepository;
import app.kaiz.command_center.infrastructure.PendingDraftRepository;
import app.kaiz.command_center.infrastructure.UserCoachPreferenceRepository;
import app.kaiz.identity.domain.User;
import app.kaiz.identity.infrastructure.UserRepository;
import app.kaiz.shared.exception.ResourceNotFoundException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Captures approve/modify/reject signals on AI-generated drafts. Records a {@link
 * DraftFeedbackRecord} and updates the user's {@link UserCoachPreference} counters so the
 * preference learner can detect correction patterns later.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class DraftFeedbackCollector {

  private final DraftFeedbackRecordRepository feedbackRepository;
  private final PendingDraftRepository draftRepository;
  private final UserCoachPreferenceRepository preferenceRepository;
  private final UserRepository userRepository;
  private final ObjectMapper objectMapper;

  /**
   * Record feedback for a draft action.
   *
   * @param userId the user who provided feedback
   * @param draftId the draft being acted upon
   * @param action APPROVED, MODIFIED, or REJECTED
   * @param modifiedDraftJson if MODIFIED — the new JSON; null otherwise
   * @param userComment optional free-text comment
   * @param timeToDecideMs time the user spent before deciding (client-measured)
   * @param sessionId optional conversation session that produced the draft
   * @return the persisted feedback record ID
   */
  @Transactional
  public UUID recordFeedback(
      UUID userId,
      UUID draftId,
      FeedbackAction action,
      String modifiedDraftJson,
      String userComment,
      Long timeToDecideMs,
      UUID sessionId) {

    PendingDraft draft =
        draftRepository
            .findByIdAndUserId(draftId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Draft", draftId.toString()));

    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

    // Serialize original draft content for later diff analysis
    String originalJson = serializeDraft(draft.getDraftContent());

    DraftFeedbackRecord.DraftFeedbackRecordBuilder<?, ?> builder =
        DraftFeedbackRecord.builder()
            .draft(draft)
            .user(user)
            .action(action)
            .originalDraftJson(originalJson)
            .userComment(userComment)
            .timeToDecideMs(timeToDecideMs);

    if (action == FeedbackAction.MODIFIED && modifiedDraftJson != null) {
      builder.modifiedDraftJson(modifiedDraftJson);
    }

    DraftFeedbackRecord record = feedbackRepository.save(builder.build());

    // Update preference counters
    updatePreferenceCounters(user, action);

    log.info(
        "Draft feedback recorded: userId={}, draftId={}, action={}, decideMs={}",
        userId,
        draftId,
        action,
        timeToDecideMs);

    return record.getId();
  }

  /** Quick convenience for recording an approval (no modifications). */
  @Transactional
  public UUID recordApproval(UUID userId, UUID draftId, Long timeToDecideMs, UUID sessionId) {
    return recordFeedback(
        userId, draftId, FeedbackAction.APPROVED, null, null, timeToDecideMs, sessionId);
  }

  /** Quick convenience for recording a rejection. */
  @Transactional
  public UUID recordRejection(
      UUID userId, UUID draftId, String reason, Long timeToDecideMs, UUID sessionId) {
    return recordFeedback(
        userId, draftId, FeedbackAction.REJECTED, null, reason, timeToDecideMs, sessionId);
  }

  // ── Helpers ──

  private void updatePreferenceCounters(User user, FeedbackAction action) {
    UserCoachPreference prefs =
        preferenceRepository
            .findByUserId(user.getId())
            .orElseGet(
                () -> {
                  log.info("Creating default coach preferences for userId={}", user.getId());
                  return preferenceRepository.save(
                      UserCoachPreference.builder().user(user).build());
                });

    switch (action) {
      case APPROVED -> prefs.recordApproval();
      case MODIFIED -> prefs.recordModification();
      case REJECTED -> prefs.recordRejection();
    }

    preferenceRepository.save(prefs);
  }

  private String serializeDraft(Draft draft) {
    try {
      return objectMapper.writeValueAsString(draft);
    } catch (JsonProcessingException e) {
      log.warn("Failed to serialize draft for feedback record: {}", e.getMessage());
      return "{}";
    }
  }
}
