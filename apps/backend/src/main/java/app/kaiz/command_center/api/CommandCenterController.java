package app.kaiz.command_center.api;

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

    // =========================================================================
    // Smart Input Endpoints (New - with clarification flow)
    // =========================================================================

    @PostMapping("/smart-input")
    @Operation(
            summary = "Process smart input with clarification flow",
            description = "Send text/attachments to AI. Returns structured draft or clarification questions. "
                    + "Max 3-5 questions before creating a draft. Supports images (calendar, receipts, cards).")
    public ResponseEntity<ApiResponse<SmartInputResponse>> processSmartInput(
            @CurrentUser UUID userId,
            @Valid @RequestBody SmartInputRequest request) {

        log.info("🧠 [Smart Input] Processing for user: {}", userId);
        log.info("🧠 [Smart Input] Text: {}", request.text());
        log.info("🧠 [Smart Input] Attachments: {}", 
                request.attachments() != null ? request.attachments().size() : 0);

        SmartInputResponse response = smartInputService.processInput(userId, request);

        log.info("✅ [Smart Input] Response status: {}, intent: {}", 
                response.status(), response.intentDetected());

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/smart-input/clarify")
    @Operation(
            summary = "Submit clarification answers",
            description = "Submit answers to clarification questions. "
                    + "May return more questions or a final draft ready for approval.")
    public ResponseEntity<ApiResponse<SmartInputResponse>> submitClarificationAnswers(
            @CurrentUser UUID userId,
            @Valid @RequestBody ClarificationAnswersRequest request) {

        log.info("🧠 [Smart Input] Submitting clarification for session: {}", request.sessionId());

        SmartInputResponse response = smartInputService.submitClarificationAnswers(userId, request);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/smart-input/{sessionId}/confirm-alternative")
    @Operation(
            summary = "Confirm or reject AI alternative suggestion",
            description = "When AI suggests a different entity type (e.g., Challenge instead of Task), "
                    + "use this to confirm or reject the suggestion.")
    public ResponseEntity<ApiResponse<SmartInputResponse>> confirmAlternative(
            @CurrentUser UUID userId,
            @PathVariable UUID sessionId,
            @RequestParam boolean accepted) {

        log.info("🧠 [Smart Input] Confirming alternative for session: {}, accepted: {}", 
                sessionId, accepted);

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
                "📥 [Command Center] Attachments count: {}",
                attachments != null ? attachments.size() : 0);

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
    // Legacy endpoints (kept for backward compatibility)
    // =========================================================================

    @PostMapping(value = "/input", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
            summary = "Process smart input (legacy)",
            description = "Legacy endpoint - returns echo response. Use /process for AI.")
    @Deprecated
    public ResponseEntity<ApiResponse<CommandInputResponse>> processInputLegacy(
            @CurrentUser UUID userId,
            @RequestPart(value = "text", required = false) String text,
            @RequestPart(value = "attachments", required = false) List<MultipartFile> attachments) {

        log.info("📥 [Command Center] Legacy input from user: {}", userId);

        List<CommandInputResponse.AttachmentInfo> attachmentInfos = new ArrayList<>();

        if (attachments != null && !attachments.isEmpty()) {
            for (MultipartFile file : attachments) {
                String originalFilename = file.getOriginalFilename();
                String contentType = file.getContentType();
                long size = file.getSize();
                String attachmentType = determineAttachmentType(contentType);

                attachmentInfos.add(
                        new CommandInputResponse.AttachmentInfo(
                                originalFilename, contentType, size, attachmentType));
            }
        }

        CommandInputResponse response =
                new CommandInputResponse(
                        UUID.randomUUID().toString(),
                        "Input received. Use /api/v1/command-center/process for AI processing.",
                        buildReceivedDetails(text, attachmentInfos),
                        text,
                        attachmentInfos,
                        Instant.now());

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // =========================================================================
    // Helper methods
    // =========================================================================

    private List<AttachmentSummary> buildAttachmentSummaries(List<MultipartFile> attachments) {
        List<AttachmentSummary> summaries = new ArrayList<>();

        if (attachments != null) {
            for (MultipartFile file : attachments) {
                String type = determineAttachmentType(file.getContentType());

                // TODO: Add OCR for images, transcription for voice
                String extractedText = null;

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

    private String buildReceivedDetails(
            String text, List<CommandInputResponse.AttachmentInfo> attachments) {
        StringBuilder details = new StringBuilder();

        if (attachments != null && !attachments.isEmpty()) {
            for (CommandInputResponse.AttachmentInfo att : attachments) {
                details.append("Attachment Type: ").append(att.type()).append("\n");
                details.append("Name: ").append(att.name()).append("\n");
                details.append("MIME Type: ").append(att.mimeType()).append("\n");
                details.append("Size: ").append(formatFileSize(att.size())).append("\n\n");
            }
        }

        if (text != null && !text.isBlank()) {
            details.append("Text Message: ").append(text);
        }

        return details.toString().trim();
    }

    private String formatFileSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
        return String.format("%.1f MB", bytes / (1024.0 * 1024));
    }
}
