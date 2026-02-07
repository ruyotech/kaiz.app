package app.kaiz.mindset.application.dto;

import java.util.List;

public record MindsetThemeResponse(
    String id,
    String name,
    String backgroundColor,
    String textColor,
    String accentColor,
    List<String> gradientColors,
    String defaultAsset) {}
