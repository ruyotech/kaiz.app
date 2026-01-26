package app.kaiz.mindset.application;

import app.kaiz.mindset.application.dto.MindsetContentDto;
import app.kaiz.mindset.application.dto.MindsetThemeDto;
import app.kaiz.mindset.domain.MindsetContent;
import app.kaiz.mindset.domain.MindsetTheme;
import org.springframework.stereotype.Component;

@Component
public class MindsetMapper {

  public MindsetContentDto toContentDto(MindsetContent content) {
    return new MindsetContentDto(
        content.getId().toString(),
        content.getBody(),
        content.getAuthor(),
        content.getDimensionTag(),
        content.getSecondaryTags(),
        content.getThemePreset(),
        content.getInterventionWeight(),
        content.getEmotionalTone(),
        content.getDwellTimeMs(),
        content.getIsFavorite(),
        content.getCreatedAt());
  }

  public MindsetThemeDto toThemeDto(MindsetTheme theme) {
    return new MindsetThemeDto(
        theme.getId().toString(),
        theme.getName(),
        theme.getBackgroundColor(),
        theme.getTextColor(),
        theme.getAccentColor(),
        theme.getGradientColors(),
        theme.getDefaultAsset());
  }
}
