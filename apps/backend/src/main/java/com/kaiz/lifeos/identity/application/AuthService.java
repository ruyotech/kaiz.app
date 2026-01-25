package com.kaiz.lifeos.identity.application;

import com.kaiz.lifeos.identity.application.dto.AuthDtos.AuthResponse;
import com.kaiz.lifeos.identity.application.dto.AuthDtos.ForgotPasswordRequest;
import com.kaiz.lifeos.identity.application.dto.AuthDtos.LoginRequest;
import com.kaiz.lifeos.identity.application.dto.AuthDtos.RefreshTokenRequest;
import com.kaiz.lifeos.identity.application.dto.AuthDtos.RegisterRequest;
import com.kaiz.lifeos.identity.application.dto.AuthDtos.ResetPasswordRequest;
import com.kaiz.lifeos.identity.application.dto.AuthDtos.TokenResponse;
import com.kaiz.lifeos.identity.application.dto.AuthDtos.UserResponse;
import com.kaiz.lifeos.identity.application.dto.AuthDtos.VerifyEmailRequest;
import com.kaiz.lifeos.identity.domain.EmailVerificationCode;
import com.kaiz.lifeos.identity.domain.PasswordResetToken;
import com.kaiz.lifeos.identity.domain.RefreshToken;
import com.kaiz.lifeos.identity.domain.User;
import com.kaiz.lifeos.identity.infrastructure.EmailVerificationCodeRepository;
import com.kaiz.lifeos.identity.infrastructure.PasswordResetTokenRepository;
import com.kaiz.lifeos.identity.infrastructure.RefreshTokenRepository;
import com.kaiz.lifeos.identity.infrastructure.UserRepository;
import com.kaiz.lifeos.shared.config.JwtProperties;
import com.kaiz.lifeos.shared.exception.BadRequestException;
import com.kaiz.lifeos.shared.exception.ResourceNotFoundException;
import com.kaiz.lifeos.shared.exception.UnauthorizedException;
import com.kaiz.lifeos.shared.security.JwtTokenProvider;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

  private static final int VERIFICATION_CODE_LENGTH = 6;
  private static final int PASSWORD_RESET_TOKEN_LENGTH = 32;
  private static final long PASSWORD_RESET_EXPIRATION_HOURS = 1;
  private static final long EMAIL_VERIFICATION_EXPIRATION_MINUTES = 15;

  private final UserRepository userRepository;
  private final RefreshTokenRepository refreshTokenRepository;
  private final PasswordResetTokenRepository passwordResetTokenRepository;
  private final EmailVerificationCodeRepository emailVerificationCodeRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtTokenProvider jwtTokenProvider;
  private final JwtProperties jwtProperties;
  private final UserMapper userMapper;
  private final SecureRandom secureRandom = new SecureRandom();

  @Transactional
  public AuthResponse register(RegisterRequest request) {
    if (userRepository.existsByEmail(request.email())) {
      throw new BadRequestException("EMAIL_EXISTS", "Email already registered");
    }

    User user =
        User.builder()
            .email(request.email().toLowerCase().trim())
            .passwordHash(passwordEncoder.encode(request.password()))
            .fullName(request.fullName().trim())
            .timezone(request.timezone() != null ? request.timezone() : "UTC")
            .build();

    user = userRepository.save(user);
    log.info("User registered: {}", user.getEmail());

    return createAuthResponse(user);
  }

  @Transactional
  public AuthResponse login(LoginRequest request) {
    User user =
        userRepository
            .findByEmail(request.email().toLowerCase().trim())
            .orElseThrow(
                () ->
                    new UnauthorizedException("INVALID_CREDENTIALS", "Invalid email or password"));

    if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
      throw new UnauthorizedException("INVALID_CREDENTIALS", "Invalid email or password");
    }

    log.info("User logged in: {}", user.getEmail());
    return createAuthResponse(user);
  }

  @Transactional
  public TokenResponse refreshToken(RefreshTokenRequest request) {
    String tokenHash = hashToken(request.refreshToken());

    RefreshToken storedToken =
        refreshTokenRepository
            .findByTokenHash(tokenHash)
            .orElseThrow(() -> new UnauthorizedException("INVALID_TOKEN", "Invalid refresh token"));

    if (!storedToken.isValid()) {
      throw new UnauthorizedException("TOKEN_EXPIRED", "Refresh token expired or revoked");
    }

    // Validate the JWT
    if (!jwtTokenProvider.validateToken(request.refreshToken())
        || !jwtTokenProvider.isRefreshToken(request.refreshToken())) {
      throw new UnauthorizedException("INVALID_TOKEN", "Invalid refresh token");
    }

    // Revoke old token (rotation)
    storedToken.revoke();
    refreshTokenRepository.save(storedToken);

    // Generate new tokens
    User user = storedToken.getUser();
    String newAccessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail());
    String newRefreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

    // Store new refresh token
    saveRefreshToken(user, newRefreshToken);

    log.debug("Tokens refreshed for user: {}", user.getEmail());
    return new TokenResponse(newAccessToken, newRefreshToken);
  }

  @Transactional
  public void logout(UUID userId) {
    refreshTokenRepository.revokeAllByUserId(userId, Instant.now());
    log.info("User logged out: {}", userId);
  }

  @Transactional(readOnly = true)
  public UserResponse getCurrentUser(UUID userId) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

    return userMapper.toUserResponse(user);
  }

  @Transactional
  public String forgotPassword(ForgotPasswordRequest request) {
    User user = userRepository.findByEmail(request.email().toLowerCase().trim()).orElse(null);

    // Always return success to prevent email enumeration
    if (user == null) {
      log.debug("Password reset requested for non-existent email: {}", request.email());
      return "If an account exists with that email, a password reset link has been sent.";
    }

    // Invalidate any existing tokens
    passwordResetTokenRepository.deleteAllByUserId(user.getId());

    // Generate reset token
    String token = generateSecureToken(PASSWORD_RESET_TOKEN_LENGTH);

    PasswordResetToken resetToken =
        PasswordResetToken.builder()
            .user(user)
            .tokenHash(hashToken(token))
            .expiresAt(Instant.now().plus(PASSWORD_RESET_EXPIRATION_HOURS, ChronoUnit.HOURS))
            .build();

    passwordResetTokenRepository.save(resetToken);

    // In a real application, you would send an email here with the token
    // For now, we log it (ONLY FOR DEVELOPMENT)
    log.info("Password reset token for {}: {}", user.getEmail(), token);

    return "If an account exists with that email, a password reset link has been sent.";
  }

  @Transactional
  public void resetPassword(ResetPasswordRequest request) {
    String tokenHash = hashToken(request.token());

    PasswordResetToken resetToken =
        passwordResetTokenRepository
            .findByTokenHash(tokenHash)
            .orElseThrow(
                () -> new BadRequestException("INVALID_TOKEN", "Invalid or expired reset token"));

    if (!resetToken.isValid()) {
      throw new BadRequestException(
          "TOKEN_EXPIRED", "Reset token has expired or already been used");
    }

    User user = resetToken.getUser();
    user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
    userRepository.save(user);

    resetToken.markAsUsed();
    passwordResetTokenRepository.save(resetToken);

    // Revoke all refresh tokens for security
    refreshTokenRepository.revokeAllByUserId(user.getId(), Instant.now());

    log.info("Password reset successful for user: {}", user.getEmail());
  }

  @Transactional
  public String sendVerificationCode(UUID userId) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

    if (user.isEmailVerified()) {
      throw new BadRequestException("ALREADY_VERIFIED", "Email is already verified");
    }

    // Invalidate any existing codes
    emailVerificationCodeRepository.deleteAllByUserId(userId);

    // Generate 6-digit code
    String code = generateVerificationCode();

    EmailVerificationCode verificationCode =
        EmailVerificationCode.builder()
            .user(user)
            .codeHash(hashToken(code))
            .expiresAt(
                Instant.now().plus(EMAIL_VERIFICATION_EXPIRATION_MINUTES, ChronoUnit.MINUTES))
            .build();

    emailVerificationCodeRepository.save(verificationCode);

    // In a real application, you would send an email here
    // For now, we log it (ONLY FOR DEVELOPMENT)
    log.info("Email verification code for {}: {}", user.getEmail(), code);

    return "Verification code sent to your email.";
  }

  @Transactional
  public void verifyEmail(UUID userId, VerifyEmailRequest request) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

    if (user.isEmailVerified()) {
      throw new BadRequestException("ALREADY_VERIFIED", "Email is already verified");
    }

    String codeHash = hashToken(request.code());
    List<EmailVerificationCode> activeCodes =
        emailVerificationCodeRepository.findActiveCodesByUserId(userId);

    EmailVerificationCode validCode =
        activeCodes.stream()
            .filter(c -> c.getCodeHash().equals(codeHash) && c.isValid())
            .findFirst()
            .orElseThrow(
                () ->
                    new BadRequestException(
                        "INVALID_CODE", "Invalid or expired verification code"));

    validCode.markAsVerified();
    emailVerificationCodeRepository.save(validCode);

    user.setEmailVerified(true);
    userRepository.save(user);

    log.info("Email verified for user: {}", user.getEmail());
  }

  private AuthResponse createAuthResponse(User user) {
    String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail());
    String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

    saveRefreshToken(user, refreshToken);

    UserResponse userResponse = userMapper.toUserResponse(user);
    return new AuthResponse(accessToken, refreshToken, userResponse);
  }

  private void saveRefreshToken(User user, String token) {
    RefreshToken refreshToken =
        RefreshToken.builder()
            .user(user)
            .tokenHash(hashToken(token))
            .expiresAt(Instant.now().plusMillis(jwtProperties.refreshTokenExpiration()))
            .build();

    refreshTokenRepository.save(refreshToken);
  }

  private String hashToken(String token) {
    try {
      MessageDigest digest = MessageDigest.getInstance("SHA-256");
      byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
      return Base64.getEncoder().encodeToString(hash);
    } catch (NoSuchAlgorithmException e) {
      throw new RuntimeException("SHA-256 not available", e);
    }
  }

  private String generateSecureToken(int length) {
    byte[] bytes = new byte[length];
    secureRandom.nextBytes(bytes);
    return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
  }

  private String generateVerificationCode() {
    int code = secureRandom.nextInt(900000) + 100000; // 6-digit code
    return String.valueOf(code);
  }
}
