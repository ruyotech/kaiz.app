package app.kaiz.community.application.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

/** Request DTO for sending a partner request. */
public record SendPartnerRequestRequest(
        @NotNull(message = "Target member ID is required") UUID toMemberId,
        @Size(max = 500, message = "Message must be at most 500 characters") String message) {}
