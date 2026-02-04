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
 * Configuration for LLM providers used by Command Center.
 * Supports multiple providers (Anthropic, OpenAI, Google, Azure).
 */
@Entity
@Table(name = "llm_providers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LlmProvider {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "provider_name", nullable = false, unique = true)
    private String providerName;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    @Column(name = "provider_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private ProviderType providerType;

    @Column(name = "api_base_url")
    private String apiBaseUrl;

    @Column(name = "api_key_reference")
    private String apiKeyReference;

    @Column(name = "default_model")
    private String defaultModel;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "available_models", columnDefinition = "jsonb")
    private String availableModels;

    @Column(name = "rate_limit_rpm")
    private Integer rateLimitRpm;

    @Column(name = "rate_limit_tpm")
    private Integer rateLimitTpm;

    @Column(name = "max_tokens")
    private Integer maxTokens;

    @Column(name = "temperature")
    private Double temperature;

    @Column(name = "is_active")
    private boolean active;

    @Column(name = "is_default")
    private boolean isDefault;

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

    public enum ProviderType {
        ANTHROPIC,
        OPENAI,
        GOOGLE,
        AZURE_OPENAI,
        CUSTOM
    }
}
