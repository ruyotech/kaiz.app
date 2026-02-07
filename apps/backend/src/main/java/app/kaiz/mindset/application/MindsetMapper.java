package app.kaiz.mindset.application;

import app.kaiz.mindset.application.dto.MindsetContentResponse;
import app.kaiz.mindset.application.dto.MindsetThemeResponse;
import app.kaiz.mindset.domain.MindsetContent;
import app.kaiz.mindset.domain.MindsetTheme;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface MindsetMapper {

  @Mapping(target = "lifeWheelAreaId", source = "content.lifeWheelArea.id")
  @Mapping(target = "lifeWheelAreaName", source = "content.lifeWheelArea.name")
  @Mapping(target = "lifeWheelAreaColor", source = "content.lifeWheelArea.color")
  @Mapping(target = "isFavorite", source = "isFavorite")
  @Mapping(target = "favoriteCount", source = "favoriteCount")
  MindsetContentResponse toContentResponse(
      MindsetContent content, boolean isFavorite, long favoriteCount);

  MindsetThemeResponse toThemeResponse(MindsetTheme theme);

  default MindsetContentResponse toContentResponseSimple(MindsetContent content) {
    return toContentResponse(content, false, 0);
  }
}
