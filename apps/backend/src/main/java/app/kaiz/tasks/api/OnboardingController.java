package app.kaiz.tasks.api;

import app.kaiz.tasks.application.OnboardingService;
import app.kaiz.tasks.application.dto.OnboardingDto;
import app.kaiz.shared.security.CurrentUser;
import app.kaiz.shared.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/onboarding")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Onboarding", description = "Onboarding and initial setup endpoints")
public class OnboardingController {

    private final OnboardingService onboardingService;

    @PostMapping("/setup")
    @Operation(
        summary = "Complete onboarding setup",
        description = "Process onboarding data and create initial tasks, epics, and events"
    )
    public ResponseEntity<ApiResponse<OnboardingDto.OnboardingResponse>> completeOnboarding(
            @CurrentUser UUID userId,
            @Valid @RequestBody OnboardingDto.OnboardingRequest request) {
        OnboardingDto.OnboardingResponse response = onboardingService.completeOnboarding(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @GetMapping("/templates/tasks")
    @Operation(
        summary = "Get task templates",
        description = "Get available task templates for onboarding selection"
    )
    public ResponseEntity<ApiResponse<OnboardingDto.TaskTemplatesResponse>> getTaskTemplates() {
        OnboardingDto.TaskTemplatesResponse response = onboardingService.getTaskTemplates();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/templates/epics")
    @Operation(
        summary = "Get epic templates",
        description = "Get available epic templates for onboarding selection"
    )
    public ResponseEntity<ApiResponse<OnboardingDto.EpicTemplatesResponse>> getEpicTemplates() {
        OnboardingDto.EpicTemplatesResponse response = onboardingService.getEpicTemplates();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/validate-corporate-code")
    @Operation(
        summary = "Validate corporate code",
        description = "Validate an employer's corporate code for corporate plan"
    )
    public ResponseEntity<ApiResponse<OnboardingDto.CorporateCodeValidation>> validateCorporateCode(
            @Valid @RequestBody OnboardingDto.ValidateCorporateCodeRequest request) {
        OnboardingDto.CorporateCodeValidation response = onboardingService.validateCorporateCode(request.code());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
