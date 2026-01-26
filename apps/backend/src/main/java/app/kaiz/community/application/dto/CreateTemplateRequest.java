package app.kaiz.community.application.dto;

import app.kaiz.community.domain.TemplateType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

/** Request DTO for creating a community template. */
public record CreateTemplateRequest(
        @NotBlank(message = "Name is required")
                @Size(max = 200, message = "Name must be at most 200 characters")
                String name,
        @NotBlank(message = "Description is required")
                @Size(max = 1000, message = "Description must be at most 1000 characters")
                String description,
        @NotNull(message = "Template type is required") TemplateType templateType,
        @NotBlank(message = "Content is required") String content,
        String lifeWheelAreaId,
        List<String> tags,
        String previewImageUrl) {}
