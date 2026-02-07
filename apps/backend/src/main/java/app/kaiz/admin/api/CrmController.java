package app.kaiz.admin.api;

import app.kaiz.admin.application.CrmService;
import app.kaiz.admin.application.CrmService.*;
import app.kaiz.admin.domain.crm.Lead;
import app.kaiz.admin.domain.crm.LeadActivity;
import app.kaiz.admin.domain.crm.LeadTask;
import app.kaiz.shared.util.ApiResponse;
import app.kaiz.shared.util.ApiResponse.PageMeta;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/crm")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin CRM", description = "CRM and Lead management endpoints")
public class CrmController {

  private final CrmService crmService;

  // ========== Lead CRUD ==========

  @GetMapping("/leads")
  @Operation(summary = "Get all leads with filters")
  public ResponseEntity<ApiResponse<List<LeadResponse>>> getLeads(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size,
      @RequestParam(required = false) Lead.LeadStatus status,
      @RequestParam(required = false) String source,
      @RequestParam(required = false) UUID assignedTo,
      @RequestParam(defaultValue = "createdAt") String sortBy,
      @RequestParam(defaultValue = "desc") String sortDir) {
    Sort sort =
        sortDir.equalsIgnoreCase("asc")
            ? Sort.by(sortBy).ascending()
            : Sort.by(sortBy).descending();
    PageRequest pageRequest = PageRequest.of(page, size, sort);

    Page<Lead> leads = crmService.getLeads(status, source, assignedTo, pageRequest);
    List<LeadResponse> content = leads.map(this::toLeadResponse).getContent();
    PageMeta meta = PageMeta.of(page, size, leads.getTotalElements());

    return ResponseEntity.ok(ApiResponse.success(content, meta));
  }

  @GetMapping("/leads/search")
  @Operation(summary = "Search leads by name, email, or company")
  public ResponseEntity<ApiResponse<List<LeadResponse>>> searchLeads(
      @RequestParam String q,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {
    PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
    Page<Lead> leads = crmService.searchLeads(q, pageRequest);
    List<LeadResponse> content = leads.map(this::toLeadResponse).getContent();
    PageMeta meta = PageMeta.of(page, size, leads.getTotalElements());

    return ResponseEntity.ok(ApiResponse.success(content, meta));
  }

  @GetMapping("/leads/{id}")
  @Operation(summary = "Get lead by ID")
  public ResponseEntity<ApiResponse<LeadDetailResponse>> getLeadById(@PathVariable UUID id) {
    Lead lead = crmService.getLeadById(id);
    return ResponseEntity.ok(ApiResponse.success(toLeadDetailResponse(lead)));
  }

  @PostMapping("/leads")
  @Operation(summary = "Create a new lead")
  public ResponseEntity<ApiResponse<LeadResponse>> createLead(
      @RequestBody CreateLeadRequest request) {
    Lead lead = crmService.createLead(request);
    return ResponseEntity.ok(ApiResponse.success(toLeadResponse(lead)));
  }

  @PutMapping("/leads/{id}")
  @Operation(summary = "Update a lead")
  public ResponseEntity<ApiResponse<LeadResponse>> updateLead(
      @PathVariable UUID id, @RequestBody UpdateLeadRequest request) {
    Lead lead = crmService.updateLead(id, request);
    return ResponseEntity.ok(ApiResponse.success(toLeadResponse(lead)));
  }

  @DeleteMapping("/leads/{id}")
  @Operation(summary = "Delete a lead")
  public ResponseEntity<ApiResponse<Void>> deleteLead(@PathVariable UUID id) {
    crmService.deleteLead(id);
    return ResponseEntity.ok(ApiResponse.success(null));
  }

  // ========== Lead Activities ==========

  @PostMapping("/leads/{id}/activities")
  @Operation(summary = "Add activity to lead")
  public ResponseEntity<ApiResponse<ActivityResponse>> addActivity(
      @PathVariable UUID id,
      @RequestBody AddActivityRequest request,
      @RequestHeader(value = "X-Admin-User-Id", required = false) UUID adminUserId) {
    LeadActivity activity = crmService.addActivity(id, request, adminUserId);
    return ResponseEntity.ok(ApiResponse.success(toActivityResponse(activity)));
  }

  // ========== Lead Tasks ==========

  @PostMapping("/leads/{id}/tasks")
  @Operation(summary = "Add task to lead")
  public ResponseEntity<ApiResponse<TaskResponse>> addTask(
      @PathVariable UUID id,
      @RequestBody AddTaskRequest request,
      @RequestHeader(value = "X-Admin-User-Id", required = false) UUID adminUserId) {
    LeadTask task = crmService.addTask(id, request, adminUserId);
    return ResponseEntity.ok(ApiResponse.success(toTaskResponse(task)));
  }

  // ========== Conversion ==========

  @PostMapping("/leads/{id}/convert")
  @Operation(summary = "Convert lead to customer")
  public ResponseEntity<ApiResponse<LeadResponse>> convertLead(
      @PathVariable UUID id, @RequestBody(required = false) ConvertLeadRequest request) {
    BigDecimal value = request != null ? request.conversionValue() : null;
    Lead lead = crmService.convertToUser(id, value);
    return ResponseEntity.ok(ApiResponse.success(toLeadResponse(lead)));
  }

  // ========== Dashboard & Stats ==========

  @GetMapping("/stats")
  @Operation(summary = "Get CRM statistics")
  public ResponseEntity<ApiResponse<CrmStats>> getStats() {
    return ResponseEntity.ok(ApiResponse.success(crmService.getStats()));
  }

  @GetMapping("/leads/recent")
  @Operation(summary = "Get recent leads")
  public ResponseEntity<ApiResponse<List<LeadResponse>>> getRecentLeads() {
    List<Lead> leads = crmService.getRecentLeads();
    return ResponseEntity.ok(
        ApiResponse.success(leads.stream().map(this::toLeadResponse).toList()));
  }

  @GetMapping("/leads/high-priority")
  @Operation(summary = "Get high priority leads needing attention")
  public ResponseEntity<ApiResponse<List<LeadResponse>>> getHighPriorityLeads() {
    List<Lead> leads = crmService.getHighPriorityLeads();
    return ResponseEntity.ok(
        ApiResponse.success(leads.stream().map(this::toLeadResponse).toList()));
  }

  // ========== Response DTOs ==========

  public record LeadResponse(
      UUID id,
      String email,
      String fullName,
      String phone,
      String company,
      String jobTitle,
      String status,
      String priority,
      String lifecycleStage,
      String source,
      Integer leadScore,
      String assignedToName,
      Instant lastActivityAt,
      Instant createdAt,
      boolean isConverted) {}

  public record LeadDetailResponse(
      UUID id,
      String email,
      String fullName,
      String phone,
      String company,
      String jobTitle,
      String status,
      String priority,
      String lifecycleStage,
      String source,
      Integer leadScore,
      String assignedToId,
      String assignedToName,
      String notes,
      String[] tags,
      Instant lastActivityAt,
      Instant firstContactAt,
      Instant convertedAt,
      Instant createdAt,
      List<ActivityResponse> recentActivities,
      List<TaskResponse> pendingTasks) {}

  public record ActivityResponse(
      UUID id,
      String activityType,
      String title,
      String description,
      String performedByName,
      Instant performedAt) {}

  public record TaskResponse(
      UUID id,
      String title,
      String description,
      String taskType,
      String priority,
      String assignedToName,
      Instant dueDate,
      boolean isCompleted) {}

  public record ConvertLeadRequest(BigDecimal conversionValue) {}

  // ========== Mappers ==========

  private LeadResponse toLeadResponse(Lead lead) {
    return new LeadResponse(
        lead.getId(),
        lead.getEmail(),
        lead.getFullName(),
        lead.getPhone(),
        lead.getCompany(),
        lead.getJobTitle(),
        lead.getStatus().name(),
        lead.getPriority().name(),
        lead.getLifecycleStage().name(),
        lead.getSource(),
        lead.getLeadScore(),
        lead.getAssignedTo() != null ? lead.getAssignedTo().getFullName() : null,
        lead.getLastActivityAt(),
        lead.getCreatedAt(),
        lead.isConverted());
  }

  private LeadDetailResponse toLeadDetailResponse(Lead lead) {
    List<ActivityResponse> activities =
        lead.getActivities().stream()
            .sorted((a, b) -> b.getPerformedAt().compareTo(a.getPerformedAt()))
            .limit(10)
            .map(this::toActivityResponse)
            .toList();

    List<TaskResponse> tasks =
        lead.getTasks().stream()
            .filter(t -> !t.getIsCompleted())
            .sorted(
                (a, b) -> {
                  if (a.getDueDate() == null) return 1;
                  if (b.getDueDate() == null) return -1;
                  return a.getDueDate().compareTo(b.getDueDate());
                })
            .map(this::toTaskResponse)
            .toList();

    return new LeadDetailResponse(
        lead.getId(),
        lead.getEmail(),
        lead.getFullName(),
        lead.getPhone(),
        lead.getCompany(),
        lead.getJobTitle(),
        lead.getStatus().name(),
        lead.getPriority().name(),
        lead.getLifecycleStage().name(),
        lead.getSource(),
        lead.getLeadScore(),
        lead.getAssignedTo() != null ? lead.getAssignedTo().getId().toString() : null,
        lead.getAssignedTo() != null ? lead.getAssignedTo().getFullName() : null,
        lead.getNotes(),
        lead.getTags(),
        lead.getLastActivityAt(),
        lead.getFirstContactAt(),
        lead.getConvertedAt(),
        lead.getCreatedAt(),
        activities,
        tasks);
  }

  private ActivityResponse toActivityResponse(LeadActivity activity) {
    return new ActivityResponse(
        activity.getId(),
        activity.getActivityType().name(),
        activity.getTitle(),
        activity.getDescription(),
        activity.getPerformedBy() != null ? activity.getPerformedBy().getFullName() : null,
        activity.getPerformedAt());
  }

  private TaskResponse toTaskResponse(LeadTask task) {
    return new TaskResponse(
        task.getId(),
        task.getTitle(),
        task.getDescription(),
        task.getTaskType().name(),
        task.getPriority().name(),
        task.getAssignedTo() != null ? task.getAssignedTo().getFullName() : null,
        task.getDueDate(),
        task.getIsCompleted());
  }
}
