package app.kaiz.shared.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import app.kaiz.shared.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

class JwtTokenProviderTest {

  private static final String TEST_SECRET =
      "test-secret-key-that-is-at-least-256-bits-long-for-testing-purposes";
  private static final String TEST_ISSUER = "kaiz-test";
  private static final String TEST_AUDIENCE = "kaiz-mobile-test";
  private static final long ACCESS_TOKEN_EXPIRATION = 900000L; // 15 minutes
  private static final long REFRESH_TOKEN_EXPIRATION = 604800000L; // 7 days

  private JwtTokenProvider jwtTokenProvider;

  @BeforeEach
  void setUp() {
    JwtProperties jwtProperties =
        new JwtProperties(
            TEST_SECRET,
            TEST_ISSUER,
            TEST_AUDIENCE,
            ACCESS_TOKEN_EXPIRATION,
            REFRESH_TOKEN_EXPIRATION);
    jwtTokenProvider = new JwtTokenProvider(jwtProperties);
  }

  @Nested
  @DisplayName("generateAccessToken")
  class GenerateAccessTokenTests {

    @Test
    @DisplayName("should generate valid access token with user ID and email")
    void shouldGenerateValidAccessToken() {
      UUID userId = UUID.randomUUID();
      String email = "test@example.com";

      String token = jwtTokenProvider.generateAccessToken(userId, email);

      assertThat(token).isNotBlank();
      assertThat(jwtTokenProvider.validateToken(token)).isTrue();
      assertThat(jwtTokenProvider.getUserIdFromToken(token)).isEqualTo(userId);
      assertThat(jwtTokenProvider.getEmailFromToken(token)).isEqualTo(email);
    }

    @Test
    @DisplayName("should set correct token type as access")
    void shouldSetCorrectTokenType() {
      UUID userId = UUID.randomUUID();
      String email = "test@example.com";

      String token = jwtTokenProvider.generateAccessToken(userId, email);

      assertThat(jwtTokenProvider.isAccessToken(token)).isTrue();
      assertThat(jwtTokenProvider.isRefreshToken(token)).isFalse();
    }

    @Test
    @DisplayName("should include unique token ID (jti)")
    void shouldIncludeUniqueTokenId() {
      UUID userId = UUID.randomUUID();

      String token1 = jwtTokenProvider.generateAccessToken(userId, "test@example.com");
      String token2 = jwtTokenProvider.generateAccessToken(userId, "test@example.com");

      assertThat(jwtTokenProvider.getTokenId(token1))
          .isNotEqualTo(jwtTokenProvider.getTokenId(token2));
    }

    @Test
    @DisplayName("should include issuer and audience claims")
    void shouldIncludeIssuerAndAudience() {
      UUID userId = UUID.randomUUID();
      String token = jwtTokenProvider.generateAccessToken(userId, "test@example.com");

      Claims claims = jwtTokenProvider.getClaims(token);

      assertThat(claims.getIssuer()).isEqualTo(TEST_ISSUER);
      assertThat(claims.getAudience()).contains(TEST_AUDIENCE);
    }
  }

  @Nested
  @DisplayName("generateRefreshToken")
  class GenerateRefreshTokenTests {

    @Test
    @DisplayName("should generate valid refresh token with user ID")
    void shouldGenerateValidRefreshToken() {
      UUID userId = UUID.randomUUID();

      String token = jwtTokenProvider.generateRefreshToken(userId);

      assertThat(token).isNotBlank();
      assertThat(jwtTokenProvider.validateToken(token)).isTrue();
      assertThat(jwtTokenProvider.getUserIdFromToken(token)).isEqualTo(userId);
    }

    @Test
    @DisplayName("should set correct token type as refresh")
    void shouldSetCorrectTokenType() {
      UUID userId = UUID.randomUUID();

      String token = jwtTokenProvider.generateRefreshToken(userId);

      assertThat(jwtTokenProvider.isRefreshToken(token)).isTrue();
      assertThat(jwtTokenProvider.isAccessToken(token)).isFalse();
    }

    @Test
    @DisplayName("should not include email claim")
    void shouldNotIncludeEmail() {
      UUID userId = UUID.randomUUID();

      String token = jwtTokenProvider.generateRefreshToken(userId);
      Claims claims = jwtTokenProvider.getClaims(token);

      assertThat(claims.get("email")).isNull();
    }
  }

  @Nested
  @DisplayName("validateToken")
  class ValidateTokenTests {

    @Test
    @DisplayName("should return true for valid token")
    void shouldReturnTrueForValidToken() {
      UUID userId = UUID.randomUUID();
      String token = jwtTokenProvider.generateAccessToken(userId, "test@example.com");

      assertThat(jwtTokenProvider.validateToken(token)).isTrue();
    }

    @Test
    @DisplayName("should return false for invalid token")
    void shouldReturnFalseForInvalidToken() {
      assertThat(jwtTokenProvider.validateToken("invalid.token.here")).isFalse();
    }

    @Test
    @DisplayName("should return false for null token")
    void shouldReturnFalseForNullToken() {
      assertThat(jwtTokenProvider.validateToken(null)).isFalse();
    }

    @Test
    @DisplayName("should return false for empty token")
    void shouldReturnFalseForEmptyToken() {
      assertThat(jwtTokenProvider.validateToken("")).isFalse();
    }

    @Test
    @DisplayName("should return false for expired token")
    void shouldReturnFalseForExpiredToken() {
      // Create a provider with 1ms expiration
      JwtProperties shortLivedProps =
          new JwtProperties(TEST_SECRET, TEST_ISSUER, TEST_AUDIENCE, 1L, 1L);
      JwtTokenProvider shortLivedProvider = new JwtTokenProvider(shortLivedProps);

      UUID userId = UUID.randomUUID();
      String token = shortLivedProvider.generateAccessToken(userId, "test@example.com");

      // Wait for token to expire
      try {
        Thread.sleep(10);
      } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
      }

      assertThat(shortLivedProvider.validateToken(token)).isFalse();
    }

    @Test
    @DisplayName("should return false for tampered token")
    void shouldReturnFalseForTamperedToken() {
      UUID userId = UUID.randomUUID();
      String token = jwtTokenProvider.generateAccessToken(userId, "test@example.com");
      String tamperedToken = token.substring(0, token.length() - 5) + "xxxxx";

      assertThat(jwtTokenProvider.validateToken(tamperedToken)).isFalse();
    }

    @Test
    @DisplayName("should return false for token signed with different secret")
    void shouldReturnFalseForTokenWithDifferentSecret() {
      JwtProperties otherProps =
          new JwtProperties(
              "other-secret-key-that-is-at-least-256-bits-long-for-testing",
              TEST_ISSUER,
              TEST_AUDIENCE,
              ACCESS_TOKEN_EXPIRATION,
              REFRESH_TOKEN_EXPIRATION);
      JwtTokenProvider otherProvider = new JwtTokenProvider(otherProps);

      UUID userId = UUID.randomUUID();
      String token = otherProvider.generateAccessToken(userId, "test@example.com");

      assertThat(jwtTokenProvider.validateToken(token)).isFalse();
    }
  }

  @Nested
  @DisplayName("getClaims")
  class GetClaimsTests {

    @Test
    @DisplayName("should return all claims for valid token")
    void shouldReturnAllClaims() {
      UUID userId = UUID.randomUUID();
      String email = "test@example.com";
      String token = jwtTokenProvider.generateAccessToken(userId, email);

      Claims claims = jwtTokenProvider.getClaims(token);

      assertThat(claims.getSubject()).isEqualTo(userId.toString());
      assertThat(claims.get("email")).isEqualTo(email);
      assertThat(claims.get("type")).isEqualTo("access");
      assertThat(claims.getIssuer()).isEqualTo(TEST_ISSUER);
      assertThat(claims.getIssuedAt()).isNotNull();
      assertThat(claims.getExpiration()).isNotNull();
      assertThat(claims.getId()).isNotBlank();
    }

    @Test
    @DisplayName("should throw exception for expired token")
    void shouldThrowForExpiredToken() {
      JwtProperties shortLivedProps =
          new JwtProperties(TEST_SECRET, TEST_ISSUER, TEST_AUDIENCE, 1L, 1L);
      JwtTokenProvider shortLivedProvider = new JwtTokenProvider(shortLivedProps);

      UUID userId = UUID.randomUUID();
      String token = shortLivedProvider.generateAccessToken(userId, "test@example.com");

      try {
        Thread.sleep(10);
      } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
      }

      assertThatThrownBy(() -> shortLivedProvider.getClaims(token))
          .isInstanceOf(ExpiredJwtException.class);
    }
  }

  @Nested
  @DisplayName("getUserIdFromToken")
  class GetUserIdTests {

    @Test
    @DisplayName("should extract user ID from access token")
    void shouldExtractUserIdFromAccessToken() {
      UUID userId = UUID.randomUUID();
      String token = jwtTokenProvider.generateAccessToken(userId, "test@example.com");

      assertThat(jwtTokenProvider.getUserIdFromToken(token)).isEqualTo(userId);
    }

    @Test
    @DisplayName("should extract user ID from refresh token")
    void shouldExtractUserIdFromRefreshToken() {
      UUID userId = UUID.randomUUID();
      String token = jwtTokenProvider.generateRefreshToken(userId);

      assertThat(jwtTokenProvider.getUserIdFromToken(token)).isEqualTo(userId);
    }
  }

  @Nested
  @DisplayName("getEmailFromToken")
  class GetEmailTests {

    @Test
    @DisplayName("should extract email from access token")
    void shouldExtractEmailFromAccessToken() {
      UUID userId = UUID.randomUUID();
      String email = "test@example.com";
      String token = jwtTokenProvider.generateAccessToken(userId, email);

      assertThat(jwtTokenProvider.getEmailFromToken(token)).isEqualTo(email);
    }

    @Test
    @DisplayName("should return null for refresh token")
    void shouldReturnNullForRefreshToken() {
      UUID userId = UUID.randomUUID();
      String token = jwtTokenProvider.generateRefreshToken(userId);

      assertThat(jwtTokenProvider.getEmailFromToken(token)).isNull();
    }
  }
}
