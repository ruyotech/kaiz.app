package app.kaiz.command_center.api;

import app.kaiz.admin.application.AdminCommandCenterService;
import app.kaiz.admin.application.dto.CommandCenterAdminDtos.TestAttachmentResponse;
import app.kaiz.command_center.api.dto.*;
import app.kaiz.command_center.api.dto.CommandCenterAIResponse.AttachmentSummary;
import app.kaiz.command_center.application.CommandCenterAIService;
import app.kaiz.command_center.application.DraftApprovalService;
import app.kaiz.command_center.application.SmartInputAIService;
import app.kaiz.command_center.domain.DraftStatus;
import app.kaiz.command_center.domain.PendingDraft;
import app.kaiz.command_center.infrastructure.PendingDraftRepository;
import app.kaiz.shared.security.CurrentUser;
import app.kaiz.shared.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/command-center")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Command Center", description = "AI-powered command center for smart input processing")
@Slf4j
public class CommandCenterController {

  private final CommandCenterAIService aiService;
  private final SmartInputAIService smartInputService;
  private final DraftApprovalService approvalService;
  private final PendingDraftRepository draftRepository;
  private final AdminCommandCenterService adminService;

  // =========================================================================
  // Smart Input Endpoints (New - with clarification flow)
  // =========================================================================

  @PostMapping("/smart-input")
  @Operation(
      summary = "Process smart input with clarification flow",
      description =
          "Send text/attachments to AI. Returns structured draft or clarification questions. "
              + "Max 3-5 questions before creating a draft. Supports images (calendar, receipts, cards).")
  public ResponseEntity<ApiResponse<SmartInputResponse>> processSmartInput(
      @CurrentUser UUID userId, @Valid @RequestBody SmartInputRequest request) {

    log.info("🧠 [Smart Input] Processing for user: {}", userId);
    log.info("🧠 [Smart Input] Text: {}", request.text());
    log.info(
        "🧠 [Smart Input] Attachments: {}",
        request.attachments() != null ? request.attachments().size() : 0);

    // Debug: Log each attachment details
    if (request.attachments() != null && !request.attachments().isEmpty()) {
      for (int i = 0; i < request.attachments().size(); i++) {
        var att = request.attachments().get(i);
        log.info(
            "🧠 [Smart Input] Attachment[{}]: name={}, type={}, mimeType={}, testAttachmentId={}",
            i,
            att.name(),
            att.type(),
            att.mimeType(),
            att.testAttachmentId());
      }
    }

    SmartInputResponse response = smartInputService.processInput(userId, request);

    log.info(
        "✅ [Smart Input] Response status: {}, intent: {}",
        response.status(),
        response.intentDetected());

    return ResponseEntity.ok(ApiResponse.success(response));
  }

  @PostMapping("/smart-input/clarify")
  @Operation(
      summary = "Submit clarification answers",
      description =
          "Submit answers to clarification questions. "
              + "May return more questions or a final draft ready for approval.")
  public ResponseEntity<ApiResponse<SmartInputResponse>> submitClarificationAnswers(
      @CurrentUser UUID userId, @Valid @RequestBody ClarificationAnswersRequest request) {

    log.info("🧠 [Smart Input] Submitting clarification for session: {}", request.sessionId());

    SmartInputResponse response = smartInputService.submitClarificationAnswers(userId, request);

    return ResponseEntity.ok(ApiResponse.success(response));
  }

  @PostMapping("/smart-input/{sessionId}/save-to-pending")
  @Operation(
      summary = "Save draft as task with PENDING_APPROVAL status",
      description =
          "Converts the SmartInput session draft to a Task entity with PENDING_APPROVAL status. "
              + "Returns the saved task ID for navigation to pending detail screen.")
  public ResponseEntity<ApiResponse<Map<String, Object>>> saveToPending(
      @CurrentUser UUID userId, @PathVariable UUID sessionId) {

    log.info("💾 [Smart Input] Saving session {} as pending task for user {}", sessionId, userId);

    try {
      UUID taskId = smartInputService.saveToPending(userId, sessionId);
      return ResponseEntity.ok(
          ApiResponse.success(Map.of(
              "taskId", taskId.toString(), 
              "status", "PENDING_APPROVAL",
              "message", "Task saved for approval")));
    } catch (IllegalStateException e) {
      log.error("💾 [Smart Input] Session not found: {}", sessionId);
      return ResponseEntity.badRequest()
          .body(ApiResponse.error("Session not found or expired: " + sessionId));
    }
  }

  @PostMapping("/smart-input/{sessionId}/confirm-alternative")
  @Operation(
      summary = "Confirm or reject AI alternative suggestion",
      description =
          "When AI suggests a different entity type (e.g., Challenge instead of Task), "
              + "use this to confirm or reject the suggestion.")
  public ResponseEntity<ApiResponse<SmartInputResponse>> confirmAlternative(
      @CurrentUser UUID userId, @PathVariable UUID sessionId, @RequestParam boolean accepted) {

    log.info(
        "🧠 [Smart Input] Confirming alternative for session: {}, accepted: {}",
        sessionId,
        accepted);

    SmartInputResponse response = smartInputService.confirmAlternative(sessionId, accepted);

    return ResponseEntity.ok(ApiResponse.success(response));
  }

  // =========================================================================
  // Original AI Endpoints
  // =========================================================================

  @PostMapping(value = "/process", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @Operation(
      summary = "Process smart input with AI",
      description =
          "Send text and/or attachments (images, files, voice) to Claude AI. "
              + "Returns a structured draft (Task, Epic, Challenge, Event, Bill, or Note) "
              + "for user approval. The AI analyzes input and categorizes it by "
              + "Life Wheel area and Eisenhower quadrant.")
  public ResponseEntity<ApiResponse<CommandCenterAIResponse>> processInput(
      @CurrentUser UUID userId,
      @RequestPart(value = "text", required = false) String text,
      @RequestPart(value = "attachments", required = false) List<MultipartFile> attachments) {

    log.info("📥 [Command Center] Processing AI input for user: {}", userId);
    log.info("📥 [Command Center] Text: {}", text);
    log.info(
        "📥 [Command Center] Attachments count: {}", attachments != null ? attachments.size() : 0);

    // Build attachment summaries
    List<AttachmentSummary> attachmentSummaries = buildAttachmentSummaries(attachments);

    // Process with AI
    CommandCenterAIResponse response =
        aiService.processInput(userId, text, attachmentSummaries, null);

    log.info(
        "✅ [Command Center] AI processed: intent={}, confidence={}",
        response.intentDetected(),
        response.confidenceScore());

    return ResponseEntity.ok(ApiResponse.success(response));
  }

  @PostMapping("/process/json")
  @Operation(
      summary = "Process smart input with AI (JSON)",
      description =
          "Alternative endpoint for JSON-based input with base64-encoded attachments. "
              + "Returns a structured draft for user approval.")
  public ResponseEntity<ApiResponse<CommandCenterAIResponse>> processInputJson(
      @CurrentUser UUID userId, @RequestBody CommandInputRequest request) {

    log.info("📥 [Command Center] Processing AI JSON input for user: {}", userId);

    // Convert to attachment summaries
    List<AttachmentSummary> attachmentSummaries = new ArrayList<>();
    if (request.attachments() != null) {
      for (var att : request.attachments()) {
        attachmentSummaries.add(
            new AttachmentSummary(
                att.name(),
                att.type(),
                att.mimeType(),
                att.data() != null ? att.data().length() : 0,
                null // TODO: Add OCR/transcription for images/voice
                ));
      }
    }

    // Process with AI
    CommandCenterAIResponse response =
        aiService.processInput(userId, request.text(), attachmentSummaries, null);

    return ResponseEntity.ok(ApiResponse.success(response));
  }

  @PostMapping("/drafts/{draftId}/action")
  @Operation(
      summary = "Approve, modify, or reject a draft",
      description =
          "Take action on a pending draft: "
              + "APPROVE to create the entity as-is, "
              + "MODIFY to edit before creating, "
              + "REJECT to discard the draft.")
  public ResponseEntity<ApiResponse<DraftActionResponse>> processDraftAction(
      @CurrentUser UUID userId,
      @PathVariable UUID draftId,
      @Valid @RequestBody DraftActionRequest request) {

    log.info(
        "📝 [Command Center] Draft action: {} on draft {} for user {}",
        request.action(),
        draftId,
        userId);

    // Ensure the draftId in path matches body
    if (!draftId.equals(request.draftId())) {
      return ResponseEntity.badRequest()
          .body(ApiResponse.error("Draft ID in path must match body"));
    }

    DraftActionResponse response = approvalService.processAction(userId, request);
    return ResponseEntity.ok(ApiResponse.success(response));
  }

  @GetMapping("/drafts/pending")
  @Operation(
      summary = "Get pending drafts",
      description = "Retrieve all pending drafts awaiting user approval")
  public ResponseEntity<ApiResponse<List<CommandCenterAIResponse>>> getPendingDrafts(
      @CurrentUser UUID userId) {

    List<PendingDraft> drafts =
        draftRepository.findActivePendingDrafts(
            userId, DraftStatus.PENDING_APPROVAL, Instant.now());

    List<CommandCenterAIResponse> responses =
        drafts.stream()
            .map(
                draft ->
                    CommandCenterAIResponse.of(
                        draft.getId(),
                        draft.getDraftType(),
                        draft.getConfidenceScore(),
                        draft.getDraftContent(),
                        draft.getAiReasoning(),
                        List.of(),
                        draft.getOriginalInputText(),
                        List.of(),
                        draft.getVoiceTranscription(),
                        draft.getExpiresAt()))
            .toList();

    return ResponseEntity.ok(ApiResponse.success(responses));
  }

  @GetMapping("/drafts/{draftId}")
  @Operation(summary = "Get a specific draft", description = "Retrieve a draft by its ID")
  public ResponseEntity<ApiResponse<CommandCenterAIResponse>> getDraft(
      @CurrentUser UUID userId, @PathVariable UUID draftId) {

    PendingDraft draft =
        draftRepository
            .findByIdAndUserId(draftId, userId)
            .orElseThrow(() -> new IllegalArgumentException("Draft not found: " + draftId));

    CommandCenterAIResponse response =
        CommandCenterAIResponse.of(
            draft.getId(),
            draft.getDraftType(),
            draft.getConfidenceScore(),
            draft.getDraftContent(),
            draft.getAiReasoning(),
            List.of(),
            draft.getOriginalInputText(),
            List.of(),
            draft.getVoiceTranscription(),
            draft.getExpiresAt());

    return ResponseEntity.ok(ApiResponse.success(response));
  }

  // =========================================================================
  // Test Attachments (for simulator testing)
  // =========================================================================

  @GetMapping("/test-attachments")
  @Operation(
      summary = "Get test attachments",
      description = "Retrieve test attachments uploaded via admin for simulator testing")
  public ResponseEntity<ApiResponse<List<TestAttachmentResponse>>> getTestAttachments(
      @CurrentUser UUID userId, @RequestParam(required = false) String type) {

    log.info("🧪 [Command Center] Fetching test attachments for user: {}, type: {}", userId, type);

    List<TestAttachmentResponse> attachments;
    if (type != null && !type.isEmpty()) {
      attachments = adminService.getTestAttachmentsByType(type.toUpperCase());
    } else {
      attachments = adminService.getAllTestAttachments();
    }

    return ResponseEntity.ok(ApiResponse.success(attachments));
  }

  @GetMapping("/test-attachments/{id}")
  @Operation(
      summary = "Get test attachment by ID",
      description = "Retrieve a specific test attachment by its ID")
  public ResponseEntity<ApiResponse<TestAttachmentResponse>> getTestAttachment(
      @CurrentUser UUID userId, @PathVariable UUID id) {

    log.info("🧪 [Command Center] Fetching test attachment: {} for user: {}", id, userId);
    TestAttachmentResponse attachment = adminService.getTestAttachment(id);
    return ResponseEntity.ok(ApiResponse.success(attachment));
  }

  @GetMapping("/test-attachments/{id}/download")
  @Operation(
      summary = "Download test attachment",
      description = "Download the file data of a test attachment")
  public ResponseEntity<byte[]> downloadTestAttachment(
      @CurrentUser UUID userId, @PathVariable UUID id) {

    log.info("⬇️ [Command Center] Downloading test attachment: {} for user: {}", id, userId);
    TestAttachmentResponse attachment = adminService.getTestAttachment(id);
    byte[] data = adminService.getTestAttachmentData(id);

    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType(attachment.mimeType()))
        .header(
            "Content-Disposition", "attachment; filename=\"" + attachment.attachmentName() + "\"")
        .body(data);
  }

  // =========================================================================
  // Helper methods
  // =========================================================================

  private List<AttachmentSummary> buildAttachmentSummaries(List<MultipartFile> attachments) {
    List<AttachmentSummary> summaries = new ArrayList<>();

    if (attachments != null) {
      for (MultipartFile file : attachments) {
        String type = determineAttachmentType(file.getContentType());

        // Extract text from images using Claude Vision OCR
        String extractedText = null;
        if ("image".equals(type)) {
          try {
            extractedText = aiService.extractTextFromImage(file);
            log.info(
                "🔍 [OCR] Extracted text from {}: {} chars",
                file.getOriginalFilename(),
                extractedText != null ? extractedText.length() : 0);
          } catch (Exception e) {
            log.warn(
                "🔍 [OCR] Failed to extract text from {}: {}",
                file.getOriginalFilename(),
                e.getMessage());
          }
        }
        // TODO: Add voice transcription for audio files

        summaries.add(
            new AttachmentSummary(
                file.getOriginalFilename(),
                type,
                file.getContentType(),
                file.getSize(),
                extractedText));
      }
    }

    return summaries;
  }

  private String determineAttachmentType(String contentType) {
    if (contentType == null) {
      return "file";
    }
    if (contentType.startsWith("image/")) {
      return "image";
    }
    if (contentType.startsWith("audio/")) {
      return "voice";
    }
    return "file";
  }
}
