package app.kaiz.sensai.api;

import app.kaiz.sensai.application.SensAIService;
import app.kaiz.sensai.application.dto.*;
import app.kaiz.shared.security.CurrentUser;
import app.kaiz.shared.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST API controller for SensAI - the AI Scrum Master.
 * Provides endpoints for standups, interventions, velocity, ceremonies, and settings.
 */
@RestController
@RequestMapping("/api/v1/sensai")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "SensAI", description = "AI Scrum Master - Life coaching and productivity management")
public class SensAIController {

    private final SensAIService sensAIService;

    // ============ SETTINGS ============

    @GetMapping("/settings")
    @Operation(summary = "Get settings", description = "Get current SensAI coach settings")
    public ResponseEntity<ApiResponse<SensAISettingsDto>> getSettings(@CurrentUser UUID userId) {
        return ResponseEntity.ok(ApiResponse.success(sensAIService.getSettings(userId)));
    }

    @PutMapping("/settings")
    @Operation(summary = "Update settings", description = "Update SensAI coach settings")
    public ResponseEntity<ApiResponse<SensAISettingsDto>> updateSettings(
            @CurrentUser UUID userId,
            @Valid @RequestBody SensAISettingsDto.UpdateSettingsRequest request) {
        return ResponseEntity.ok(ApiResponse.success(sensAIService.updateSettings(userId, request)));
    }

    // ============ DAILY STANDUP ============

    @GetMapping("/standup/today")
    @Operation(summary = "Get today's standup", description = "Get the standup for today if it exists")
    public ResponseEntity<ApiResponse<DailyStandupDto>> getTodayStandup(@CurrentUser UUID userId) {
        DailyStandupDto standup = sensAIService.getTodayStandup(userId);
        return ResponseEntity.ok(ApiResponse.success(standup));
    }

    @GetMapping("/standup/history")
    @Operation(summary = "Get standup history", description = "Get standup history for a date range")
    public ResponseEntity<ApiResponse<List<DailyStandupDto>>> getStandupHistory(
            @CurrentUser UUID userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(ApiResponse.success(
            sensAIService.getStandupHistory(userId, startDate, endDate)));
    }

    @GetMapping("/standup/summary")
    @Operation(summary = "Get standup summary", description = "Get standup completion statistics")
    public ResponseEntity<ApiResponse<DailyStandupDto.StandupSummary>> getStandupSummary(
            @CurrentUser UUID userId,
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(ApiResponse.success(sensAIService.getStandupSummary(userId, days)));
    }

    @PostMapping("/standup/complete")
    @Operation(summary = "Complete standup", description = "Submit a completed daily standup")
    public ResponseEntity<ApiResponse<DailyStandupDto>> completeStandup(
            @CurrentUser UUID userId,
            @Valid @RequestBody DailyStandupDto.CompleteStandupRequest request) {
        return ResponseEntity.ok(ApiResponse.success(sensAIService.completeStandup(userId, request)));
    }

    @PostMapping("/standup/skip")
    @Operation(summary = "Skip standup", description = "Mark today's standup as skipped")
    public ResponseEntity<ApiResponse<DailyStandupDto>> skipStandup(
            @CurrentUser UUID userId,
            @Valid @RequestBody DailyStandupDto.SkipStandupRequest request) {
        return ResponseEntity.ok(ApiResponse.success(sensAIService.skipStandup(userId, request)));
    }

    // ============ INTERVENTIONS ============

    @GetMapping("/interventions/active")
    @Operation(summary = "Get active interventions", description = "Get all active/pending interventions")
    public ResponseEntity<ApiResponse<List<InterventionDto>>> getActiveInterventions(
            @CurrentUser UUID userId) {
        return ResponseEntity.ok(ApiResponse.success(sensAIService.getActiveInterventions(userId)));
    }

    @GetMapping("/interventions/history")
    @Operation(summary = "Get intervention history", description = "Get paginated intervention history")
    public ResponseEntity<ApiResponse<Page<InterventionDto>>> getInterventionHistory(
            @CurrentUser UUID userId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
            sensAIService.getInterventionHistory(userId, pageable)));
    }

    @PostMapping("/interventions/{interventionId}/acknowledge")
    @Operation(summary = "Acknowledge intervention", description = "Acknowledge and optionally take action on an intervention")
    public ResponseEntity<ApiResponse<InterventionDto>> acknowledgeIntervention(
            @CurrentUser UUID userId,
            @PathVariable UUID interventionId,
            @Valid @RequestBody InterventionDto.AcknowledgeRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
            sensAIService.acknowledgeIntervention(userId, interventionId, request)));
    }

    @PostMapping("/interventions/{interventionId}/dismiss")
    @Operation(summary = "Dismiss intervention", description = "Dismiss an intervention with a reason")
    public ResponseEntity<ApiResponse<InterventionDto>> dismissIntervention(
            @CurrentUser UUID userId,
            @PathVariable UUID interventionId,
            @Valid @RequestBody InterventionDto.DismissRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
            sensAIService.dismissIntervention(userId, interventionId, request)));
    }

    // ============ VELOCITY ============

    @GetMapping("/velocity/metrics")
    @Operation(summary = "Get velocity metrics", description = "Get aggregated velocity metrics")
    public ResponseEntity<ApiResponse<VelocityDto.VelocityMetrics>> getVelocityMetrics(
            @CurrentUser UUID userId) {
        return ResponseEntity.ok(ApiResponse.success(sensAIService.getVelocityMetrics(userId)));
    }

    @GetMapping("/velocity/sprint-health/{sprintId}")
    @Operation(summary = "Get sprint health", description = "Get health assessment for a specific sprint")
    public ResponseEntity<ApiResponse<VelocityDto.SprintHealth>> getSprintHealth(
            @CurrentUser UUID userId,
            @PathVariable String sprintId) {
        return ResponseEntity.ok(ApiResponse.success(sensAIService.getSprintHealth(userId, sprintId)));
    }

    @GetMapping("/velocity/history")
    @Operation(summary = "Get velocity history", description = "Get historical velocity data for charting")
    public ResponseEntity<ApiResponse<VelocityDto.VelocityHistory>> getVelocityHistory(
            @CurrentUser UUID userId,
            @RequestParam(defaultValue = "10") int sprintCount) {
        return ResponseEntity.ok(ApiResponse.success(
            sensAIService.getVelocityHistory(userId, sprintCount)));
    }

    // ============ LIFE WHEEL ============

    @GetMapping("/lifewheel/metrics")
    @Operation(summary = "Get life wheel metrics", description = "Get life wheel dimension scores and balance analysis")
    public ResponseEntity<ApiResponse<LifeWheelDto>> getLifeWheelMetrics(
            @CurrentUser UUID userId) {
        return ResponseEntity.ok(ApiResponse.success(sensAIService.getLifeWheelMetrics(userId)));
    }

    // ============ CEREMONIES ============

    @GetMapping("/ceremonies/sprint/{sprintId}")
    @Operation(summary = "Get ceremonies for sprint", description = "Get all ceremonies for a sprint")
    public ResponseEntity<ApiResponse<List<SprintCeremonyDto>>> getCeremoniesForSprint(
            @CurrentUser UUID userId,
            @PathVariable String sprintId) {
        return ResponseEntity.ok(ApiResponse.success(
            sensAIService.getCeremoniesForSprint(userId, sprintId)));
    }

    @PostMapping("/ceremonies/start")
    @Operation(summary = "Start ceremony", description = "Start a new sprint ceremony")
    public ResponseEntity<ApiResponse<SprintCeremonyDto>> startCeremony(
            @CurrentUser UUID userId,
            @Valid @RequestBody SprintCeremonyDto.StartCeremonyRequest request) {
        return ResponseEntity.ok(ApiResponse.success(sensAIService.startCeremony(userId, request)));
    }

    @PostMapping("/ceremonies/{ceremonyId}/complete")
    @Operation(summary = "Complete ceremony", description = "Complete a sprint ceremony with outcomes")
    public ResponseEntity<ApiResponse<SprintCeremonyDto>> completeCeremony(
            @CurrentUser UUID userId,
            @PathVariable UUID ceremonyId,
            @Valid @RequestBody SprintCeremonyDto.CompleteCeremonyRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
            sensAIService.completeCeremony(userId, ceremonyId, request)));
    }

    // ============ INTAKE ============

    @PostMapping("/intake/process")
    @Operation(summary = "Process intake", description = "Process a universal intake request with AI categorization")
    public ResponseEntity<ApiResponse<IntakeDto>> processIntake(
            @CurrentUser UUID userId,
            @Valid @RequestBody IntakeDto.ProcessIntakeRequest request) {
        return ResponseEntity.ok(ApiResponse.success(sensAIService.processIntake(userId, request)));
    }
}
