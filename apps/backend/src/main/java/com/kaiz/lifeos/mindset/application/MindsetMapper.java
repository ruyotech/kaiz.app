package com.kaiz.lifeos.mindset.application;

import com.kaiz.lifeos.mindset.application.dto.MindsetContentDto;
import com.kaiz.lifeos.mindset.application.dto.MindsetThemeDto;
import com.kaiz.lifeos.mindset.domain.MindsetContent;
import com.kaiz.lifeos.mindset.domain.MindsetTheme;
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
