package app.kaiz.admin.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

/**
 * Configurable system prompts for different AI features.
 * Allows admins to modify AI behavior without code changes.
 */
@Entity
@Table(name = "system_prompts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemPrompt {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "prompt_key", nullable = false, unique = true)
    private String promptKey;

    @Column(name = "prompt_name", nullable = false)
    private String promptName;

    @Column(name = "prompt_category", nullable = false)
    @Enumerated(EnumType.STRING)
    private PromptCategory promptCategory;

    @Column(name = "prompt_content", columnDefinition = "TEXT", nullable = false)
    private String promptContent;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "variables", columnDefinition = "jsonb")
    private String variables;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "version")
    private Integer version;

    @Column(name = "is_active")
    private boolean active;

    @CreationTimestamp
    @Column(name = "created_at")
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "updated_by")
    private String updatedBy;

    public enum PromptCategory {
        COMMAND_CENTER,
        SMART_INPUT,
        DRAFT_GENERATION,
        CLARIFICATION,
        IMAGE_ANALYSIS,
        VOICE_TRANSCRIPTION,
        TASK_SUGGESTION,
        CHALLENGE_SUGGESTION,
        SENSAI_CHAT,
        CUSTOM
    }
}
