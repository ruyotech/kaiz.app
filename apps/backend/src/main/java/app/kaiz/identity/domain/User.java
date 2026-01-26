package app.kaiz.identity.domain;

import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

  @Column(name = "email", nullable = false, unique = true)
  private String email;

  @Column(name = "password_hash", nullable = false)
  private String passwordHash;

  @Column(name = "full_name", nullable = false)
  private String fullName;

  @Enumerated(EnumType.STRING)
  @Column(name = "account_type", nullable = false)
  @Builder.Default
  private AccountType accountType = AccountType.INDIVIDUAL;

  @Enumerated(EnumType.STRING)
  @Column(name = "subscription_tier", nullable = false)
  @Builder.Default
  private SubscriptionTier subscriptionTier = SubscriptionTier.FREE;

  @Column(name = "timezone", nullable = false)
  @Builder.Default
  private String timezone = "UTC";

  @Column(name = "avatar_url")
  private String avatarUrl;

  @Column(name = "email_verified", nullable = false)
  @Builder.Default
  private boolean emailVerified = false;

  public enum AccountType {
    INDIVIDUAL,
    FAMILY_ADULT,
    FAMILY_CHILD,
    CORPORATE
  }

  public enum SubscriptionTier {
    FREE,
    PRO,
    FAMILY,
    CORPORATE,
    ENTERPRISE
  }
}
