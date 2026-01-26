package app.kaiz.life_wheel.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import app.kaiz.life_wheel.application.dto.LifeWheelDtos.EisenhowerQuadrantResponse;
import app.kaiz.life_wheel.application.dto.LifeWheelDtos.LifeWheelAreaResponse;
import app.kaiz.life_wheel.domain.EisenhowerQuadrant;
import app.kaiz.life_wheel.domain.LifeWheelArea;
import app.kaiz.life_wheel.infrastructure.EisenhowerQuadrantRepository;
import app.kaiz.life_wheel.infrastructure.LifeWheelAreaRepository;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class LifeWheelServiceTest {

  @Mock private LifeWheelAreaRepository lifeWheelAreaRepository;
  @Mock private EisenhowerQuadrantRepository eisenhowerQuadrantRepository;
  @Mock private LifeWheelMapper mapper;

  private LifeWheelService lifeWheelService;

  @BeforeEach
  void setUp() {
    lifeWheelService =
        new LifeWheelService(lifeWheelAreaRepository, eisenhowerQuadrantRepository, mapper);
  }

  @Nested
  @DisplayName("getAllLifeWheelAreas")
  class GetAllLifeWheelAreasTests {

    @Test
    @DisplayName("should return all life wheel areas in order")
    void shouldReturnAllLifeWheelAreas() {
      LifeWheelArea area1 = new LifeWheelArea("lw-1", "Career", "briefcase", "#4A90A4", 1);
      LifeWheelArea area2 = new LifeWheelArea("lw-2", "Finance", "wallet", "#6B8E23", 2);
      LifeWheelArea area3 = new LifeWheelArea("lw-3", "Health", "heart", "#CD5C5C", 3);

      LifeWheelAreaResponse response1 =
          new LifeWheelAreaResponse("lw-1", "Career", "briefcase", "#4A90A4", 1);
      LifeWheelAreaResponse response2 =
          new LifeWheelAreaResponse("lw-2", "Finance", "wallet", "#6B8E23", 2);
      LifeWheelAreaResponse response3 =
          new LifeWheelAreaResponse("lw-3", "Health", "heart", "#CD5C5C", 3);

      when(lifeWheelAreaRepository.findAllOrderByDisplayOrder())
          .thenReturn(List.of(area1, area2, area3));
      when(mapper.toResponse(area1)).thenReturn(response1);
      when(mapper.toResponse(area2)).thenReturn(response2);
      when(mapper.toResponse(area3)).thenReturn(response3);

      List<LifeWheelAreaResponse> result = lifeWheelService.getAllLifeWheelAreas();

      assertThat(result).hasSize(3);
      assertThat(result.get(0).id()).isEqualTo("lw-1");
      assertThat(result.get(0).name()).isEqualTo("Career");
      assertThat(result.get(1).id()).isEqualTo("lw-2");
      assertThat(result.get(1).name()).isEqualTo("Finance");
      assertThat(result.get(2).id()).isEqualTo("lw-3");
      assertThat(result.get(2).name()).isEqualTo("Health");
    }

    @Test
    @DisplayName("should return empty list when no areas exist")
    void shouldReturnEmptyListWhenNoAreas() {
      when(lifeWheelAreaRepository.findAllOrderByDisplayOrder()).thenReturn(List.of());

      List<LifeWheelAreaResponse> result = lifeWheelService.getAllLifeWheelAreas();

      assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("should call repository only once with caching")
    void shouldCallRepositoryOnlyOnceWithCaching() {
      LifeWheelArea area = new LifeWheelArea("lw-1", "Career", "briefcase", "#4A90A4", 1);
      LifeWheelAreaResponse response =
          new LifeWheelAreaResponse("lw-1", "Career", "briefcase", "#4A90A4", 1);

      when(lifeWheelAreaRepository.findAllOrderByDisplayOrder()).thenReturn(List.of(area));
      when(mapper.toResponse(area)).thenReturn(response);

      // First call
      lifeWheelService.getAllLifeWheelAreas();

      // Verify repository was called once
      verify(lifeWheelAreaRepository, times(1)).findAllOrderByDisplayOrder();
    }

    @Test
    @DisplayName("should map all fields correctly")
    void shouldMapAllFieldsCorrectly() {
      LifeWheelArea area =
          new LifeWheelArea("lw-health", "Physical Health", "heart-pulse", "#FF6B6B", 5);
      LifeWheelAreaResponse response =
          new LifeWheelAreaResponse("lw-health", "Physical Health", "heart-pulse", "#FF6B6B", 5);

      when(lifeWheelAreaRepository.findAllOrderByDisplayOrder()).thenReturn(List.of(area));
      when(mapper.toResponse(area)).thenReturn(response);

      List<LifeWheelAreaResponse> result = lifeWheelService.getAllLifeWheelAreas();

      assertThat(result).hasSize(1);
      LifeWheelAreaResponse firstArea = result.get(0);
      assertThat(firstArea.id()).isEqualTo("lw-health");
      assertThat(firstArea.name()).isEqualTo("Physical Health");
      assertThat(firstArea.icon()).isEqualTo("heart-pulse");
      assertThat(firstArea.color()).isEqualTo("#FF6B6B");
      assertThat(firstArea.displayOrder()).isEqualTo(5);
    }
  }

  @Nested
  @DisplayName("getAllEisenhowerQuadrants")
  class GetAllEisenhowerQuadrantsTests {

    @Test
    @DisplayName("should return all eisenhower quadrants in order")
    void shouldReturnAllEisenhowerQuadrants() {
      EisenhowerQuadrant q1 =
          new EisenhowerQuadrant(
              "eq-1", "Do First", "Urgent & Important", "Critical tasks", "#E57373", 1);
      EisenhowerQuadrant q2 =
          new EisenhowerQuadrant(
              "eq-2", "Schedule", "Not Urgent & Important", "Plan these", "#64B5F6", 2);
      EisenhowerQuadrant q3 =
          new EisenhowerQuadrant(
              "eq-3", "Delegate", "Urgent & Not Important", "Assign these", "#FFB74D", 3);
      EisenhowerQuadrant q4 =
          new EisenhowerQuadrant(
              "eq-4", "Eliminate", "Not Urgent & Not Important", "Avoid these", "#81C784", 4);

      EisenhowerQuadrantResponse response1 =
          new EisenhowerQuadrantResponse(
              "eq-1", "Do First", "Urgent & Important", "Critical tasks", "#E57373", 1);
      EisenhowerQuadrantResponse response2 =
          new EisenhowerQuadrantResponse(
              "eq-2", "Schedule", "Not Urgent & Important", "Plan these", "#64B5F6", 2);
      EisenhowerQuadrantResponse response3 =
          new EisenhowerQuadrantResponse(
              "eq-3", "Delegate", "Urgent & Not Important", "Assign these", "#FFB74D", 3);
      EisenhowerQuadrantResponse response4 =
          new EisenhowerQuadrantResponse(
              "eq-4", "Eliminate", "Not Urgent & Not Important", "Avoid these", "#81C784", 4);

      when(eisenhowerQuadrantRepository.findAllOrderByDisplayOrder())
          .thenReturn(List.of(q1, q2, q3, q4));
      when(mapper.toResponse(q1)).thenReturn(response1);
      when(mapper.toResponse(q2)).thenReturn(response2);
      when(mapper.toResponse(q3)).thenReturn(response3);
      when(mapper.toResponse(q4)).thenReturn(response4);

      List<EisenhowerQuadrantResponse> result = lifeWheelService.getAllEisenhowerQuadrants();

      assertThat(result).hasSize(4);
      assertThat(result.get(0).id()).isEqualTo("eq-1");
      assertThat(result.get(0).name()).isEqualTo("Do First");
      assertThat(result.get(1).id()).isEqualTo("eq-2");
      assertThat(result.get(1).name()).isEqualTo("Schedule");
      assertThat(result.get(2).id()).isEqualTo("eq-3");
      assertThat(result.get(2).name()).isEqualTo("Delegate");
      assertThat(result.get(3).id()).isEqualTo("eq-4");
      assertThat(result.get(3).name()).isEqualTo("Eliminate");
    }

    @Test
    @DisplayName("should return empty list when no quadrants exist")
    void shouldReturnEmptyListWhenNoQuadrants() {
      when(eisenhowerQuadrantRepository.findAllOrderByDisplayOrder()).thenReturn(List.of());

      List<EisenhowerQuadrantResponse> result = lifeWheelService.getAllEisenhowerQuadrants();

      assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("should call repository only once with caching")
    void shouldCallRepositoryOnlyOnceWithCaching() {
      EisenhowerQuadrant quadrant =
          new EisenhowerQuadrant(
              "eq-1", "Do First", "Urgent & Important", "Critical tasks", "#E57373", 1);
      EisenhowerQuadrantResponse response =
          new EisenhowerQuadrantResponse(
              "eq-1", "Do First", "Urgent & Important", "Critical tasks", "#E57373", 1);

      when(eisenhowerQuadrantRepository.findAllOrderByDisplayOrder()).thenReturn(List.of(quadrant));
      when(mapper.toResponse(quadrant)).thenReturn(response);

      // First call
      lifeWheelService.getAllEisenhowerQuadrants();

      // Verify repository was called once
      verify(eisenhowerQuadrantRepository, times(1)).findAllOrderByDisplayOrder();
    }

    @Test
    @DisplayName("should map all fields correctly including description")
    void shouldMapAllFieldsCorrectly() {
      EisenhowerQuadrant quadrant =
          new EisenhowerQuadrant(
              "eq-1",
              "Do First",
              "Urgent & Important",
              "Handle these tasks immediately",
              "#E57373",
              1);
      EisenhowerQuadrantResponse response =
          new EisenhowerQuadrantResponse(
              "eq-1",
              "Do First",
              "Urgent & Important",
              "Handle these tasks immediately",
              "#E57373",
              1);

      when(eisenhowerQuadrantRepository.findAllOrderByDisplayOrder()).thenReturn(List.of(quadrant));
      when(mapper.toResponse(quadrant)).thenReturn(response);

      List<EisenhowerQuadrantResponse> result = lifeWheelService.getAllEisenhowerQuadrants();

      assertThat(result).hasSize(1);
      EisenhowerQuadrantResponse firstQuadrant = result.get(0);
      assertThat(firstQuadrant.id()).isEqualTo("eq-1");
      assertThat(firstQuadrant.name()).isEqualTo("Do First");
      assertThat(firstQuadrant.label()).isEqualTo("Urgent & Important");
      assertThat(firstQuadrant.description()).isEqualTo("Handle these tasks immediately");
      assertThat(firstQuadrant.color()).isEqualTo("#E57373");
      assertThat(firstQuadrant.displayOrder()).isEqualTo(1);
    }
  }
}
