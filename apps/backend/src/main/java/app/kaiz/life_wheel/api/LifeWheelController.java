package app.kaiz.life_wheel.api;

import app.kaiz.life_wheel.application.LifeWheelService;
import app.kaiz.life_wheel.application.dto.LifeWheelDtos.EisenhowerQuadrantResponse;
import app.kaiz.life_wheel.application.dto.LifeWheelDtos.LifeWheelAreaResponse;
import app.kaiz.shared.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Life Wheel", description = "Life Wheel dimensions and Eisenhower Matrix")
public class LifeWheelController {

  private final LifeWheelService lifeWheelService;

  @GetMapping("/life-wheel-areas")
  @Operation(summary = "Get all Life Wheel areas", description = "Returns the 8 life dimensions")
  public ResponseEntity<ApiResponse<List<LifeWheelAreaResponse>>> getLifeWheelAreas() {
    List<LifeWheelAreaResponse> areas = lifeWheelService.getAllLifeWheelAreas();
    return ResponseEntity.ok(ApiResponse.success(areas));
  }

  @GetMapping("/eisenhower-quadrants")
  @Operation(
      summary = "Get all Eisenhower Quadrants",
      description = "Returns the 4 Eisenhower Matrix quadrants")
  public ResponseEntity<ApiResponse<List<EisenhowerQuadrantResponse>>> getEisenhowerQuadrants() {
    List<EisenhowerQuadrantResponse> quadrants = lifeWheelService.getAllEisenhowerQuadrants();
    return ResponseEntity.ok(ApiResponse.success(quadrants));
  }
}
