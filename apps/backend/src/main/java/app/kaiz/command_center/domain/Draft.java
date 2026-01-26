package app.kaiz.command_center.domain;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Sealed interface hierarchy for AI-generated drafts using Java 21 features.
 * Each draft type represents a structured entity that Command Center AI can create.
 */
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
    @JsonSubTypes.Type(value = Draft.TaskDraft.class, name = "task"),
    @JsonSubTypes.Type(value = Draft.EpicDraft.class, name = "epic"),
    @JsonSubTypes.Type(value = Draft.ChallengeDraft.class, name = "challenge"),
    @JsonSubTypes.Type(value = Draft.EventDraft.class, name = "event"),
    @JsonSubTypes.Type(value = Draft.BillDraft.class, name = "bill"),
    @JsonSubTypes.Type(value = Draft.NoteDraft.class, name = "note")
})
public sealed interface Draft permits
        Draft.TaskDraft,
        Draft.EpicDraft,
        Draft.ChallengeDraft,
        Draft.EventDraft,
        Draft.BillDraft,
        Draft.NoteDraft {

    DraftType type();

    /**
     * Task draft - single actionable item for sprints.
     */
    record TaskDraft(
            String title,
            String description,
            String lifeWheelAreaId,
            String eisenhowerQuadrantId,
            int storyPoints,
            String suggestedEpicId,
            String suggestedSprintId,
            LocalDate dueDate,
            boolean isRecurring,
            RecurrencePattern recurrencePattern) implements Draft {

        @Override
        public DraftType type() {
            return DraftType.TASK;
        }

        public TaskDraft {
            // Validation and defaults
            if (title == null || title.isBlank()) {
                throw new IllegalArgumentException("Task title is required");
            }
            if (storyPoints < 1) storyPoints = 3;
            if (storyPoints > 13) storyPoints = 13;
            if (lifeWheelAreaId == null) lifeWheelAreaId = "lw-4";
            if (eisenhowerQuadrantId == null) eisenhowerQuadrantId = "q2";
        }
    }

    /**
     * Epic draft - larger goal containing multiple tasks.
     */
    record EpicDraft(
            String title,
            String description,
            String lifeWheelAreaId,
            List<TaskDraft> suggestedTasks,
            String color,
            String icon,
            LocalDate startDate,
            LocalDate endDate) implements Draft {

        @Override
        public DraftType type() {
            return DraftType.EPIC;
        }

        public EpicDraft {
            if (title == null || title.isBlank()) {
                throw new IllegalArgumentException("Epic title is required");
            }
            if (lifeWheelAreaId == null) lifeWheelAreaId = "lw-4";
            if (color == null) color = "#3B82F6";
            if (suggestedTasks == null) suggestedTasks = List.of();
        }
    }

    /**
     * Challenge draft - habit-building tracker.
     */
    record ChallengeDraft(
            String name,
            String description,
            String lifeWheelAreaId,
            String metricType,
            BigDecimal targetValue,
            String unit,
            int duration,
            String recurrence,
            String whyStatement,
            String rewardDescription,
            int graceDays,
            LocalTime reminderTime) implements Draft {

        @Override
        public DraftType type() {
            return DraftType.CHALLENGE;
        }

        public ChallengeDraft {
            if (name == null || name.isBlank()) {
                throw new IllegalArgumentException("Challenge name is required");
            }
            if (lifeWheelAreaId == null) lifeWheelAreaId = "lw-4";
            if (metricType == null) metricType = "yesno";
            if (duration < 1) duration = 30;
            if (recurrence == null) recurrence = "daily";
            if (graceDays < 0) graceDays = 2;
        }
    }

    /**
     * Event draft - calendar-blocked time commitment.
     */
    record EventDraft(
            String title,
            String description,
            String lifeWheelAreaId,
            LocalDate date,
            LocalTime startTime,
            LocalTime endTime,
            String location,
            boolean isAllDay,
            String recurrence,
            List<String> attendees) implements Draft {

        @Override
        public DraftType type() {
            return DraftType.EVENT;
        }

        public EventDraft {
            if (title == null || title.isBlank()) {
                throw new IllegalArgumentException("Event title is required");
            }
            if (lifeWheelAreaId == null) lifeWheelAreaId = "lw-4";
            if (attendees == null) attendees = List.of();
        }
    }

    /**
     * Bill draft - financial item to track.
     */
    record BillDraft(
            String vendorName,
            BigDecimal amount,
            String currency,
            LocalDate dueDate,
            String category,
            String lifeWheelAreaId,
            boolean isRecurring,
            String recurrence,
            String notes) implements Draft {

        @Override
        public DraftType type() {
            return DraftType.BILL;
        }

        public BillDraft {
            if (vendorName == null || vendorName.isBlank()) {
                throw new IllegalArgumentException("Vendor name is required");
            }
            if (amount == null) amount = BigDecimal.ZERO;
            if (currency == null) currency = "USD";
            if (lifeWheelAreaId == null) lifeWheelAreaId = "lw-3";
        }
    }

    /**
     * Note draft - quick capture when intent is unclear.
     */
    record NoteDraft(
            String title,
            String content,
            String lifeWheelAreaId,
            List<String> tags,
            List<String> clarifyingQuestions) implements Draft {

        @Override
        public DraftType type() {
            return DraftType.NOTE;
        }

        public NoteDraft {
            if (title == null) title = "Quick Note";
            if (content == null) content = "";
            if (lifeWheelAreaId == null) lifeWheelAreaId = "lw-4";
            if (tags == null) tags = List.of();
            if (clarifyingQuestions == null) clarifyingQuestions = List.of();
        }
    }

    /**
     * Recurrence pattern for recurring tasks.
     */
    record RecurrencePattern(
            String frequency,
            int interval,
            LocalDate endDate) {

        public RecurrencePattern {
            if (frequency == null) frequency = "daily";
            if (interval < 1) interval = 1;
        }
    }
}
