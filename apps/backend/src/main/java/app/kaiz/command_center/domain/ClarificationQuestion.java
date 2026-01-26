package app.kaiz.command_center.domain;

import java.util.List;

/**
 * Structured clarification question for gathering missing information.
 * Designed for quick, focused interactions - not long conversations.
 */
public record ClarificationQuestion(
        String id,
        String question,
        QuestionType type,
        List<QuestionOption> options,
        String fieldToPopulate,
        boolean required,
        String defaultValue) {

    /**
     * Types of clarification questions.
     */
    public enum QuestionType {
        SINGLE_CHOICE,   // Pick one option
        MULTIPLE_CHOICE, // Pick multiple
        TEXT_INPUT,      // Free text (short)
        NUMBER_INPUT,    // Numeric value
        DATE_PICKER,     // Select a date
        TIME_PICKER,     // Select a time
        YES_NO           // Binary choice
    }

    /**
     * Option for choice-based questions.
     */
    public record QuestionOption(
            String value,
            String label,
            String icon,
            String description) {

        public static QuestionOption of(String value, String label) {
            return new QuestionOption(value, label, null, null);
        }

        public static QuestionOption of(String value, String label, String icon) {
            return new QuestionOption(value, label, icon, null);
        }

        public static QuestionOption of(String value, String label, String icon, String description) {
            return new QuestionOption(value, label, icon, description);
        }
    }

    // =========================================================================
    // Pre-built question templates for common scenarios
    // =========================================================================

    public static ClarificationQuestion lifeWheelArea() {
        return new ClarificationQuestion(
                "life_wheel_area",
                "Which area of your life does this relate to?",
                QuestionType.SINGLE_CHOICE,
                List.of(
                        QuestionOption.of("lw-1", "Health & Fitness", "💪"),
                        QuestionOption.of("lw-2", "Career & Work", "💼"),
                        QuestionOption.of("lw-3", "Finance & Money", "💰"),
                        QuestionOption.of("lw-4", "Personal Growth", "🌱"),
                        QuestionOption.of("lw-5", "Relationships & Family", "❤️"),
                        QuestionOption.of("lw-6", "Social Life", "👥"),
                        QuestionOption.of("lw-7", "Fun & Recreation", "🎮"),
                        QuestionOption.of("lw-8", "Environment & Home", "🏠")),
                "lifeWheelAreaId",
                true,
                "lw-4");
    }

    public static ClarificationQuestion eisenhowerQuadrant() {
        return new ClarificationQuestion(
                "eisenhower_quadrant",
                "How urgent and important is this?",
                QuestionType.SINGLE_CHOICE,
                List.of(
                        QuestionOption.of("q1", "Urgent & Important", "🔴", "Do it now - crisis or deadline"),
                        QuestionOption.of("q2", "Important, Not Urgent", "🟢", "Schedule it - growth & prevention"),
                        QuestionOption.of("q3", "Urgent, Not Important", "🟡", "Delegate if possible"),
                        QuestionOption.of("q4", "Neither", "⚪", "Consider eliminating")),
                "eisenhowerQuadrantId",
                true,
                "q2");
    }

    public static ClarificationQuestion challengeDuration() {
        return new ClarificationQuestion(
                "challenge_duration",
                "How long do you want this challenge to last?",
                QuestionType.SINGLE_CHOICE,
                List.of(
                        QuestionOption.of("7", "1 Week", "🏃", "Quick habit test"),
                        QuestionOption.of("14", "2 Weeks", "📅", "Short commitment"),
                        QuestionOption.of("21", "21 Days", "🎯", "Habit formation"),
                        QuestionOption.of("30", "30 Days", "📆", "Monthly challenge"),
                        QuestionOption.of("60", "60 Days", "💪", "Serious commitment"),
                        QuestionOption.of("90", "90 Days", "🏆", "Transformation")),
                "duration",
                true,
                "30");
    }

    public static ClarificationQuestion challengeMetricType() {
        return new ClarificationQuestion(
                "metric_type",
                "How do you want to track progress?",
                QuestionType.SINGLE_CHOICE,
                List.of(
                        QuestionOption.of("yesno", "Yes/No", "✅", "Did you do it today?"),
                        QuestionOption.of("count", "Count", "🔢", "Track a number (steps, glasses, pages)"),
                        QuestionOption.of("time", "Time", "⏱️", "Track duration (minutes)"),
                        QuestionOption.of("streak", "Streak", "🔥", "Consecutive days")),
                "metricType",
                true,
                "yesno");
    }

    public static ClarificationQuestion targetValue(String unit) {
        return new ClarificationQuestion(
                "target_value",
                "What's your daily target" + (unit != null ? " (" + unit + ")?" : "?"),
                QuestionType.NUMBER_INPUT,
                List.of(),
                "targetValue",
                false,
                null);
    }

    public static ClarificationQuestion eventDate() {
        return new ClarificationQuestion(
                "event_date",
                "When is this scheduled?",
                QuestionType.DATE_PICKER,
                List.of(),
                "date",
                true,
                null);
    }

    public static ClarificationQuestion eventTime() {
        return new ClarificationQuestion(
                "event_time",
                "What time does it start?",
                QuestionType.TIME_PICKER,
                List.of(),
                "startTime",
                false,
                null);
    }

    public static ClarificationQuestion isRecurring() {
        return new ClarificationQuestion(
                "is_recurring",
                "Is this recurring?",
                QuestionType.SINGLE_CHOICE,
                List.of(
                        QuestionOption.of("none", "One-time", "1️⃣"),
                        QuestionOption.of("daily", "Daily", "📅"),
                        QuestionOption.of("weekly", "Weekly", "📆"),
                        QuestionOption.of("monthly", "Monthly", "🗓️"),
                        QuestionOption.of("yearly", "Yearly", "🎂")),
                "recurrence",
                false,
                "none");
    }

    public static ClarificationQuestion billCategory() {
        return new ClarificationQuestion(
                "bill_category",
                "What type of bill is this?",
                QuestionType.SINGLE_CHOICE,
                List.of(
                        QuestionOption.of("subscription", "Subscription", "📱"),
                        QuestionOption.of("utilities", "Utilities", "💡"),
                        QuestionOption.of("insurance", "Insurance", "🛡️"),
                        QuestionOption.of("rent", "Rent/Mortgage", "🏠"),
                        QuestionOption.of("credit_card", "Credit Card", "💳"),
                        QuestionOption.of("loan", "Loan Payment", "🏦"),
                        QuestionOption.of("other", "Other", "📄")),
                "category",
                false,
                "other");
    }

    public static ClarificationQuestion confirmChallengeSuggestion(String challengeName, int duration) {
        return new ClarificationQuestion(
                "confirm_challenge",
                String.format("Would you like to start a %d-day \"%s\" challenge?", duration, challengeName),
                QuestionType.YES_NO,
                List.of(
                        QuestionOption.of("yes", "Yes, let's do it!", "🚀"),
                        QuestionOption.of("no", "No, I had something else in mind", "🤔")),
                "confirmed",
                true,
                "yes");
    }

    public static ClarificationQuestion whatEntityType() {
        return new ClarificationQuestion(
                "entity_type",
                "What would you like to create?",
                QuestionType.SINGLE_CHOICE,
                List.of(
                        QuestionOption.of("task", "Task", "✅", "A one-time action item"),
                        QuestionOption.of("challenge", "Challenge", "🏆", "A habit to build over time"),
                        QuestionOption.of("event", "Event", "📅", "A scheduled appointment"),
                        QuestionOption.of("epic", "Epic/Goal", "🎯", "A larger goal with multiple tasks")),
                "entityType",
                true,
                null);
    }

    /**
     * Factory method to create a question for a specific field.
     */
    public static ClarificationQuestion forField(String field) {
        return switch (field) {
            case "lifeWheelArea", "lifeWheelAreaId" -> lifeWheelArea();
            case "eisenhowerQuadrant", "eisenhowerQuadrantId" -> eisenhowerQuadrant();
            case "durationDays", "duration" -> challengeDuration();
            case "metricType" -> challengeMetricType();
            case "date", "eventDate", "startDate" -> eventDate();
            case "time", "eventTime", "startTime" -> eventTime();
            case "recurrence", "isRecurring" -> isRecurring();
            case "category", "billCategory" -> billCategory();
            case "entityType" -> whatEntityType();
            case "title" -> title();
            case "dueDate" -> dueDate();
            case "startDateTime" -> eventDate();
            default -> textInput(field, "Please provide: " + field);
        };
    }

    /**
     * Simple text input question.
     */
    public static ClarificationQuestion textInput(String id, String question) {
        return new ClarificationQuestion(
                id,
                question,
                QuestionType.TEXT_INPUT,
                List.of(),
                id,
                true,
                null);
    }

    /**
     * Title input question.
     */
    public static ClarificationQuestion title() {
        return new ClarificationQuestion(
                "title",
                "What would you like to call this?",
                QuestionType.TEXT_INPUT,
                List.of(),
                "title",
                true,
                null);
    }

    /**
     * Due date question.
     */
    public static ClarificationQuestion dueDate() {
        return new ClarificationQuestion(
                "dueDate",
                "When is this due?",
                QuestionType.DATE_PICKER,
                List.of(),
                "dueDate",
                false,
                null);
    }

    // =========================================================================
    // Alias type for compatibility with SmartInputAIService
    // =========================================================================

    /**
     * Alias for QuestionOption for API compatibility.
     */
    public record Option(
            String value,
            String label,
            String icon,
            String description) {

        public static Option of(String value, String label) {
            return new Option(value, label, null, null);
        }

        public static Option from(QuestionOption opt) {
            return new Option(opt.value(), opt.label(), opt.icon(), opt.description());
        }
    }
}
