package app.kaiz.notification.domain;

/**
 * Comprehensive notification types for Kaiz. Covers all app features: tasks, challenges, community,
 * learning, events, system, and AI.
 */
public enum NotificationType {
  // ==========================================
  // Task notifications
  // ==========================================
  TASK_ASSIGNED,
  TASK_COMPLETED,
  TASK_CREATED,
  TASK_OVERDUE,
  TASK_DUE_SOON,
  TASK_REMINDER,
  TASK_STATUS_CHANGED,
  TASK_COMMENT,
  TASK_SHARED,
  SPRINT_STARTED,
  SPRINT_ENDING,
  SPRINT_COMPLETED,
  EPIC_MILESTONE,

  // ==========================================
  // Challenge notifications
  // ==========================================
  CHALLENGE_STARTED,
  CHALLENGE_REMINDER,
  CHALLENGE_DAILY_REMINDER,
  CHALLENGE_STREAK,
  CHALLENGE_COMPLETED,
  CHALLENGE_MILESTONE,
  CHALLENGE_INVITATION,
  CHALLENGE_INVITE,
  CHALLENGE_CHEERED,
  CHALLENGE_PARTNER_UPDATE,

  // ==========================================
  // Community notifications
  // ==========================================
  PARTNER_REQUEST,
  PARTNER_ACCEPTED,
  KUDOS_RECEIVED,
  COMPLIMENT_RECEIVED,
  GROUP_INVITATION,
  GROUP_ACTIVITY,
  QUESTION_ANSWERED,
  STORY_LIKED,
  STORY_COMMENT,
  LEADERBOARD_RANK_UP,
  BADGE_EARNED,
  COMMUNITY_NEW_FOLLOWER,
  COMMUNITY_LIKE,
  COMMUNITY_COMMENT,
  COMMUNITY_MENTION,
  FRIEND_ACHIEVEMENT,

  // ==========================================
  // Essentia/Learning notifications
  // ==========================================
  LEARNING_REMINDER,
  STREAK_AT_RISK,
  STREAK_MILESTONE,
  BOOK_COMPLETED,
  CHALLENGE_PROGRESS,
  FLASHCARD_REVIEW,
  ESSENTIA_NEW_LESSON,
  ESSENTIA_LESSON_COMPLETE,
  ESSENTIA_STREAK,
  ESSENTIA_QUIZ_RESULT,

  // ==========================================
  // Event notifications
  // ==========================================
  BIRTHDAY_REMINDER,
  EVENT_REMINDER,
  EVENT_INVITE,
  BILL_DUE,
  ANNIVERSARY,

  // ==========================================
  // System notifications
  // ==========================================
  FEATURE_ANNOUNCEMENT,
  APP_UPDATE,
  SYSTEM_UPDATE,
  TIP_OF_DAY,
  WEEKLY_SUMMARY,
  ACHIEVEMENT_UNLOCKED,
  LEVEL_UP,
  SECURITY_ALERT,

  // ==========================================
  // AI notifications
  // ==========================================
  AI_INSIGHT,
  AI_RECOMMENDATION,
  AI_SUGGESTION,
  AI_DAILY_BRIEF,
  AI_WEEKLY_REVIEW,
  AI_WEEKLY_REPORT,

  // ==========================================
  // Legacy types (for backward compatibility)
  // ==========================================
  @Deprecated
  AI_SCRUM_MASTER,
  @Deprecated
  SYSTEM,
  @Deprecated
  CHALLENGE,
  @Deprecated
  FAMILY,
  @Deprecated
  REMINDER,
  @Deprecated
  ACHIEVEMENT;

  /** Get the category for this notification type. */
  public NotificationCategory getCategory() {
    return switch (this) {
      case TASK_ASSIGNED,
              TASK_COMPLETED,
              TASK_CREATED,
              TASK_OVERDUE,
              TASK_DUE_SOON,
              TASK_REMINDER,
              TASK_STATUS_CHANGED,
              TASK_COMMENT,
              TASK_SHARED,
              SPRINT_STARTED,
              SPRINT_ENDING,
              SPRINT_COMPLETED,
              EPIC_MILESTONE ->
          NotificationCategory.TASKS;

      case CHALLENGE_STARTED,
              CHALLENGE_REMINDER,
              CHALLENGE_DAILY_REMINDER,
              CHALLENGE_STREAK,
              CHALLENGE_COMPLETED,
              CHALLENGE_MILESTONE,
              CHALLENGE_INVITATION,
              CHALLENGE_INVITE,
              CHALLENGE_CHEERED,
              CHALLENGE_PARTNER_UPDATE,
              CHALLENGE ->
          NotificationCategory.CHALLENGES;

      case PARTNER_REQUEST,
              PARTNER_ACCEPTED,
              KUDOS_RECEIVED,
              COMPLIMENT_RECEIVED,
              GROUP_INVITATION,
              GROUP_ACTIVITY,
              QUESTION_ANSWERED,
              STORY_LIKED,
              STORY_COMMENT,
              LEADERBOARD_RANK_UP,
              BADGE_EARNED,
              COMMUNITY_NEW_FOLLOWER,
              COMMUNITY_LIKE,
              COMMUNITY_COMMENT,
              COMMUNITY_MENTION,
              FRIEND_ACHIEVEMENT ->
          NotificationCategory.COMMUNITY;

      case LEARNING_REMINDER,
              STREAK_AT_RISK,
              STREAK_MILESTONE,
              BOOK_COMPLETED,
              CHALLENGE_PROGRESS,
              FLASHCARD_REVIEW,
              ESSENTIA_NEW_LESSON,
              ESSENTIA_LESSON_COMPLETE,
              ESSENTIA_STREAK,
              ESSENTIA_QUIZ_RESULT ->
          NotificationCategory.ESSENTIA;

      case BIRTHDAY_REMINDER,
              EVENT_REMINDER,
              EVENT_INVITE,
              BILL_DUE,
              ANNIVERSARY,
              FAMILY,
              REMINDER ->
          NotificationCategory.EVENTS;

      case FEATURE_ANNOUNCEMENT,
              APP_UPDATE,
              SYSTEM_UPDATE,
              TIP_OF_DAY,
              WEEKLY_SUMMARY,
              ACHIEVEMENT_UNLOCKED,
              LEVEL_UP,
              SECURITY_ALERT,
              SYSTEM,
              ACHIEVEMENT ->
          NotificationCategory.SYSTEM;

      case AI_INSIGHT,
              AI_RECOMMENDATION,
              AI_SUGGESTION,
              AI_DAILY_BRIEF,
              AI_WEEKLY_REVIEW,
              AI_WEEKLY_REPORT,
              AI_SCRUM_MASTER ->
          NotificationCategory.AI;
    };
  }

  /** Get the default icon for this notification type. */
  public String getDefaultIcon() {
    return switch (this) {
      case TASK_ASSIGNED -> "clipboard-plus-outline";
      case TASK_COMPLETED -> "check-circle";
      case TASK_CREATED -> "clipboard-plus";
      case TASK_OVERDUE -> "clock-alert-outline";
      case TASK_DUE_SOON -> "clock-outline";
      case TASK_REMINDER -> "bell-ring-outline";
      case TASK_STATUS_CHANGED -> "swap-horizontal";
      case TASK_COMMENT -> "comment-outline";
      case TASK_SHARED -> "share-variant-outline";
      case SPRINT_STARTED -> "rocket-launch";
      case SPRINT_ENDING -> "timer-sand";
      case SPRINT_COMPLETED -> "flag-checkered";
      case EPIC_MILESTONE -> "star-circle-outline";
      case CHALLENGE_STARTED -> "rocket-launch-outline";
      case CHALLENGE_REMINDER, CHALLENGE_DAILY_REMINDER -> "bell-ring";
      case CHALLENGE_STREAK -> "fire";
      case CHALLENGE_COMPLETED -> "trophy";
      case CHALLENGE_MILESTONE -> "medal";
      case CHALLENGE_INVITATION, CHALLENGE_INVITE -> "account-plus";
      case CHALLENGE_CHEERED -> "hand-clap";
      case CHALLENGE_PARTNER_UPDATE -> "account-check";
      case PARTNER_REQUEST -> "account-plus-outline";
      case PARTNER_ACCEPTED -> "account-check-outline";
      case KUDOS_RECEIVED, COMMUNITY_LIKE -> "heart-outline";
      case COMPLIMENT_RECEIVED -> "gift-outline";
      case GROUP_INVITATION -> "account-group-outline";
      case GROUP_ACTIVITY -> "account-group";
      case QUESTION_ANSWERED -> "comment-check-outline";
      case STORY_LIKED -> "thumb-up-outline";
      case STORY_COMMENT, COMMUNITY_COMMENT -> "message-outline";
      case LEADERBOARD_RANK_UP -> "trending-up";
      case BADGE_EARNED -> "shield-star";
      case COMMUNITY_NEW_FOLLOWER -> "account-plus-outline";
      case COMMUNITY_MENTION -> "at";
      case FRIEND_ACHIEVEMENT -> "trophy-outline";
      case LEARNING_REMINDER -> "book-open-variant";
      case STREAK_AT_RISK -> "fire-alert";
      case STREAK_MILESTONE, ESSENTIA_STREAK -> "fire";
      case BOOK_COMPLETED -> "book-check";
      case CHALLENGE_PROGRESS -> "progress-check";
      case FLASHCARD_REVIEW -> "cards-outline";
      case ESSENTIA_NEW_LESSON -> "book-plus-outline";
      case ESSENTIA_LESSON_COMPLETE -> "book-check-outline";
      case ESSENTIA_QUIZ_RESULT -> "clipboard-check-outline";
      case BIRTHDAY_REMINDER -> "cake-variant";
      case EVENT_REMINDER -> "calendar-alert";
      case EVENT_INVITE -> "calendar-plus";
      case BILL_DUE -> "receipt";
      case ANNIVERSARY -> "heart";
      case FEATURE_ANNOUNCEMENT -> "bullhorn-outline";
      case APP_UPDATE, SYSTEM_UPDATE -> "cellphone-arrow-down";
      case TIP_OF_DAY -> "lightbulb-outline";
      case WEEKLY_SUMMARY -> "chart-bar";
      case ACHIEVEMENT_UNLOCKED -> "trophy-award";
      case LEVEL_UP -> "arrow-up-circle";
      case SECURITY_ALERT -> "shield-alert-outline";
      case AI_INSIGHT -> "robot-happy-outline";
      case AI_RECOMMENDATION, AI_SUGGESTION -> "lightbulb-on-outline";
      case AI_DAILY_BRIEF -> "weather-sunny";
      case AI_WEEKLY_REVIEW, AI_WEEKLY_REPORT -> "chart-timeline-variant";
      default -> "bell-outline";
    };
  }

  /** Get the default color for this notification type. */
  public String getDefaultColor() {
    return getCategory().getColor();
  }
}
