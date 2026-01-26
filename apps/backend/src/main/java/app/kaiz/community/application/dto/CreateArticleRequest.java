package app.kaiz.community.application.dto;

import app.kaiz.community.domain.ArticleCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

/** Request DTO for creating an article. */
public record CreateArticleRequest(
        @NotBlank(message = "Title is required")
                @Size(max = 200, message = "Title must be at most 200 characters")
                String title,
        @Size(max = 500, message = "Excerpt must be at most 500 characters") String excerpt,
        @NotBlank(message = "Content is required") String content,
        @NotNull(message = "Category is required") ArticleCategory category,
        @Size(max = 500, message = "Cover image URL must be at most 500 characters")
                String coverImageUrl,
        List<String> tags,
        Boolean isPublished) {}
