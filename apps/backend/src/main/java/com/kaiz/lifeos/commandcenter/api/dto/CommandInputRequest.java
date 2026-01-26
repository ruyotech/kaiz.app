package com.kaiz.lifeos.commandcenter.api.dto;

import java.util.List;

/**
 * Request DTO for JSON-based command input with optional base64-encoded attachments.
 *
 * @param text The text message from the user
 * @param attachments List of attachment data (base64 encoded)
 */
public record CommandInputRequest(String text, List<AttachmentData> attachments) {

    /**
     * Attachment data with base64-encoded content.
     *
     * @param type The type of attachment: "image", "file", or "voice"
     * @param name The filename
     * @param mimeType The MIME type (e.g., "image/jpeg", "audio/m4a")
     * @param data Base64-encoded file data
     */
    public record AttachmentData(String type, String name, String mimeType, String data) {}
}
