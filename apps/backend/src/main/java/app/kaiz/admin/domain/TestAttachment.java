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
 * Pre-uploaded test attachments for simulator testing.
 * Since simulators cannot use camera/mic, these provide test data.
 */
@Entity
@Table(name = "test_attachments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "attachment_name", nullable = false)
    private String attachmentName;

    @Column(name = "attachment_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private AttachmentType attachmentType;

    @Column(name = "file_url")
    private String fileUrl;

    @Column(name = "file_data", columnDefinition = "BYTEA")
    private byte[] fileData;

    @Column(name = "mime_type", nullable = false)
    private String mimeType;

    @Column(name = "file_size_bytes")
    private Long fileSizeBytes;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "use_case")
    private String useCase;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "expected_output", columnDefinition = "jsonb")
    private String expectedOutput;

    @Column(name = "is_active")
    private boolean active;

    @Column(name = "display_order")
    private Integer displayOrder;

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

    public enum AttachmentType {
        IMAGE,
        PDF,
        AUDIO,
        VIDEO,
        DOCUMENT
    }
}
