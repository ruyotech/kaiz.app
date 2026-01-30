package app.kaiz.notification.application;

import app.kaiz.notification.application.NotificationEvents.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Listens for application events and triggers appropriate notifications.
 *
 * <p>This decouples notification creation from the business logic. Services just publish events,
 * and this listener handles the notification creation asynchronously.
 *
 * <p>Benefits: - Services don't need to know about notifications - Notifications are created
 * asynchronously (non-blocking) - Easy to add/modify notification behavior without changing
 * services - Testable in isolation
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventListener {

  private final NotificationTriggerService notificationTrigger;

  // ============================================================
  // TASK EVENT HANDLERS
  // ============================================================

  @Async
  @EventListener
  public void handleTaskCreated(TaskCreated event) {
    log.debug("Handling TaskCreated event for user {}", event.getUserId());
    notificationTrigger.notifyTaskCreated(
        event.getUserId(), event.getTaskId(), event.getTaskTitle());
  }

  @Async
  @EventListener
  public void handleTaskCompleted(TaskCompleted event) {
    log.debug("Handling TaskCompleted event for user {}", event.getUserId());
    notificationTrigger.notifyTaskCompleted(
        event.getUserId(), event.getTaskId(), event.getTaskTitle(), event.getXpEarned());
  }

  @Async
  @EventListener
  public void handleTaskAssigned(TaskAssigned event) {
    log.debug("Handling TaskAssigned event for user {}", event.getUserId());
    notificationTrigger.notifyTaskAssigned(
        event.getUserId(), event.getTaskId(), event.getTaskTitle(), event.getAssignedBy());
  }

  @Async
  @EventListener
  public void handleTaskShared(TaskShared event) {
    log.debug("Handling TaskShared event for user {}", event.getUserId());
    notificationTrigger.notifyTaskShared(
        event.getUserId(),
        event.getTaskId(),
        event.getTaskTitle(),
        event.getSharedBy(),
        event.getSharedByAvatar());
  }

  // ============================================================
  // CHALLENGE EVENT HANDLERS
  // ============================================================

  @Async
  @EventListener
  public void handleChallengeStarted(ChallengeStarted event) {
    log.debug("Handling ChallengeStarted event for user {}", event.getUserId());
    notificationTrigger.notifyChallengeStarted(
        event.getUserId(), event.getChallengeId(), event.getChallengeTitle());
  }

  @Async
  @EventListener
  public void handleChallengeCompleted(ChallengeCompleted event) {
    log.debug("Handling ChallengeCompleted event for user {}", event.getUserId());
    notificationTrigger.notifyChallengeCompleted(
        event.getUserId(), event.getChallengeId(), event.getChallengeTitle(), event.getXpEarned());
  }

  @Async
  @EventListener
  public void handleChallengeMilestone(ChallengeMilestone event) {
    log.debug("Handling ChallengeMilestone event for user {}", event.getUserId());
    notificationTrigger.notifyChallengeMilestone(
        event.getUserId(),
        event.getChallengeId(),
        event.getChallengeTitle(),
        event.getMilestone(),
        event.getTotal());
  }

  @Async
  @EventListener
  public void handleChallengeInvite(ChallengeInvite event) {
    log.debug("Handling ChallengeInvite event for user {}", event.getUserId());
    notificationTrigger.notifyChallengeInvite(
        event.getUserId(),
        event.getChallengeId(),
        event.getChallengeTitle(),
        event.getInvitedBy(),
        event.getInvitedByAvatar());
  }

  @Async
  @EventListener
  public void handleChallengeStreak(ChallengeStreak event) {
    log.debug("Handling ChallengeStreak event for user {}", event.getUserId());
    notificationTrigger.notifyChallengeStreak(
        event.getUserId(),
        event.getChallengeId(),
        event.getChallengeTitle(),
        event.getStreakDays());
  }

  // ============================================================
  // COMMUNITY EVENT HANDLERS
  // ============================================================

  @Async
  @EventListener
  public void handleNewFollower(NewFollower event) {
    log.debug("Handling NewFollower event for user {}", event.getUserId());
    notificationTrigger.notifyNewFollower(
        event.getUserId(),
        event.getFollowerId(),
        event.getFollowerName(),
        event.getFollowerAvatar());
  }

  @Async
  @EventListener
  public void handlePostLiked(PostLiked event) {
    log.debug("Handling PostLiked event for user {}", event.getUserId());
    notificationTrigger.notifyPostLike(
        event.getUserId(),
        event.getPostId(),
        event.getLikerId(),
        event.getLikerName(),
        event.getLikerAvatar());
  }

  @Async
  @EventListener
  public void handlePostCommented(PostCommented event) {
    log.debug("Handling PostCommented event for user {}", event.getUserId());
    notificationTrigger.notifyPostComment(
        event.getUserId(),
        event.getPostId(),
        event.getCommenterId(),
        event.getCommenterName(),
        event.getCommenterAvatar(),
        event.getCommentPreview());
  }

  @Async
  @EventListener
  public void handleUserMentioned(UserMentioned event) {
    log.debug("Handling UserMentioned event for user {}", event.getUserId());
    notificationTrigger.notifyMention(
        event.getUserId(),
        event.getPostId(),
        event.getMentionerId(),
        event.getMentionerName(),
        event.getMentionerAvatar());
  }

  // ============================================================
  // EVENT EVENT HANDLERS
  // ============================================================

  @Async
  @EventListener
  public void handleEventInvite(EventInvite event) {
    log.debug("Handling EventInvite event for user {}", event.getUserId());
    notificationTrigger.notifyEventInvite(
        event.getUserId(),
        event.getEventId(),
        event.getEventTitle(),
        event.getInvitedBy(),
        event.getInvitedByAvatar());
  }

  // ============================================================
  // ACHIEVEMENT EVENT HANDLERS
  // ============================================================

  @Async
  @EventListener
  public void handleAchievementUnlocked(AchievementUnlocked event) {
    log.debug("Handling AchievementUnlocked event for user {}", event.getUserId());
    notificationTrigger.notifyAchievementUnlocked(
        event.getUserId(),
        event.getAchievementId(),
        event.getAchievementTitle(),
        event.getAchievementDescription(),
        event.getXpEarned());
  }

  @Async
  @EventListener
  public void handleLevelUp(LevelUp event) {
    log.debug("Handling LevelUp event for user {}", event.getUserId());
    notificationTrigger.notifyLevelUp(
        event.getUserId(), event.getNewLevel(), event.getUnlockedFeatures());
  }

  // ============================================================
  // LEARNING EVENT HANDLERS
  // ============================================================

  @Async
  @EventListener
  public void handleLessonCompleted(LessonCompleted event) {
    log.debug("Handling LessonCompleted event for user {}", event.getUserId());
    notificationTrigger.notifyLessonCompleted(
        event.getUserId(), event.getLessonId(), event.getLessonTitle(), event.getXpEarned());
  }

  @Async
  @EventListener
  public void handleLearningStreak(LearningStreak event) {
    log.debug("Handling LearningStreak event for user {}", event.getUserId());
    notificationTrigger.notifyLearningStreak(event.getUserId(), event.getStreakDays());
  }
}
