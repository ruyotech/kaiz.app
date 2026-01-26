package app.kaiz.community.application.dto;

import jakarta.validation.constraints.Size;

/** Request DTO for updating member profile. */
public record UpdateProfileRequest(
        @Size(max = 100, message = "Display name must be at most 100 characters") String displayName,
        @Size(max = 500, message = "Bio must be at most 500 characters") String bio,
        @Size(max = 50, message = "Avatar must be at most 50 characters") String avatar,
        Boolean showActivity,
        Boolean acceptPartnerRequests) {}
