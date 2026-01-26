package app.kaiz.command_center.domain;

/**
 * Life Wheel Area codes for AI categorization.
 * Maps to the life_wheel_areas table.
 */
public enum LifeWheelAreaCode {
    LW_1("lw-1", "Health & Fitness"),
    LW_2("lw-2", "Career & Work"),
    LW_3("lw-3", "Finance & Money"),
    LW_4("lw-4", "Personal Growth"),
    LW_5("lw-5", "Relationships & Family"),
    LW_6("lw-6", "Social Life"),
    LW_7("lw-7", "Fun & Recreation"),
    LW_8("lw-8", "Environment & Home");

    private final String code;
    private final String displayName;

    LifeWheelAreaCode(String code, String displayName) {
        this.code = code;
        this.displayName = displayName;
    }

    public String getCode() {
        return code;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static LifeWheelAreaCode fromCode(String code) {
        for (LifeWheelAreaCode area : values()) {
            if (area.code.equalsIgnoreCase(code)) {
                return area;
            }
        }
        return LW_4; // Default to Personal Growth
    }
}
