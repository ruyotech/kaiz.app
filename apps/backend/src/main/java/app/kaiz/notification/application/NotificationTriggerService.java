package app.kaiz.notification.application;

import app.kaiz.notification.application.dto.CreateNotificationRequest;
import app.kaiz.notification.application.dto.NotificationDto;
import app.kaiz.notification.domain.NotificationPriority;
import app.kaiz.notification.domain.NotificationType;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Service for triggering notifications based on app events. This service is called from other
 * services when events occur.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationTriggerService {

  private final NotificationService notificationService;

  // ============ Task Notifications ============

  @Async
  public void notifyTaskCreated(UUID userId, UUID taskId, String taskTitle) {
    createNotification(
        userId,
        NotificationType.TASK_CREATED,
        "Task Created",
        String.format("New task \"%s\" has been created", taskTitle),
        NotificationPriority.LOW,
        String.format("/tasks/%s", taskId),
        Map.of("taskId", taskId.toString()));
  }

  @Async
  public void notifyTaskCompleted(UUID userId, UUID taskId, String taskTitle, int xpEarned) {
    createNotification(
        userId,
        NotificationType.TASK_COMPLETED,
        "Task Completed! 🎉",
        String.format("Great job! You completed \"%s\" and earned %d XP", taskTitle, xpEarned),
        NotificationPriority.MEDIUM,
        String.format("/tasks/%s", taskId),
        Map.of("taskId", taskId.toString(), "xpEarned", xpEarned),
        List.of(
            new CreateNotificationRequest.ActionRequest(
                "view", "View Details", "view_task", "primary"),
            new CreateNotificationRequest.ActionRequest(
                "dismiss", "Dismiss", "dismiss", "secondary")));
  }

  @Async
  public void notifyTaskDueSoon(UUID userId, UUID taskId, String taskTitle, int hoursUntilDue) {
    NotificationPriority priority =
        hoursUntilDue <= 1
            ? NotificationPriority.URGENT
            : hoursUntilDue <= 6 ? NotificationPriority.HIGH : NotificationPriority.MEDIUM;

    createNotification(
        userId,
        NotificationType.TASK_DUE_SOON,
        "Task Due Soon ⏰",
        String.format(
            "\"%s\" is due in %d hour%s", taskTitle, hoursUntilDue, hoursUntilDue == 1 ? "" : "s"),
        priority,
        String.format("/tasks/%s", taskId),
        Map.of("taskId", taskId.toString(), "hoursUntilDue", hoursUntilDue),
        List.of(
            new CreateNotificationRequest.ActionRequest(
                "complete", "Mark Complete", "complete_task", "primary"),
            new CreateNotificationRequest.ActionRequest(
                "snooze", "Snooze", "snooze_task", "secondary")));
  }

  @Async
  public void notifyTaskOverdue(UUID userId, UUID taskId, String taskTitle) {
    createNotification(
        userId,
        NotificationType.TASK_OVERDUE,
        "Task Overdue ⚠️",
        String.format("\"%s\" is now overdue", taskTitle),
        NotificationPriority.URGENT,
        String.format("/tasks/%s", taskId),
        Map.of("taskId", taskId.toString()),
        List.of(
            new CreateNotificationRequest.ActionRequest(
                "complete", "Mark Complete", "complete_task", "primary"),
            new CreateNotificationRequest.ActionRequest(
                "reschedule", "Reschedule", "reschedule_task", "secondary")));
  }

  @Async
  public void notifyTaskAssigned(UUID userId, UUID taskId, String taskTitle, String assignedBy) {
    createNotificationWithSender(
        userId,
        NotificationType.TASK_ASSIGNED,
        "New Task Assigned",
        String.format("%s assigned you a new task: \"%s\"", assignedBy, taskTitle),
        NotificationPriority.HIGH,
        String.format("/tasks/%s", taskId),
        Map.of("taskId", taskId.toString()),
        null,
        assignedBy,
        null);
  }

  @Async
  public void notifyTaskShared(
      UUID userId, UUID taskId, String taskTitle, String sharedBy, String sharedByAvatar) {
    createNotificationWithSender(
        userId,
        NotificationType.TASK_SHARED,
        "Task Shared With You",
        String.format("%s shared a task with you: \"%s\"", sharedBy, taskTitle),
        NotificationPriority.MEDIUM,
        String.format("/tasks/%s", taskId),
        Map.of("taskId", taskId.toString()),
        null,
        sharedBy,
        sharedByAvatar);
  }

  // ============ Challenge Notifications ============

  @Async
  public void notifyChallengeStarted(UUID userId, UUID challengeId, String challengeTitle) {
    createNotification(
        userId,
        NotificationType.CHALLENGE_STARTED,
        "Challenge Started! 🚀",
        String.format("Your challenge \"%s\" has begun. Good luck!", challengeTitle),
        NotificationPriority.MEDIUM,
        String.format("/challenges/%s", challengeId),
        Map.of("challengeId", challengeId.toString()));
  }

  @Async
  public void notifyChallengeMilestone(
      UUID userId, UUID challengeId, String challengeTitle, int milestone, int total) {
    createNotification(
        userId,
        NotificationType.CHALLENGE_MILESTONE,
        String.format("Milestone Reached! %d/%d 🎯", milestone, total),
        String.format("You've reached day %d of %d in \"%s\"!", milestone, total, challengeTitle),
        NotificationPriority.MEDIUM,
        String.format("/challenges/%s", challengeId),
        Map.of("challengeId", challengeId.toString(), "milestone", milestone, "total", total));
  }

  @Async
  public void notifyChallengeCompleted(
      UUID userId, UUID challengeId, String challengeTitle, int xpEarned) {
    createNotification(
        userId,
        NotificationType.CHALLENGE_COMPLETED,
        "Challenge Completed! 🏆",
        String.format(
            "Congratulations! You completed \"%s\" and earned %d XP!", challengeTitle, xpEarned),
        NotificationPriority.HIGH,
        String.format("/challenges/%s", challengeId),
        Map.of("challengeId", challengeId.toString(), "xpEarned", xpEarned),
        List.of(
            new CreateNotificationRequest.ActionRequest(
                "share", "Share Achievement", "share_challenge", "primary"),
            new CreateNotificationRequest.ActionRequest(
                "view", "View Details", "view_challenge", "secondary")));
  }

  @Async
  public void notifyChallengeStreak(
      UUID userId, UUID challengeId, String challengeTitle, int streakDays) {
    createNotification(
        userId,
        NotificationType.CHALLENGE_STREAK,
        String.format("%d Day Streak! 🔥", streakDays),
        String.format(
            "You're on a %d-day streak in \"%s\"! Keep it up!", streakDays, challengeTitle),
        NotificationPriority.MEDIUM,
        String.format("/challenges/%s", challengeId),
        Map.of("challengeId", challengeId.toString(), "streakDays", streakDays));
  }

  @Async
  public void notifyDailyChallengeReminder(UUID userId, UUID challengeId, String challengeTitle) {
    createNotification(
        userId,
        NotificationType.CHALLENGE_DAILY_REMINDER,
        "Daily Challenge Reminder ⏰",
        String.format("Don't forget to complete today's task for \"%s\"", challengeTitle),
        NotificationPriority.MEDIUM,
        String.format("/challenges/%s", challengeId),
        Map.of("challengeId", challengeId.toString()),
        List.of(
            new CreateNotificationRequest.ActionRequest(
                "checkin", "Check In", "challenge_checkin", "primary")));
  }

  @Async
  public void notifyChallengeInvite(
      UUID userId,
      UUID challengeId,
      String challengeTitle,
      String invitedBy,
      String invitedByAvatar) {
    createNotificationWithSender(
        userId,
        NotificationType.CHALLENGE_INVITE,
        "Challenge Invitation",
        String.format("%s invited you to join \"%s\"", invitedBy, challengeTitle),
        NotificationPriority.MEDIUM,
        String.format("/challenges/%s", challengeId),
        Map.of("challengeId", challengeId.toString()),
        null,
        invitedBy,
        invitedByAvatar);
  }

  // ============ Community Notifications ============

  @Async
  public void notifyNewFollower(
      UUID userId, UUID followerId, String followerName, String followerAvatar) {
    createNotificationWithSender(
        userId,
        NotificationType.COMMUNITY_NEW_FOLLOWER,
        "New Follower",
        String.format("%s started following you", followerName),
        NotificationPriority.LOW,
        String.format("/profile/%s", followerId),
        Map.of("followerId", followerId.toString()),
        followerId,
        followerName,
        followerAvatar);
  }

  @Async
  public void notifyPostLike(
      UUID userId, UUID postId, UUID likerId, String likerName, String likerAvatar) {
    createNotificationWithSender(
        userId,
        NotificationType.COMMUNITY_LIKE,
        "New Like",
        String.format("%s liked your post", likerName),
        NotificationPriority.LOW,
        String.format("/community/posts/%s", postId),
        Map.of("postId", postId.toString()),
        likerId,
        likerName,
        likerAvatar);
  }

  @Async
  public void notifyPostComment(
      UUID userId,
      UUID postId,
      UUID commenterId,
      String commenterName,
      String commenterAvatar,
      String commentPreview) {
    createNotificationWithSender(
        userId,
        NotificationType.COMMUNITY_COMMENT,
        "New Comment",
        String.format("%s commented: \"%s\"", commenterName, truncate(commentPreview, 50)),
        NotificationPriority.MEDIUM,
        String.format("/community/posts/%s", postId),
        Map.of("postId", postId.toString()),
        commenterId,
        commenterName,
        commenterAvatar);
  }

  @Async
  public void notifyMention(
      UUID userId, UUID postId, UUID mentionerId, String mentionerName, String mentionerAvatar) {
    createNotificationWithSender(
        userId,
        NotificationType.COMMUNITY_MENTION,
        "You Were Mentioned",
        String.format("%s mentioned you in a post", mentionerName),
        NotificationPriority.MEDIUM,
        String.format("/community/posts/%s", postId),
        Map.of("postId", postId.toString()),
        mentionerId,
        mentionerName,
        mentionerAvatar);
  }

  @Async
  public void notifyFriendAchievement(
      UUID userId, UUID friendId, String friendName, String friendAvatar, String achievement) {
    createNotificationWithSender(
        userId,
        NotificationType.FRIEND_ACHIEVEMENT,
        "Friend Achievement",
        String.format("%s just earned \"%s\"!", friendName, achievement),
        NotificationPriority.LOW,
        String.format("/profile/%s", friendId),
        Map.of("friendId", friendId.toString(), "achievement", achievement),
        friendId,
        friendName,
        friendAvatar);
  }

  // ============ Event Notifications ============

  @Async
  public void notifyBirthdayReminder(
      UUID userId, String friendName, String friendAvatar, UUID friendId) {
    createNotificationWithSender(
        userId,
        NotificationType.BIRTHDAY_REMINDER,
        "Birthday Reminder \uD83C\uDF82",
        String.format("It's %s's birthday today! Send them a wish!", friendName),
        NotificationPriority.MEDIUM,
        String.format("/profile/%s", friendId),
        Map.of("friendId", friendId.toString()),
        friendId,
        friendName,
        friendAvatar);
  }

  @Async
  public void notifyEventReminder(UUID userId, UUID eventId, String eventTitle, int minutesUntil) {
    NotificationPriority priority =
        minutesUntil <= 15
            ? NotificationPriority.URGENT
            : minutesUntil <= 60 ? NotificationPriority.HIGH : NotificationPriority.MEDIUM;

    String timeStr =
        minutesUntil >= 60
            ? String.format("%d hour%s", minutesUntil / 60, minutesUntil / 60 == 1 ? "" : "s")
            : String.format("%d minute%s", minutesUntil, minutesUntil == 1 ? "" : "s");

    createNotification(
        userId,
        NotificationType.EVENT_REMINDER,
        "Event Reminder 📅",
        String.format("\"%s\" starts in %s", eventTitle, timeStr),
        priority,
        String.format("/calendar/events/%s", eventId),
        Map.of("eventId", eventId.toString(), "minutesUntil", minutesUntil));
  }

  @Async
  public void notifyEventInvite(
      UUID userId, UUID eventId, String eventTitle, String invitedBy, String invitedByAvatar) {
    createNotificationWithSender(
        userId,
        NotificationType.EVENT_INVITE,
        "Event Invitation",
        String.format("%s invited you to \"%s\"", invitedBy, eventTitle),
        NotificationPriority.MEDIUM,
        String.format("/calendar/events/%s", eventId),
        Map.of("eventId", eventId.toString()),
        null,
        invitedBy,
        invitedByAvatar);
  }

  // ============ Essentia (Learning) Notifications ============

  @Async
  public void notifyNewLesson(UUID userId, UUID lessonId, String lessonTitle, String topic) {
    createNotification(
        userId,
        NotificationType.ESSENTIA_NEW_LESSON,
        "New Lesson Available 📚",
        String.format("New %s lesson: \"%s\"", topic, lessonTitle),
        NotificationPriority.LOW,
        String.format("/essentia/lessons/%s", lessonId),
        Map.of("lessonId", lessonId.toString(), "topic", topic));
  }

  @Async
  public void notifyLessonCompleted(UUID userId, UUID lessonId, String lessonTitle, int xpEarned) {
    createNotification(
        userId,
        NotificationType.ESSENTIA_LESSON_COMPLETE,
        "Lesson Completed! 🎓",
        String.format("You completed \"%s\" and earned %d XP", lessonTitle, xpEarned),
        NotificationPriority.MEDIUM,
        String.format("/essentia/lessons/%s", lessonId),
        Map.of("lessonId", lessonId.toString(), "xpEarned", xpEarned));
  }

  @Async
  public void notifyLearningStreak(UUID userId, int streakDays) {
    createNotification(
        userId,
        NotificationType.ESSENTIA_STREAK,
        String.format("%d Day Learning Streak! 🔥", streakDays),
        String.format(
            "You've been learning for %d days straight! Keep up the great work!", streakDays),
        NotificationPriority.MEDIUM,
        "/essentia",
        Map.of("streakDays", streakDays));
  }

  @Async
  public void notifyQuizResult(UUID userId, UUID quizId, int score, int total, boolean passed) {
    String emoji = passed ? "✅" : "📝";
    String message =
        passed
            ? String.format("Congratulations! You passed with %d/%d", score, total)
            : String.format("You scored %d/%d. Keep practicing!", score, total);

    createNotification(
        userId,
        NotificationType.ESSENTIA_QUIZ_RESULT,
        String.format("Quiz Result %s", emoji),
        message,
        passed ? NotificationPriority.MEDIUM : NotificationPriority.LOW,
        String.format("/essentia/quizzes/%s", quizId),
        Map.of("quizId", quizId.toString(), "score", score, "total", total, "passed", passed));
  }

  // ============ AI Notifications ============

  @Async
  public void notifyAiInsight(
      UUID userId, String insightTitle, String insightContent, String category) {
    createNotification(
        userId,
        NotificationType.AI_INSIGHT,
        insightTitle + " 💡",
        insightContent,
        NotificationPriority.LOW,
        "/ai/insights",
        Map.of("category", category));
  }

  @Async
  public void notifyAiSuggestion(UUID userId, String suggestion, String context) {
    createNotification(
        userId,
        NotificationType.AI_SUGGESTION,
        "AI Suggestion 🤖",
        suggestion,
        NotificationPriority.LOW,
        "/ai/suggestions",
        Map.of("context", context));
  }

  @Async
  public void notifyWeeklyReport(
      UUID userId, int tasksCompleted, int challengeProgress, int xpEarned) {
    createNotification(
        userId,
        NotificationType.AI_WEEKLY_REPORT,
        "Weekly Report Ready 📊",
        String.format(
            "This week: %d tasks completed, %d%% challenge progress, %d XP earned",
            tasksCompleted, challengeProgress, xpEarned),
        NotificationPriority.MEDIUM,
        "/ai/weekly-report",
        Map.of(
            "tasksCompleted",
            tasksCompleted,
            "challengeProgress",
            challengeProgress,
            "xpEarned",
            xpEarned),
        Instant.now().plus(7, ChronoUnit.DAYS) // Expires in 7 days
        );
  }

  // ============ System Notifications ============

  @Async
  public void notifySystemUpdate(UUID userId, String version, String changelog) {
    createNotification(
        userId,
        NotificationType.SYSTEM_UPDATE,
        String.format("App Updated to v%s ✨", version),
        changelog,
        NotificationPriority.LOW,
        "/settings/changelog",
        Map.of("version", version));
  }

  @Async
  public void notifyLevelUp(UUID userId, int newLevel, List<String> unlockedFeatures) {
    String featuresText =
        unlockedFeatures.isEmpty()
            ? ""
            : String.format(" You unlocked: %s", String.join(", ", unlockedFeatures));

    createNotification(
        userId,
        NotificationType.LEVEL_UP,
        String.format("Level Up! Level %d 🎊", newLevel),
        String.format("Congratulations on reaching level %d!%s", newLevel, featuresText),
        NotificationPriority.HIGH,
        "/profile",
        Map.of("newLevel", newLevel, "unlockedFeatures", unlockedFeatures),
        List.of(
            new CreateNotificationRequest.ActionRequest(
                "share", "Share Achievement", "share_level", "primary")));
  }

  @Async
  public void notifyAchievementUnlocked(
      UUID userId,
      String achievementId,
      String achievementTitle,
      String achievementDescription,
      int xpEarned) {
    createNotification(
        userId,
        NotificationType.ACHIEVEMENT_UNLOCKED,
        String.format("Achievement Unlocked! 🏅"),
        String.format(
            "You earned \"%s\": %s (+%d XP)", achievementTitle, achievementDescription, xpEarned),
        NotificationPriority.HIGH,
        "/profile/achievements",
        Map.of("achievementId", achievementId, "xpEarned", xpEarned),
        List.of(
            new CreateNotificationRequest.ActionRequest(
                "share", "Share", "share_achievement", "primary"),
            new CreateNotificationRequest.ActionRequest(
                "view", "View All", "view_achievements", "secondary")));
  }

  @Async
  public void notifySecurityAlert(UUID userId, String alertType, String details) {
    createNotification(
        userId,
        NotificationType.SECURITY_ALERT,
        "Security Alert ⚠️",
        String.format("%s: %s", alertType, details),
        NotificationPriority.URGENT,
        "/settings/security",
        Map.of("alertType", alertType));
  }

  // ============ Helper Methods ============

  private NotificationDto createNotification(
      UUID userId,
      NotificationType type,
      String title,
      String content,
      NotificationPriority priority,
      String deepLink,
      Map<String, Object> metadata) {
    return createNotification(
        userId, type, title, content, priority, deepLink, metadata, null, null);
  }

  private NotificationDto createNotification(
      UUID userId,
      NotificationType type,
      String title,
      String content,
      NotificationPriority priority,
      String deepLink,
      Map<String, Object> metadata,
      List<CreateNotificationRequest.ActionRequest> actions) {
    return createNotification(
        userId, type, title, content, priority, deepLink, metadata, actions, null);
  }

  private NotificationDto createNotification(
      UUID userId,
      NotificationType type,
      String title,
      String content,
      NotificationPriority priority,
      String deepLink,
      Map<String, Object> metadata,
      Instant expiresAt) {
    return createNotification(
        userId, type, title, content, priority, deepLink, metadata, null, expiresAt);
  }

  private NotificationDto createNotification(
      UUID userId,
      NotificationType type,
      String title,
      String content,
      NotificationPriority priority,
      String deepLink,
      Map<String, Object> metadata,
      List<CreateNotificationRequest.ActionRequest> actions,
      Instant expiresAt) {

    try {
      CreateNotificationRequest request =
          new CreateNotificationRequest(
              userId,
              type,
              type.getCategory(),
              priority,
              title,
              content,
              type.getDefaultIcon(),
              deepLink,
              expiresAt,
              null,
              null,
              null,
              metadata,
              actions);

      return notificationService.createNotification(request);
    } catch (org.springframework.dao.DataAccessException e) {
      log.error("Failed to create notification for user {}: {}", userId, e.getMessage(), e);
      return null;
    }
  }

  private NotificationDto createNotificationWithSender(
      UUID userId,
      NotificationType type,
      String title,
      String content,
      NotificationPriority priority,
      String deepLink,
      Map<String, Object> metadata,
      UUID senderId,
      String senderName,
      String senderAvatar) {

    try {
      CreateNotificationRequest request =
          new CreateNotificationRequest(
              userId,
              type,
              type.getCategory(),
              priority,
              title,
              content,
              type.getDefaultIcon(),
              deepLink,
              null,
              senderId,
              senderName,
              senderAvatar,
              metadata,
              null);

      return notificationService.createNotification(request);
    } catch (org.springframework.dao.DataAccessException e) {
      log.error("Failed to create notification for user {}: {}", userId, e.getMessage(), e);
      return null;
    }
  }

  private String truncate(String text, int maxLength) {
    if (text == null || text.length() <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - 3) + "...";
  }
}
