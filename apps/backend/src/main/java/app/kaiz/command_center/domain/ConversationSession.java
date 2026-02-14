package app.kaiz.command_center.domain;

import app.kaiz.identity.domain.User;
import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import java.time.Instant;
import lombok.*;
import lombok.experimental.SuperBuilder;

/** Persisted chat session between a user and the AI coach. */
@Entity
@Table(name = "conversation_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ConversationSession extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Enumerated(EnumType.STRING)
  @Column(name = "mode", nullable = false, length = 30)
  private ChatMode mode;

  @Column(name = "sprint_id", length = 50)
  private String sprintId;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false, length = 20)
  @Builder.Default
  private SessionStatus status = SessionStatus.ACTIVE;

  @Column(name = "message_count", nullable = false)
  @Builder.Default
  private int messageCount = 0;

  @Column(name = "started_at", nullable = false)
  @Builder.Default
  private Instant startedAt = Instant.now();

  @Column(name = "ended_at")
  private Instant endedAt;

  @Column(name = "last_message_at", nullable = false)
  @Builder.Default
  private Instant lastMessageAt = Instant.now();

  @Column(name = "ceremony_id")
  private java.util.UUID ceremonyId;

  // ── Business methods ──

  public void addMessage() {
    this.messageCount++;
    this.lastMessageAt = Instant.now();
  }

  public void close() {
    this.status = SessionStatus.CLOSED;
    this.endedAt = Instant.now();
  }

  public void expire() {
    this.status = SessionStatus.EXPIRED;
    this.endedAt = Instant.now();
  }

  public boolean isActive() {
    return this.status == SessionStatus.ACTIVE;
  }

  // ── Enums ──

  public enum ChatMode {
    FREEFORM,
    CAPTURE,
    PLANNING,
    STANDUP,
    RETROSPECTIVE,
    REVIEW,
    REFINEMENT
  }

  public enum SessionStatus {
    ACTIVE,
    CLOSED,
    EXPIRED
  }
}
