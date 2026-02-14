package app.kaiz.command_center.domain;

import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/** A single message in a conversation session (user, assistant, or system). */
@Entity
@Table(name = "conversation_messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ConversationMessage extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "session_id", nullable = false)
  private ConversationSession session;

  @Enumerated(EnumType.STRING)
  @Column(name = "role", nullable = false, length = 20)
  private MessageRole role;

  @Column(name = "content", nullable = false, columnDefinition = "TEXT")
  private String content;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "drafts_json", columnDefinition = "jsonb")
  private String draftsJson;

  @Column(name = "intent", length = 50)
  private String intent;

  @Column(name = "tokens_used")
  private Integer tokensUsed;

  @Column(name = "latency_ms")
  private Long latencyMs;

  @Column(name = "sequence_number", nullable = false)
  @Builder.Default
  private int sequenceNumber = 0;

  // ── Enums ──

  public enum MessageRole {
    USER,
    ASSISTANT,
    SYSTEM
  }
}
