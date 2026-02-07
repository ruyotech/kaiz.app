package app.kaiz.notification.application;

import app.kaiz.identity.infrastructure.UserRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Scheduled jobs for generating time-based notifications.
 *
 * <p>This service runs periodic checks to generate notifications for: - Upcoming task deadlines -
 * Birthday reminders - Event reminders - Challenge daily check-ins - Streak warnings - Weekly
 * reports
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationScheduler {

  private final NotificationTriggerService notificationTrigger;
  private final UserRepository userRepository;

  // Inject your other repositories as needed:
  // private final TaskRepository taskRepository;
  // private final ChallengeRepository challengeRepository;
  // private final EventRepository eventRepository;
  // private final FriendRepository friendRepository;

  // ============================================================
  // TASK DEADLINE NOTIFICATIONS
  // Runs every 15 minutes to check for upcoming deadlines
  // ============================================================
  @Scheduled(cron = "0 */15 * * * *", zone = "UTC") // Every 15 minutes
  @Transactional(readOnly = true)
  public void checkTaskDeadlines() {
    log.debug("Running task deadline check...");

    Instant now = Instant.now();
    Instant oneHourLater = now.plus(1, ChronoUnit.HOURS);
    Instant sixHoursLater = now.plus(6, ChronoUnit.HOURS);
    Instant oneDayLater = now.plus(24, ChronoUnit.HOURS);

    // Example: Find tasks due within different time windows
    // Uncomment and adapt when TaskRepository is available:
    /*
    // Tasks due in 1 hour (URGENT)
    List<Task> urgentTasks = taskRepository.findByDueDateBetweenAndCompletedFalse(now, oneHourLater);
    for (Task task : urgentTasks) {
      notificationTrigger.notifyTaskDueSoon(
          task.getUser().getId(),
          task.getId(),
          task.getTitle(),
          1 // hours until due
      );
    }

    // Tasks due in 6 hours (HIGH priority)
    List<Task> soonTasks = taskRepository.findByDueDateBetweenAndCompletedFalse(oneHourLater, sixHoursLater);
    for (Task task : soonTasks) {
      long hoursUntilDue = ChronoUnit.HOURS.between(now, task.getDueDate());
      notificationTrigger.notifyTaskDueSoon(
          task.getUser().getId(),
          task.getId(),
          task.getTitle(),
          (int) hoursUntilDue
      );
    }

    // Find overdue tasks
    List<Task> overdueTasks = taskRepository.findByDueDateBeforeAndCompletedFalse(now);
    for (Task task : overdueTasks) {
      notificationTrigger.notifyTaskOverdue(
          task.getUser().getId(),
          task.getId(),
          task.getTitle()
      );
    }
    */

    log.debug("Task deadline check completed");
  }

  // ============================================================
  // BIRTHDAY REMINDERS
  // Runs daily at 8 AM to notify about today's birthdays
  // ============================================================
  @Scheduled(cron = "0 0 8 * * *", zone = "UTC") // Every day at 8 AM
  @Transactional(readOnly = true)
  public void checkBirthdays() {
    log.info("Running birthday reminder check...");

    LocalDate today = LocalDate.now();
    int todayMonth = today.getMonthValue();
    int todayDay = today.getDayOfMonth();

    // Example: Find friends with birthdays today
    // Uncomment and adapt when FriendRepository is available:
    /*
    List<Friend> friendsWithBirthday = friendRepository.findByBirthdayMonthAndDay(todayMonth, todayDay);

    for (Friend friend : friendsWithBirthday) {
      // Notify all users who are friends with this person
      List<User> usersToNotify = friendRepository.findUsersWhoAreFriendsWith(friend.getId());

      for (User user : usersToNotify) {
        notificationTrigger.notifyBirthdayReminder(
            user.getId(),
            friend.getFullName(),
            friend.getAvatarUrl(),
            friend.getId()
        );
      }
    }
    */

    log.info("Birthday reminder check completed");
  }

  // ============================================================
  // EVENT REMINDERS
  // Runs every 5 minutes to check for upcoming events
  // ============================================================
  @Scheduled(cron = "0 */5 * * * *", zone = "UTC") // Every 5 minutes
  @Transactional(readOnly = true)
  public void checkEventReminders() {
    log.debug("Running event reminder check...");

    Instant now = Instant.now();
    Instant fifteenMinutesLater = now.plus(15, ChronoUnit.MINUTES);
    Instant oneHourLater = now.plus(1, ChronoUnit.HOURS);
    Instant oneDayLater = now.plus(24, ChronoUnit.HOURS);

    // Example: Find events starting soon
    // Uncomment and adapt when EventRepository is available:
    /*
    // Events starting in 15 minutes (URGENT)
    List<Event> imminentEvents = eventRepository.findByStartTimeBetween(now, fifteenMinutesLater);
    for (Event event : imminentEvents) {
      for (User participant : event.getParticipants()) {
        notificationTrigger.notifyEventReminder(
            participant.getId(),
            event.getId(),
            event.getTitle(),
            15 // minutes until start
        );
      }
    }

    // Events starting in 1 hour
    List<Event> soonEvents = eventRepository.findByStartTimeBetween(fifteenMinutesLater, oneHourLater);
    for (Event event : soonEvents) {
      long minutesUntil = ChronoUnit.MINUTES.between(now, event.getStartTime());
      for (User participant : event.getParticipants()) {
        notificationTrigger.notifyEventReminder(
            participant.getId(),
            event.getId(),
            event.getTitle(),
            (int) minutesUntil
        );
      }
    }
    */

    log.debug("Event reminder check completed");
  }

  // ============================================================
  // CHALLENGE DAILY REMINDERS
  // Runs daily at 9 AM to remind users about active challenges
  // ============================================================
  @Scheduled(cron = "0 0 9 * * *", zone = "UTC") // Every day at 9 AM
  @Transactional(readOnly = true)
  public void sendChallengeReminders() {
    log.info("Running challenge daily reminder check...");

    // Example: Find users with active challenges who haven't checked in today
    // Uncomment and adapt when ChallengeRepository is available:
    /*
    List<ChallengeParticipant> activeParticipants =
        challengeRepository.findActiveParticipantsWithoutTodayCheckIn();

    for (ChallengeParticipant participant : activeParticipants) {
      notificationTrigger.notifyDailyChallengeReminder(
          participant.getUser().getId(),
          participant.getChallenge().getId(),
          participant.getChallenge().getTitle()
      );
    }
    */

    log.info("Challenge daily reminder check completed");
  }

  // ============================================================
  // STREAK WARNING
  // Runs at 8 PM to warn users whose streaks are at risk
  // ============================================================
  @Scheduled(cron = "0 0 20 * * *", zone = "UTC") // Every day at 8 PM
  @Transactional(readOnly = true)
  public void checkStreaksAtRisk() {
    log.info("Running streak-at-risk check...");

    // Example: Find users with active streaks who haven't logged activity today
    // Uncomment and adapt:
    /*
    List<UserStreak> streaksAtRisk = streakRepository.findStreaksAtRisk();

    for (UserStreak streak : streaksAtRisk) {
      notificationTrigger.notifyStreakAtRisk(
          streak.getUser().getId(),
          streak.getActivityType(),
          streak.getCurrentStreak()
      );
    }
    */

    log.info("Streak-at-risk check completed");
  }

  // ============================================================
  // WEEKLY AI REPORT
  // Runs every Sunday at 10 AM
  // ============================================================
  @Scheduled(cron = "0 0 10 * * SUN", zone = "UTC") // Every Sunday at 10 AM
  @Transactional(readOnly = true)
  public void generateWeeklyReports() {
    log.info("Generating weekly reports...");

    // Example: Generate weekly summary for all active users
    // Uncomment and adapt:
    /*
    List<User> activeUsers = userRepository.findUsersActiveInLastWeek();

    for (User user : activeUsers) {
      WeeklyStats stats = statsService.calculateWeeklyStats(user.getId());

      notificationTrigger.notifyWeeklyReport(
          user.getId(),
          stats.getTasksCompleted(),
          stats.getChallengeProgress(),
          stats.getXpEarned()
      );
    }
    */

    log.info("Weekly reports generation completed");
  }

  // ============================================================
  // BILL PAYMENT REMINDERS
  // Runs daily at 9 AM to check for upcoming bills
  // ============================================================
  @Scheduled(cron = "0 0 9 * * *", zone = "UTC") // Every day at 9 AM
  @Transactional(readOnly = true)
  public void checkBillReminders() {
    log.debug("Running bill payment reminder check...");

    LocalDate today = LocalDate.now();
    LocalDate threeDaysLater = today.plusDays(3);

    // Example: Find bills due within 3 days
    // Uncomment and adapt when BillRepository is available:
    /*
    List<Bill> upcomingBills = billRepository.findByDueDateBetweenAndPaidFalse(today, threeDaysLater);

    for (Bill bill : upcomingBills) {
      long daysUntilDue = ChronoUnit.DAYS.between(today, bill.getDueDate());
      notificationTrigger.notifyBillDue(
          bill.getUser().getId(),
          bill.getId(),
          bill.getTitle(),
          bill.getAmount(),
          (int) daysUntilDue
      );
    }
    */

    log.debug("Bill payment reminder check completed");
  }

  // ============================================================
  // ANNIVERSARY REMINDERS
  // Runs daily at 8 AM to check for anniversaries
  // ============================================================
  @Scheduled(cron = "0 0 8 * * *", zone = "UTC") // Every day at 8 AM
  @Transactional(readOnly = true)
  public void checkAnniversaries() {
    log.debug("Running anniversary reminder check...");

    LocalDate today = LocalDate.now();
    int todayMonth = today.getMonthValue();
    int todayDay = today.getDayOfMonth();

    // Example: Find anniversaries for today
    // Uncomment and adapt:
    /*
    List<Anniversary> todayAnniversaries =
        anniversaryRepository.findByMonthAndDay(todayMonth, todayDay);

    for (Anniversary anniversary : todayAnniversaries) {
      int years = today.getYear() - anniversary.getYear();
      notificationTrigger.notifyAnniversary(
          anniversary.getUser().getId(),
          anniversary.getTitle(),
          years
      );
    }
    */

    log.debug("Anniversary reminder check completed");
  }

  // ============================================================
  // CLEAN UP EXPIRED NOTIFICATIONS
  // Runs daily at 2 AM
  // ============================================================
  @Scheduled(cron = "0 0 2 * * *", zone = "UTC") // Every day at 2 AM
  @Transactional
  public void cleanupExpiredNotifications() {
    log.info("Running notification cleanup...");

    // This is handled by NotificationService.archiveExpiredNotifications()
    // But we can also clean up very old archived notifications here

    /*
    Instant thirtyDaysAgo = Instant.now().minus(30, ChronoUnit.DAYS);
    int deletedCount = notificationRepository.deleteArchivedOlderThan(thirtyDaysAgo);
    log.info("Deleted {} old archived notifications", deletedCount);
    */

    log.info("Notification cleanup completed");
  }
}
