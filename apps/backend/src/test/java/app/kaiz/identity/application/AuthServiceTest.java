package app.kaiz.identity.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import app.kaiz.identity.application.dto.AuthDtos.AuthResponse;
import app.kaiz.identity.application.dto.AuthDtos.LoginRequest;
import app.kaiz.identity.application.dto.AuthDtos.RefreshTokenRequest;
import app.kaiz.identity.application.dto.AuthDtos.RegisterRequest;
import app.kaiz.identity.application.dto.AuthDtos.TokenResponse;
import app.kaiz.identity.application.dto.AuthDtos.UserResponse;
import app.kaiz.identity.domain.RefreshToken;
import app.kaiz.identity.domain.User;
import app.kaiz.identity.infrastructure.EmailVerificationCodeRepository;
import app.kaiz.identity.infrastructure.PasswordResetTokenRepository;
import app.kaiz.identity.infrastructure.RefreshTokenRepository;
import app.kaiz.identity.infrastructure.UserRepository;
import app.kaiz.shared.config.JwtProperties;
import app.kaiz.shared.exception.BadRequestException;
import app.kaiz.shared.exception.ResourceNotFoundException;
import app.kaiz.shared.exception.UnauthorizedException;
import app.kaiz.shared.security.JwtTokenProvider;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

  @Mock private UserRepository userRepository;
  @Mock private RefreshTokenRepository refreshTokenRepository;
  @Mock private PasswordResetTokenRepository passwordResetTokenRepository;
  @Mock private EmailVerificationCodeRepository emailVerificationCodeRepository;
  @Mock private PasswordEncoder passwordEncoder;
  @Mock private JwtTokenProvider jwtTokenProvider;
  @Mock private JwtProperties jwtProperties;
  @Mock private UserMapper userMapper;

  @Captor private ArgumentCaptor<User> userCaptor;
  @Captor private ArgumentCaptor<RefreshToken> refreshTokenCaptor;

  private AuthService authService;

  private static final String TEST_EMAIL = "test@example.com";
  private static final String TEST_PASSWORD = "SecurePassword123!";
  private static final String TEST_FULL_NAME = "Test User";
  private static final String TEST_TIMEZONE = "America/New_York";
  private static final String ENCODED_PASSWORD = "encoded_password_hash";
  private static final String ACCESS_TOKEN = "access_token_value";
  private static final String REFRESH_TOKEN = "refresh_token_value";
  private static final long REFRESH_TOKEN_EXPIRATION = 604800000L;

  @BeforeEach
  void setUp() {
    authService =
        new AuthService(
            userRepository,
            refreshTokenRepository,
            passwordResetTokenRepository,
            emailVerificationCodeRepository,
            passwordEncoder,
            jwtTokenProvider,
            jwtProperties,
            userMapper);
  }

  @Nested
  @DisplayName("register")
  class RegisterTests {

    @Test
    @DisplayName("should register new user successfully")
    void shouldRegisterNewUserSuccessfully() {
      RegisterRequest request =
          new RegisterRequest(TEST_EMAIL, TEST_PASSWORD, TEST_FULL_NAME, TEST_TIMEZONE);
      UUID userId = UUID.randomUUID();

      User savedUser =
          User.builder()
              .email(TEST_EMAIL.toLowerCase())
              .passwordHash(ENCODED_PASSWORD)
              .fullName(TEST_FULL_NAME)
              .timezone(TEST_TIMEZONE)
              .build();
      savedUser.setId(userId);

      UserResponse userResponse =
          new UserResponse(
              userId.toString(),
              TEST_EMAIL.toLowerCase(),
              TEST_FULL_NAME,
              "INDIVIDUAL",
              "FREE",
              TEST_TIMEZONE,
              null,
              false);

      when(userRepository.existsByEmail(TEST_EMAIL)).thenReturn(false);
      when(passwordEncoder.encode(TEST_PASSWORD)).thenReturn(ENCODED_PASSWORD);
      when(userRepository.save(any(User.class))).thenReturn(savedUser);
      when(jwtTokenProvider.generateAccessToken(userId, TEST_EMAIL.toLowerCase()))
          .thenReturn(ACCESS_TOKEN);
      when(jwtTokenProvider.generateRefreshToken(userId)).thenReturn(REFRESH_TOKEN);
      when(jwtProperties.refreshTokenExpiration()).thenReturn(REFRESH_TOKEN_EXPIRATION);
      when(userMapper.toUserResponse(savedUser)).thenReturn(userResponse);

      AuthResponse response = authService.register(request);

      assertThat(response.accessToken()).isEqualTo(ACCESS_TOKEN);
      assertThat(response.refreshToken()).isEqualTo(REFRESH_TOKEN);
      assertThat(response.user().email()).isEqualTo(TEST_EMAIL.toLowerCase());
      assertThat(response.user().fullName()).isEqualTo(TEST_FULL_NAME);

      verify(userRepository).save(userCaptor.capture());
      User capturedUser = userCaptor.getValue();
      assertThat(capturedUser.getEmail()).isEqualTo(TEST_EMAIL.toLowerCase());
      assertThat(capturedUser.getPasswordHash()).isEqualTo(ENCODED_PASSWORD);
      assertThat(capturedUser.getFullName()).isEqualTo(TEST_FULL_NAME);
      assertThat(capturedUser.getTimezone()).isEqualTo(TEST_TIMEZONE);
    }

    @Test
    @DisplayName("should use UTC timezone when not provided")
    void shouldUseUtcTimezoneWhenNotProvided() {
      RegisterRequest request =
          new RegisterRequest(TEST_EMAIL, TEST_PASSWORD, TEST_FULL_NAME, null);
      UUID userId = UUID.randomUUID();

      User savedUser =
          User.builder()
              .email(TEST_EMAIL.toLowerCase())
              .passwordHash(ENCODED_PASSWORD)
              .fullName(TEST_FULL_NAME)
              .timezone("UTC")
              .build();
      savedUser.setId(userId);

      UserResponse userResponse =
          new UserResponse(
              userId.toString(),
              TEST_EMAIL.toLowerCase(),
              TEST_FULL_NAME,
              "INDIVIDUAL",
              "FREE",
              "UTC",
              null,
              false);

      when(userRepository.existsByEmail(TEST_EMAIL)).thenReturn(false);
      when(passwordEncoder.encode(TEST_PASSWORD)).thenReturn(ENCODED_PASSWORD);
      when(userRepository.save(any(User.class))).thenReturn(savedUser);
      when(jwtTokenProvider.generateAccessToken(any(), anyString())).thenReturn(ACCESS_TOKEN);
      when(jwtTokenProvider.generateRefreshToken(any())).thenReturn(REFRESH_TOKEN);
      when(jwtProperties.refreshTokenExpiration()).thenReturn(REFRESH_TOKEN_EXPIRATION);
      when(userMapper.toUserResponse(any())).thenReturn(userResponse);

      authService.register(request);

      verify(userRepository).save(userCaptor.capture());
      assertThat(userCaptor.getValue().getTimezone()).isEqualTo("UTC");
    }

    @Test
    @DisplayName("should throw BadRequestException when email already exists")
    void shouldThrowBadRequestExceptionWhenEmailExists() {
      RegisterRequest request =
          new RegisterRequest(TEST_EMAIL, TEST_PASSWORD, TEST_FULL_NAME, TEST_TIMEZONE);

      when(userRepository.existsByEmail(TEST_EMAIL)).thenReturn(true);

      assertThatThrownBy(() -> authService.register(request))
          .isInstanceOf(BadRequestException.class)
          .hasMessageContaining("Email already registered");

      verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("should normalize email to lowercase and trim")
    void shouldNormalizeEmail() {
      RegisterRequest request =
          new RegisterRequest("  TEST@EXAMPLE.COM  ", TEST_PASSWORD, TEST_FULL_NAME, TEST_TIMEZONE);
      UUID userId = UUID.randomUUID();

      User savedUser =
          User.builder()
              .email("test@example.com")
              .passwordHash(ENCODED_PASSWORD)
              .fullName(TEST_FULL_NAME)
              .timezone(TEST_TIMEZONE)
              .build();
      savedUser.setId(userId);

      UserResponse userResponse =
          new UserResponse(
              userId.toString(),
              "test@example.com",
              TEST_FULL_NAME,
              "INDIVIDUAL",
              "FREE",
              TEST_TIMEZONE,
              null,
              false);

      when(userRepository.existsByEmail("  TEST@EXAMPLE.COM  ")).thenReturn(false);
      when(passwordEncoder.encode(TEST_PASSWORD)).thenReturn(ENCODED_PASSWORD);
      when(userRepository.save(any(User.class))).thenReturn(savedUser);
      when(jwtTokenProvider.generateAccessToken(any(), anyString())).thenReturn(ACCESS_TOKEN);
      when(jwtTokenProvider.generateRefreshToken(any())).thenReturn(REFRESH_TOKEN);
      when(jwtProperties.refreshTokenExpiration()).thenReturn(REFRESH_TOKEN_EXPIRATION);
      when(userMapper.toUserResponse(any())).thenReturn(userResponse);

      authService.register(request);

      verify(userRepository).save(userCaptor.capture());
      assertThat(userCaptor.getValue().getEmail()).isEqualTo("test@example.com");
    }

    @Test
    @DisplayName("should store refresh token after registration")
    void shouldStoreRefreshToken() {
      RegisterRequest request =
          new RegisterRequest(TEST_EMAIL, TEST_PASSWORD, TEST_FULL_NAME, TEST_TIMEZONE);
      UUID userId = UUID.randomUUID();

      User savedUser =
          User.builder()
              .email(TEST_EMAIL.toLowerCase())
              .passwordHash(ENCODED_PASSWORD)
              .fullName(TEST_FULL_NAME)
              .timezone(TEST_TIMEZONE)
              .build();
      savedUser.setId(userId);

      UserResponse userResponse =
          new UserResponse(
              userId.toString(),
              TEST_EMAIL.toLowerCase(),
              TEST_FULL_NAME,
              "INDIVIDUAL",
              "FREE",
              TEST_TIMEZONE,
              null,
              false);

      when(userRepository.existsByEmail(TEST_EMAIL)).thenReturn(false);
      when(passwordEncoder.encode(TEST_PASSWORD)).thenReturn(ENCODED_PASSWORD);
      when(userRepository.save(any(User.class))).thenReturn(savedUser);
      when(jwtTokenProvider.generateAccessToken(userId, TEST_EMAIL.toLowerCase()))
          .thenReturn(ACCESS_TOKEN);
      when(jwtTokenProvider.generateRefreshToken(userId)).thenReturn(REFRESH_TOKEN);
      when(jwtProperties.refreshTokenExpiration()).thenReturn(REFRESH_TOKEN_EXPIRATION);
      when(userMapper.toUserResponse(savedUser)).thenReturn(userResponse);

      authService.register(request);

      verify(refreshTokenRepository).save(refreshTokenCaptor.capture());
      RefreshToken capturedToken = refreshTokenCaptor.getValue();
      assertThat(capturedToken.getUser()).isEqualTo(savedUser);
      assertThat(capturedToken.getTokenHash()).isNotBlank();
    }
  }

  @Nested
  @DisplayName("login")
  class LoginTests {

    @Test
    @DisplayName("should login successfully with valid credentials")
    void shouldLoginSuccessfully() {
      LoginRequest request = new LoginRequest(TEST_EMAIL, TEST_PASSWORD);
      UUID userId = UUID.randomUUID();

      User user =
          User.builder()
              .email(TEST_EMAIL.toLowerCase())
              .passwordHash(ENCODED_PASSWORD)
              .fullName(TEST_FULL_NAME)
              .timezone(TEST_TIMEZONE)
              .build();
      user.setId(userId);

      UserResponse userResponse =
          new UserResponse(
              userId.toString(),
              TEST_EMAIL.toLowerCase(),
              TEST_FULL_NAME,
              "INDIVIDUAL",
              "FREE",
              TEST_TIMEZONE,
              null,
              false);

      when(userRepository.findByEmail(TEST_EMAIL.toLowerCase())).thenReturn(Optional.of(user));
      when(passwordEncoder.matches(TEST_PASSWORD, ENCODED_PASSWORD)).thenReturn(true);
      when(jwtTokenProvider.generateAccessToken(userId, TEST_EMAIL.toLowerCase()))
          .thenReturn(ACCESS_TOKEN);
      when(jwtTokenProvider.generateRefreshToken(userId)).thenReturn(REFRESH_TOKEN);
      when(jwtProperties.refreshTokenExpiration()).thenReturn(REFRESH_TOKEN_EXPIRATION);
      when(userMapper.toUserResponse(user)).thenReturn(userResponse);

      AuthResponse response = authService.login(request);

      assertThat(response.accessToken()).isEqualTo(ACCESS_TOKEN);
      assertThat(response.refreshToken()).isEqualTo(REFRESH_TOKEN);
      assertThat(response.user().email()).isEqualTo(TEST_EMAIL.toLowerCase());
    }

    @Test
    @DisplayName("should throw UnauthorizedException when user not found")
    void shouldThrowUnauthorizedExceptionWhenUserNotFound() {
      LoginRequest request = new LoginRequest(TEST_EMAIL, TEST_PASSWORD);

      when(userRepository.findByEmail(TEST_EMAIL.toLowerCase())).thenReturn(Optional.empty());

      assertThatThrownBy(() -> authService.login(request))
          .isInstanceOf(UnauthorizedException.class)
          .hasMessageContaining("Invalid email or password");
    }

    @Test
    @DisplayName("should throw UnauthorizedException when password is incorrect")
    void shouldThrowUnauthorizedExceptionWhenPasswordIncorrect() {
      LoginRequest request = new LoginRequest(TEST_EMAIL, "wrongPassword");
      UUID userId = UUID.randomUUID();

      User user =
          User.builder()
              .email(TEST_EMAIL.toLowerCase())
              .passwordHash(ENCODED_PASSWORD)
              .fullName(TEST_FULL_NAME)
              .build();
      user.setId(userId);

      when(userRepository.findByEmail(TEST_EMAIL.toLowerCase())).thenReturn(Optional.of(user));
      when(passwordEncoder.matches("wrongPassword", ENCODED_PASSWORD)).thenReturn(false);

      assertThatThrownBy(() -> authService.login(request))
          .isInstanceOf(UnauthorizedException.class)
          .hasMessageContaining("Invalid email or password");

      verify(jwtTokenProvider, never()).generateAccessToken(any(), any());
    }

    @Test
    @DisplayName("should normalize email to lowercase")
    void shouldNormalizeEmailToLowercase() {
      LoginRequest request = new LoginRequest("TEST@EXAMPLE.COM", TEST_PASSWORD);
      UUID userId = UUID.randomUUID();

      User user =
          User.builder()
              .email(TEST_EMAIL.toLowerCase())
              .passwordHash(ENCODED_PASSWORD)
              .fullName(TEST_FULL_NAME)
              .build();
      user.setId(userId);

      UserResponse userResponse =
          new UserResponse(
              userId.toString(),
              TEST_EMAIL.toLowerCase(),
              TEST_FULL_NAME,
              "INDIVIDUAL",
              "FREE",
              "UTC",
              null,
              false);

      when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
      when(passwordEncoder.matches(TEST_PASSWORD, ENCODED_PASSWORD)).thenReturn(true);
      when(jwtTokenProvider.generateAccessToken(any(), anyString())).thenReturn(ACCESS_TOKEN);
      when(jwtTokenProvider.generateRefreshToken(any())).thenReturn(REFRESH_TOKEN);
      when(jwtProperties.refreshTokenExpiration()).thenReturn(REFRESH_TOKEN_EXPIRATION);
      when(userMapper.toUserResponse(any())).thenReturn(userResponse);

      authService.login(request);

      verify(userRepository).findByEmail("test@example.com");
    }
  }

  @Nested
  @DisplayName("refreshToken")
  class RefreshTokenTests {

    @Test
    @DisplayName("should refresh tokens successfully")
    void shouldRefreshTokensSuccessfully() {
      RefreshTokenRequest request = new RefreshTokenRequest(REFRESH_TOKEN);
      UUID userId = UUID.randomUUID();

      User user =
          User.builder()
              .email(TEST_EMAIL.toLowerCase())
              .passwordHash(ENCODED_PASSWORD)
              .fullName(TEST_FULL_NAME)
              .build();
      user.setId(userId);

      RefreshToken storedToken =
          RefreshToken.builder()
              .user(user)
              .tokenHash("hashed_token")
              .expiresAt(Instant.now().plusSeconds(3600))
              .build();

      when(refreshTokenRepository.findByTokenHash(anyString()))
          .thenReturn(Optional.of(storedToken));
      when(jwtTokenProvider.validateToken(REFRESH_TOKEN)).thenReturn(true);
      when(jwtTokenProvider.isRefreshToken(REFRESH_TOKEN)).thenReturn(true);
      when(jwtTokenProvider.generateAccessToken(userId, TEST_EMAIL.toLowerCase()))
          .thenReturn("new_access_token");
      when(jwtTokenProvider.generateRefreshToken(userId)).thenReturn("new_refresh_token");
      when(jwtProperties.refreshTokenExpiration()).thenReturn(REFRESH_TOKEN_EXPIRATION);

      TokenResponse response = authService.refreshToken(request);

      assertThat(response.accessToken()).isEqualTo("new_access_token");
      assertThat(response.refreshToken()).isEqualTo("new_refresh_token");
      assertThat(storedToken.isRevoked()).isTrue();
      verify(refreshTokenRepository).save(storedToken);
    }

    @Test
    @DisplayName("should throw UnauthorizedException when refresh token not found")
    void shouldThrowUnauthorizedExceptionWhenTokenNotFound() {
      RefreshTokenRequest request = new RefreshTokenRequest(REFRESH_TOKEN);

      when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.empty());

      assertThatThrownBy(() -> authService.refreshToken(request))
          .isInstanceOf(UnauthorizedException.class)
          .hasMessageContaining("Invalid refresh token");
    }

    @Test
    @DisplayName("should throw UnauthorizedException when refresh token is expired")
    void shouldThrowUnauthorizedExceptionWhenTokenExpired() {
      RefreshTokenRequest request = new RefreshTokenRequest(REFRESH_TOKEN);
      UUID userId = UUID.randomUUID();

      User user = User.builder().email(TEST_EMAIL).build();
      user.setId(userId);

      RefreshToken storedToken =
          RefreshToken.builder()
              .user(user)
              .tokenHash("hashed_token")
              .expiresAt(Instant.now().minusSeconds(3600)) // Expired
              .build();

      when(refreshTokenRepository.findByTokenHash(anyString()))
          .thenReturn(Optional.of(storedToken));

      assertThatThrownBy(() -> authService.refreshToken(request))
          .isInstanceOf(UnauthorizedException.class)
          .hasMessageContaining("Refresh token expired or revoked");
    }

    @Test
    @DisplayName("should throw UnauthorizedException when refresh token is revoked")
    void shouldThrowUnauthorizedExceptionWhenTokenRevoked() {
      RefreshTokenRequest request = new RefreshTokenRequest(REFRESH_TOKEN);
      UUID userId = UUID.randomUUID();

      User user = User.builder().email(TEST_EMAIL).build();
      user.setId(userId);

      RefreshToken storedToken =
          RefreshToken.builder()
              .user(user)
              .tokenHash("hashed_token")
              .expiresAt(Instant.now().plusSeconds(3600))
              .revokedAt(Instant.now()) // Revoked
              .build();

      when(refreshTokenRepository.findByTokenHash(anyString()))
          .thenReturn(Optional.of(storedToken));

      assertThatThrownBy(() -> authService.refreshToken(request))
          .isInstanceOf(UnauthorizedException.class)
          .hasMessageContaining("Refresh token expired or revoked");
    }

    @Test
    @DisplayName("should throw UnauthorizedException when JWT validation fails")
    void shouldThrowUnauthorizedExceptionWhenJwtValidationFails() {
      RefreshTokenRequest request = new RefreshTokenRequest(REFRESH_TOKEN);
      UUID userId = UUID.randomUUID();

      User user = User.builder().email(TEST_EMAIL).build();
      user.setId(userId);

      RefreshToken storedToken =
          RefreshToken.builder()
              .user(user)
              .tokenHash("hashed_token")
              .expiresAt(Instant.now().plusSeconds(3600))
              .build();

      when(refreshTokenRepository.findByTokenHash(anyString()))
          .thenReturn(Optional.of(storedToken));
      when(jwtTokenProvider.validateToken(REFRESH_TOKEN)).thenReturn(false);

      assertThatThrownBy(() -> authService.refreshToken(request))
          .isInstanceOf(UnauthorizedException.class)
          .hasMessageContaining("Invalid refresh token");
    }

    @Test
    @DisplayName("should throw UnauthorizedException when token is not refresh type")
    void shouldThrowUnauthorizedExceptionWhenNotRefreshToken() {
      RefreshTokenRequest request = new RefreshTokenRequest(ACCESS_TOKEN); // Using access token
      UUID userId = UUID.randomUUID();

      User user = User.builder().email(TEST_EMAIL).build();
      user.setId(userId);

      RefreshToken storedToken =
          RefreshToken.builder()
              .user(user)
              .tokenHash("hashed_token")
              .expiresAt(Instant.now().plusSeconds(3600))
              .build();

      when(refreshTokenRepository.findByTokenHash(anyString()))
          .thenReturn(Optional.of(storedToken));
      when(jwtTokenProvider.validateToken(ACCESS_TOKEN)).thenReturn(true);
      when(jwtTokenProvider.isRefreshToken(ACCESS_TOKEN)).thenReturn(false);

      assertThatThrownBy(() -> authService.refreshToken(request))
          .isInstanceOf(UnauthorizedException.class)
          .hasMessageContaining("Invalid refresh token");
    }
  }

  @Nested
  @DisplayName("logout")
  class LogoutTests {

    @Test
    @DisplayName("should revoke all refresh tokens for user")
    void shouldRevokeAllRefreshTokens() {
      UUID userId = UUID.randomUUID();

      authService.logout(userId);

      verify(refreshTokenRepository).revokeAllByUserId(any(UUID.class), any(Instant.class));
    }
  }

  @Nested
  @DisplayName("getCurrentUser")
  class GetCurrentUserTests {

    @Test
    @DisplayName("should return user response for valid user ID")
    void shouldReturnUserResponse() {
      UUID userId = UUID.randomUUID();

      User user =
          User.builder()
              .email(TEST_EMAIL)
              .passwordHash(ENCODED_PASSWORD)
              .fullName(TEST_FULL_NAME)
              .timezone(TEST_TIMEZONE)
              .build();
      user.setId(userId);

      UserResponse userResponse =
          new UserResponse(
              userId.toString(),
              TEST_EMAIL,
              TEST_FULL_NAME,
              "INDIVIDUAL",
              "FREE",
              TEST_TIMEZONE,
              null,
              false);

      when(userRepository.findById(userId)).thenReturn(Optional.of(user));
      when(userMapper.toUserResponse(user)).thenReturn(userResponse);

      UserResponse response = authService.getCurrentUser(userId);

      assertThat(response.id()).isEqualTo(userId.toString());
      assertThat(response.email()).isEqualTo(TEST_EMAIL);
      assertThat(response.fullName()).isEqualTo(TEST_FULL_NAME);
    }

    @Test
    @DisplayName("should throw ResourceNotFoundException when user not found")
    void shouldThrowResourceNotFoundExceptionWhenUserNotFound() {
      UUID userId = UUID.randomUUID();

      when(userRepository.findById(userId)).thenReturn(Optional.empty());

      assertThatThrownBy(() -> authService.getCurrentUser(userId))
          .isInstanceOf(ResourceNotFoundException.class);
    }
  }
}
