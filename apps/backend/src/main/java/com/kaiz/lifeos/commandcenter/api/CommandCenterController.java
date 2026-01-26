package com.kaiz.lifeos.commandcenter.api;

import com.kaiz.lifeos.commandcenter.api.dto.CommandInputRequest;
import com.kaiz.lifeos.commandcenter.api.dto.CommandInputResponse;
import com.kaiz.lifeos.shared.security.CurrentUser;
import com.kaiz.lifeos.shared.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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

    @PostMapping(value = "/input", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
            summary = "Process smart input",
            description = "Receive text and/or attachments (images, files, voice) and process them. "
                    + "Currently returns details of what was received. Will be connected to AI later.")
    public ResponseEntity<ApiResponse<CommandInputResponse>> processInput(
            @CurrentUser UUID userId,
            @RequestPart(value = "text", required = false) String text,
            @RequestPart(value = "attachments", required = false) List<MultipartFile> attachments) {

        log.info("📥 [Command Center] Received input from user: {}", userId);
        log.info("📥 [Command Center] Text: {}", text);
        log.info(
                "📥 [Command Center] Attachments count: {}",
                attachments != null ? attachments.size() : 0);

        List<CommandInputResponse.AttachmentInfo> attachmentInfos = new ArrayList<>();

        if (attachments != null && !attachments.isEmpty()) {
            for (MultipartFile file : attachments) {
                String originalFilename = file.getOriginalFilename();
                String contentType = file.getContentType();
                long size = file.getSize();

                log.info(
                        "📎 [Command Center] Attachment: name={}, type={}, size={} bytes",
                        originalFilename,
                        contentType,
                        size);

                // Determine attachment type from content type
                String attachmentType = determineAttachmentType(contentType);

                attachmentInfos.add(
                        new CommandInputResponse.AttachmentInfo(
                                originalFilename, contentType, size, attachmentType));
            }
        }

        // Build the response with details of what was received
        CommandInputResponse response =
                new CommandInputResponse(
                        UUID.randomUUID().toString(),
                        "I received your input!",
                        buildReceivedDetails(text, attachmentInfos),
                        text,
                        attachmentInfos,
                        Instant.now());

        log.info("✅ [Command Center] Response: {}", response.message());

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/input/json")
    @Operation(
            summary = "Process smart input (JSON)",
            description =
                    "Alternative endpoint for JSON-based input without file attachments. "
                            + "Accepts base64-encoded attachment data.")
    public ResponseEntity<ApiResponse<CommandInputResponse>> processInputJson(
            @CurrentUser UUID userId, @RequestBody CommandInputRequest request) {

        log.info("📥 [Command Center] Received JSON input from user: {}", userId);
        log.info("📥 [Command Center] Text: {}", request.text());
        log.info(
                "📥 [Command Center] Attachments count: {}",
                request.attachments() != null ? request.attachments().size() : 0);

        List<CommandInputResponse.AttachmentInfo> attachmentInfos = new ArrayList<>();

        if (request.attachments() != null && !request.attachments().isEmpty()) {
            for (CommandInputRequest.AttachmentData attachment : request.attachments()) {
                log.info(
                        "📎 [Command Center] Attachment: name={}, type={}, dataLength={}",
                        attachment.name(),
                        attachment.mimeType(),
                        attachment.data() != null ? attachment.data().length() : 0);

                // Calculate approximate size from base64
                long approximateSize =
                        attachment.data() != null ? (long) (attachment.data().length() * 0.75) : 0;

                attachmentInfos.add(
                        new CommandInputResponse.AttachmentInfo(
                                attachment.name(),
                                attachment.mimeType(),
                                approximateSize,
                                attachment.type()));
            }
        }

        // Build the response with details of what was received
        CommandInputResponse response =
                new CommandInputResponse(
                        UUID.randomUUID().toString(),
                        "I received your input!",
                        buildReceivedDetails(request.text(), attachmentInfos),
                        request.text(),
                        attachmentInfos,
                        Instant.now());

        log.info("✅ [Command Center] Response: {}", response.message());

        return ResponseEntity.ok(ApiResponse.success(response));
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
