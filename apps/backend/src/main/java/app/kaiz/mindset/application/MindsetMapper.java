package app.kaiz.mindset.application;

import app.kaiz.mindset.application.dto.MindsetContentResponse;
import app.kaiz.mindset.application.dto.MindsetThemeResponse;
import app.kaiz.mindset.domain.MindsetContent;
import app.kaiz.mindset.domain.MindsetTheme;
import java.util.ArrayList;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(
    componentModel = "spring",
    imports = {ArrayList.class, List.class})
public interface MindsetMapper {

  @Mapping(target = "lifeWheelAreaId", source = "content.lifeWheelArea.id")
  @Mapping(target = "lifeWheelAreaName", source = "content.lifeWheelArea.name")
  @Mapping(target = "lifeWheelAreaColor", source = "content.lifeWheelArea.color")
  @Mapping(target = "isFavorite", source = "isFavorite")
  @Mapping(target = "favoriteCount", source = "favoriteCount")
  @Mapping(
      target = "secondaryTags",
      expression =
          "java(content.getSecondaryTags() != null ? new ArrayList<>(content.getSecondaryTags()) : List.of())")
  MindsetContentResponse toContentResponse(
      MindsetContent content, boolean isFavorite, long favoriteCount);

  @Mapping(
      target = "gradientColors",
      expression =
          "java(theme.getGradientColors() != null ? new ArrayList<>(theme.getGradientColors()) : List.of())")
  MindsetThemeResponse toThemeResponse(MindsetTheme theme);

  default MindsetContentResponse toContentResponseSimple(MindsetContent content) {
    return toContentResponse(content, false, 0);
  }
}
