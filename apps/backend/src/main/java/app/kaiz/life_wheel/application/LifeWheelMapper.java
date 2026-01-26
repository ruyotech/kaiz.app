package app.kaiz.life_wheel.application;

import app.kaiz.life_wheel.application.dto.LifeWheelDtos.EisenhowerQuadrantResponse;
import app.kaiz.life_wheel.application.dto.LifeWheelDtos.LifeWheelAreaResponse;
import app.kaiz.life_wheel.domain.EisenhowerQuadrant;
import app.kaiz.life_wheel.domain.LifeWheelArea;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface LifeWheelMapper {

  LifeWheelAreaResponse toResponse(LifeWheelArea area);

  EisenhowerQuadrantResponse toResponse(EisenhowerQuadrant quadrant);
}
