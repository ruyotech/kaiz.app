package app.kaiz.notification.application;

import java.util.UUID;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Application events that trigger notifications.
 *
 * <p>When something happens in the app (task created, challenge joined, etc.), the relevant service
 * publishes an event. The NotificationEventListener listens and creates appropriate notifications.
 *
 * <p>Usage in other services:
 *
 * <pre>{@code
 * @Service
 * public class TaskService {
 *     private final ApplicationEventPublisher eventPublisher;
 *
 *     public Task completeTask(UUID taskId) {
 *         Task task = // ... complete task logic
 *
 *         // Publish event - notification will be created automatically
 *         eventPublisher.publishEvent(new NotificationEvents.TaskCompleted(
 *             this, task.getUser().getId(), task.getId(), task.getTitle(), 50 // xp earned
 *         ));
 *
 *         return task;
 *     }
 * }
 * }</pre>
 */
public final class NotificationEvents {

  private NotificationEvents() {} // Utility class

  // ============================================================
  // BASE EVENT
  // ============================================================
  @Getter
  public abstract static class BaseNotificationEvent extends ApplicationEvent {
    private final UUID userId;

    protected BaseNotificationEvent(Object source, UUID userId) {
      super(source);
      this.userId = userId;
    }
  }

  // ============================================================
  // TASK EVENTS
  // ============================================================

  @Getter
  public static class TaskCreated extends BaseNotificationEvent {
    private final UUID taskId;
    private final String taskTitle;

    public TaskCreated(Object source, UUID userId, UUID taskId, String taskTitle) {
      super(source, userId);
      this.taskId = taskId;
      this.taskTitle = taskTitle;
    }
  }

  @Getter
  public static class TaskCompleted extends BaseNotificationEvent {
    private final UUID taskId;
    private final String taskTitle;
    private final int xpEarned;

    public TaskCompleted(Object source, UUID userId, UUID taskId, String taskTitle, int xpEarned) {
      super(source, userId);
      this.taskId = taskId;
      this.taskTitle = taskTitle;
      this.xpEarned = xpEarned;
    }
  }

  @Getter
  public static class TaskAssigned extends BaseNotificationEvent {
    private final UUID taskId;
    private final String taskTitle;
    private final String assignedBy;

    public TaskAssigned(
        Object source, UUID userId, UUID taskId, String taskTitle, String assignedBy) {
      super(source, userId);
      this.taskId = taskId;
      this.taskTitle = taskTitle;
      this.assignedBy = assignedBy;
    }
  }

  @Getter
  public static class TaskShared extends BaseNotificationEvent {
    private final UUID taskId;
    private final String taskTitle;
    private final String sharedBy;
    private final String sharedByAvatar;

    public TaskShared(
        Object source,
        UUID userId,
        UUID taskId,
        String taskTitle,
        String sharedBy,
        String sharedByAvatar) {
      super(source, userId);
      this.taskId = taskId;
      this.taskTitle = taskTitle;
      this.sharedBy = sharedBy;
      this.sharedByAvatar = sharedByAvatar;
    }
  }

  // ============================================================
  // CHALLENGE EVENTS
  // ============================================================

  @Getter
  public static class ChallengeStarted extends BaseNotificationEvent {
    private final UUID challengeId;
    private final String challengeTitle;

    public ChallengeStarted(Object source, UUID userId, UUID challengeId, String challengeTitle) {
      super(source, userId);
      this.challengeId = challengeId;
      this.challengeTitle = challengeTitle;
    }
  }

  @Getter
  public static class ChallengeCompleted extends BaseNotificationEvent {
    private final UUID challengeId;
    private final String challengeTitle;
    private final int xpEarned;

    public ChallengeCompleted(
        Object source, UUID userId, UUID challengeId, String challengeTitle, int xpEarned) {
      super(source, userId);
      this.challengeId = challengeId;
      this.challengeTitle = challengeTitle;
      this.xpEarned = xpEarned;
    }
  }

  @Getter
  public static class ChallengeMilestone extends BaseNotificationEvent {
    private final UUID challengeId;
    private final String challengeTitle;
    private final int milestone;
    private final int total;

    public ChallengeMilestone(
        Object source,
        UUID userId,
        UUID challengeId,
        String challengeTitle,
        int milestone,
        int total) {
      super(source, userId);
      this.challengeId = challengeId;
      this.challengeTitle = challengeTitle;
      this.milestone = milestone;
      this.total = total;
    }
  }

  @Getter
  public static class ChallengeInvite extends BaseNotificationEvent {
    private final UUID challengeId;
    private final String challengeTitle;
    private final String invitedBy;
    private final String invitedByAvatar;

    public ChallengeInvite(
        Object source,
        UUID userId,
        UUID challengeId,
        String challengeTitle,
        String invitedBy,
        String invitedByAvatar) {
      super(source, userId);
      this.challengeId = challengeId;
      this.challengeTitle = challengeTitle;
      this.invitedBy = invitedBy;
      this.invitedByAvatar = invitedByAvatar;
    }
  }

  @Getter
  public static class ChallengeStreak extends BaseNotificationEvent {
    private final UUID challengeId;
    private final String challengeTitle;
    private final int streakDays;

    public ChallengeStreak(
        Object source, UUID userId, UUID challengeId, String challengeTitle, int streakDays) {
      super(source, userId);
      this.challengeId = challengeId;
      this.challengeTitle = challengeTitle;
      this.streakDays = streakDays;
    }
  }

  // ============================================================
  // COMMUNITY EVENTS
  // ============================================================

  @Getter
  public static class NewFollower extends BaseNotificationEvent {
    private final UUID followerId;
    private final String followerName;
    private final String followerAvatar;

    public NewFollower(
        Object source, UUID userId, UUID followerId, String followerName, String followerAvatar) {
      super(source, userId);
      this.followerId = followerId;
      this.followerName = followerName;
      this.followerAvatar = followerAvatar;
    }
  }

  @Getter
  public static class PostLiked extends BaseNotificationEvent {
    private final UUID postId;
    private final UUID likerId;
    private final String likerName;
    private final String likerAvatar;

    public PostLiked(
        Object source,
        UUID userId,
        UUID postId,
        UUID likerId,
        String likerName,
        String likerAvatar) {
      super(source, userId);
      this.postId = postId;
      this.likerId = likerId;
      this.likerName = likerName;
      this.likerAvatar = likerAvatar;
    }
  }

  @Getter
  public static class PostCommented extends BaseNotificationEvent {
    private final UUID postId;
    private final UUID commenterId;
    private final String commenterName;
    private final String commenterAvatar;
    private final String commentPreview;

    public PostCommented(
        Object source,
        UUID userId,
        UUID postId,
        UUID commenterId,
        String commenterName,
        String commenterAvatar,
        String commentPreview) {
      super(source, userId);
      this.postId = postId;
      this.commenterId = commenterId;
      this.commenterName = commenterName;
      this.commenterAvatar = commenterAvatar;
      this.commentPreview = commentPreview;
    }
  }

  @Getter
  public static class UserMentioned extends BaseNotificationEvent {
    private final UUID postId;
    private final UUID mentionerId;
    private final String mentionerName;
    private final String mentionerAvatar;

    public UserMentioned(
        Object source,
        UUID userId,
        UUID postId,
        UUID mentionerId,
        String mentionerName,
        String mentionerAvatar) {
      super(source, userId);
      this.postId = postId;
      this.mentionerId = mentionerId;
      this.mentionerName = mentionerName;
      this.mentionerAvatar = mentionerAvatar;
    }
  }

  // ============================================================
  // EVENT EVENTS
  // ============================================================

  @Getter
  public static class EventInvite extends BaseNotificationEvent {
    private final UUID eventId;
    private final String eventTitle;
    private final String invitedBy;
    private final String invitedByAvatar;

    public EventInvite(
        Object source,
        UUID userId,
        UUID eventId,
        String eventTitle,
        String invitedBy,
        String invitedByAvatar) {
      super(source, userId);
      this.eventId = eventId;
      this.eventTitle = eventTitle;
      this.invitedBy = invitedBy;
      this.invitedByAvatar = invitedByAvatar;
    }
  }

  // ============================================================
  // ACHIEVEMENT EVENTS
  // ============================================================

  @Getter
  public static class AchievementUnlocked extends BaseNotificationEvent {
    private final String achievementId;
    private final String achievementTitle;
    private final String achievementDescription;
    private final int xpEarned;

    public AchievementUnlocked(
        Object source,
        UUID userId,
        String achievementId,
        String achievementTitle,
        String achievementDescription,
        int xpEarned) {
      super(source, userId);
      this.achievementId = achievementId;
      this.achievementTitle = achievementTitle;
      this.achievementDescription = achievementDescription;
      this.xpEarned = xpEarned;
    }
  }

  @Getter
  public static class LevelUp extends BaseNotificationEvent {
    private final int newLevel;
    private final java.util.List<String> unlockedFeatures;

    public LevelUp(
        Object source, UUID userId, int newLevel, java.util.List<String> unlockedFeatures) {
      super(source, userId);
      this.newLevel = newLevel;
      this.unlockedFeatures = unlockedFeatures;
    }
  }

  // ============================================================
  // LEARNING EVENTS
  // ============================================================

  @Getter
  public static class LessonCompleted extends BaseNotificationEvent {
    private final UUID lessonId;
    private final String lessonTitle;
    private final int xpEarned;

    public LessonCompleted(
        Object source, UUID userId, UUID lessonId, String lessonTitle, int xpEarned) {
      super(source, userId);
      this.lessonId = lessonId;
      this.lessonTitle = lessonTitle;
      this.xpEarned = xpEarned;
    }
  }

  @Getter
  public static class LearningStreak extends BaseNotificationEvent {
    private final int streakDays;

    public LearningStreak(Object source, UUID userId, int streakDays) {
      super(source, userId);
      this.streakDays = streakDays;
    }
  }
}
