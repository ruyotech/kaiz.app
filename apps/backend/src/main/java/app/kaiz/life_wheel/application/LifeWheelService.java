package app.kaiz.life_wheel.application;

import app.kaiz.life_wheel.application.dto.LifeWheelDtos.EisenhowerQuadrantResponse;
import app.kaiz.life_wheel.application.dto.LifeWheelDtos.LifeWheelAreaResponse;
import app.kaiz.life_wheel.infrastructure.EisenhowerQuadrantRepository;
import app.kaiz.life_wheel.infrastructure.LifeWheelAreaRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class LifeWheelService {

  private final LifeWheelAreaRepository lifeWheelAreaRepository;
  private final EisenhowerQuadrantRepository eisenhowerQuadrantRepository;
  private final LifeWheelMapper mapper;

  @Transactional(readOnly = true)
  @Cacheable("lifeWheelAreas")
  public List<LifeWheelAreaResponse> getAllLifeWheelAreas() {
    return lifeWheelAreaRepository.findAllOrderByDisplayOrder().stream()
        .map(mapper::toResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  @Cacheable("eisenhowerQuadrants")
  public List<EisenhowerQuadrantResponse> getAllEisenhowerQuadrants() {
    return eisenhowerQuadrantRepository.findAllOrderByDisplayOrder().stream()
        .map(mapper::toResponse)
        .toList();
  }
}
