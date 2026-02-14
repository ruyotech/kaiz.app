package app.kaiz.admin.api;

import app.kaiz.admin.application.AiFeedbackDashboardService;
import app.kaiz.admin.application.AiFeedbackDashboardService.DashboardSnapshot;
import app.kaiz.shared.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Admin dashboard endpoints for AI feedback analytics. Provides approval rates, correction
 * patterns, rejection trends, session counts, and weekly trend breakdowns.
 */
@RestController
@RequestMapping("/api/v1/admin/ai-feedback")
@RequiredArgsConstructor
@Tag(name = "Admin AI Feedback", description = "AI feedback dashboard and analytics")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAiFeedbackController {

  private final AiFeedbackDashboardService dashboardService;

  @GetMapping("/dashboard")
  @Operation(summary = "Get AI feedback dashboard snapshot")
  public ResponseEntity<ApiResponse<DashboardSnapshot>> getDashboard(
      @RequestParam(defaultValue = "7") int days) {
    return ResponseEntity.ok(ApiResponse.success(dashboardService.getDashboard(days)));
  }

  @GetMapping("/trends")
  @Operation(summary = "Get weekly feedback trend breakdown")
  public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getWeeklyTrends(
      @RequestParam(defaultValue = "4") int weeks) {
    return ResponseEntity.ok(ApiResponse.success(dashboardService.getWeeklyTrends(weeks)));
  }
}
