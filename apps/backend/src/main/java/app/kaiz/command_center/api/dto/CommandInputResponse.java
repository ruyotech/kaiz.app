package app.kaiz.command_center.api.dto;

import java.time.Instant;
import java.util.List;

/**
 * Response DTO for command input processing.
 *
 * @param id Unique identifier for this interaction
 * @param message The response message to display to the user
 * @param details Detailed breakdown of what was received
 * @param receivedText The text that was received (echo back)
 * @param receivedAttachments Info about attachments that were received
 * @param timestamp When the response was generated
 */
public record CommandInputResponse(
        String id,
        String message,
        String details,
        String receivedText,
        List<AttachmentInfo> receivedAttachments,
        Instant timestamp) {

    /**
     * Information about a received attachment.
     *
     * @param name The filename
     * @param mimeType The MIME type
     * @param size Size in bytes
     * @param type The attachment type: "image", "file", or "voice"
     */
    public record AttachmentInfo(String name, String mimeType, long size, String type) {}
}
