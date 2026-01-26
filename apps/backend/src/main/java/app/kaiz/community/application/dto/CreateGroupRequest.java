package app.kaiz.community.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

/** Request DTO for creating a motivation group. */
public record CreateGroupRequest(
        @NotBlank(message = "Name is required")
                @Size(max = 200, message = "Name must be at most 200 characters")
                String name,
        @NotBlank(message = "Description is required")
                @Size(max = 1000, message = "Description must be at most 1000 characters")
                String description,
        String lifeWheelAreaId,
        String coverImageUrl,
        Boolean isPrivate,
        Integer maxMembers,
        List<String> tags) {}
