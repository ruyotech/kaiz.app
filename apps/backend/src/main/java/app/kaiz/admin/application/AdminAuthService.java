package app.kaiz.admin.application;

import app.kaiz.admin.domain.AdminRefreshToken;
import app.kaiz.admin.domain.AdminUser;
import app.kaiz.admin.repository.AdminRefreshTokenRepository;
import app.kaiz.admin.repository.AdminUserRepository;
import app.kaiz.shared.exception.ApiException;
import io.jsonwebtoken.Claims;
import org.springframework.http.HttpStatus;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminAuthService {

  private final AdminUserRepository adminUserRepository;
  private final AdminRefreshTokenRepository adminRefreshTokenRepository;
  private final PasswordEncoder passwordEncoder;

  @Value("${jwt.secret}")
  private String jwtSecret;

  @Value("${jwt.access-token-expiration:900000}") // 15 minutes default
  private long accessTokenExpiration;

  @Value("${jwt.refresh-token-expiration:604800000}") // 7 days default
  private long refreshTokenExpiration;

  @Transactional
  public AdminAuthResponse login(String email, String password, String deviceInfo, String ipAddress) {
    AdminUser admin = adminUserRepository.findByEmail(email)
        .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Invalid credentials"));

    if (!admin.isActive()) {
      throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Account is disabled");
    }

    if (!passwordEncoder.matches(password, admin.getPasswordHash())) {
      throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Invalid credentials");
    }

    // Update last login
    admin.setLastLoginAt(Instant.now());
    adminUserRepository.save(admin);

    // Generate tokens
    String accessToken = generateAccessToken(admin);
    String refreshToken = generateRefreshToken();

    // Save refresh token
    AdminRefreshToken tokenEntity = AdminRefreshToken.builder()
        .admin(admin)
        .tokenHash(hashToken(refreshToken))
        .deviceInfo(deviceInfo)
        .ipAddress(ipAddress)
        .expiresAt(Instant.now().plus(refreshTokenExpiration, ChronoUnit.MILLIS))
        .build();
    adminRefreshTokenRepository.save(tokenEntity);

    return AdminAuthResponse.builder()
        .accessToken(accessToken)
        .refreshToken(refreshToken)
        .admin(mapToDto(admin))
        .build();
  }

  @Transactional
  public AdminAuthResponse refreshToken(String refreshToken) {
    String tokenHash = hashToken(refreshToken);
    AdminRefreshToken storedToken = adminRefreshTokenRepository.findByTokenHash(tokenHash)
        .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Invalid refresh token"));

    if (!storedToken.isValid()) {
      throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Refresh token expired or revoked");
    }

    AdminUser admin = storedToken.getAdmin();
    if (!admin.isActive()) {
      throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Account is disabled");
    }

    // Revoke old token
    storedToken.setRevokedAt(Instant.now());
    adminRefreshTokenRepository.save(storedToken);

    // Generate new tokens
    String newAccessToken = generateAccessToken(admin);
    String newRefreshToken = generateRefreshToken();

    // Save new refresh token
    AdminRefreshToken newTokenEntity = AdminRefreshToken.builder()
        .admin(admin)
        .tokenHash(hashToken(newRefreshToken))
        .deviceInfo(storedToken.getDeviceInfo())
        .ipAddress(storedToken.getIpAddress())
        .expiresAt(Instant.now().plus(refreshTokenExpiration, ChronoUnit.MILLIS))
        .build();
    adminRefreshTokenRepository.save(newTokenEntity);

    return AdminAuthResponse.builder()
        .accessToken(newAccessToken)
        .refreshToken(newRefreshToken)
        .admin(mapToDto(admin))
        .build();
  }

  @Transactional
  public void logout(String refreshToken) {
    String tokenHash = hashToken(refreshToken);
    adminRefreshTokenRepository.findByTokenHash(tokenHash)
        .ifPresent(token -> {
          token.setRevokedAt(Instant.now());
          adminRefreshTokenRepository.save(token);
        });
  }

  public AdminDto getCurrentAdmin(UUID adminId) {
    AdminUser admin = adminUserRepository.findById(adminId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Admin not found"));
    return mapToDto(admin);
  }

  public UUID validateAccessToken(String token) {
    try {
      SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
      Claims claims = Jwts.parser()
          .verifyWith(key)
          .build()
          .parseSignedClaims(token)
          .getPayload();

      // Check if it's an admin token
      String tokenType = claims.get("type", String.class);
      if (!"admin".equals(tokenType)) {
        return null;
      }

      return UUID.fromString(claims.getSubject());
    } catch (Exception e) {
      return null;
    }
  }

  @Transactional
  public AdminDto createAdmin(String email, String password, String fullName, AdminUser.AdminRole role) {
    if (adminUserRepository.existsByEmail(email)) {
      throw new ApiException(HttpStatus.CONFLICT, "CONFLICT", "Email already exists");
    }

    AdminUser admin = AdminUser.builder()
        .email(email)
        .passwordHash(passwordEncoder.encode(password))
        .fullName(fullName)
        .role(role)
        .isActive(true)
        .build();

    admin = adminUserRepository.save(admin);
    log.info("Created new admin user: {}", email);
    return mapToDto(admin);
  }

  private String generateAccessToken(AdminUser admin) {
    SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    return Jwts.builder()
        .subject(admin.getId().toString())
        .claims(Map.of(
            "email", admin.getEmail(),
            "role", admin.getRole().name(),
            "type", "admin"  // Distinguish admin tokens from user tokens
        ))
        .issuedAt(new Date())
        .expiration(new Date(System.currentTimeMillis() + accessTokenExpiration))
        .signWith(key)
        .compact();
  }

  private String generateRefreshToken() {
    return UUID.randomUUID().toString() + "-" + UUID.randomUUID().toString();
  }

  private String hashToken(String token) {
    try {
      MessageDigest digest = MessageDigest.getInstance("SHA-256");
      byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
      return Base64.getEncoder().encodeToString(hash);
    } catch (NoSuchAlgorithmException e) {
      throw new RuntimeException("SHA-256 algorithm not available", e);
    }
  }

  private AdminDto mapToDto(AdminUser admin) {
    return AdminDto.builder()
        .id(admin.getId())
        .email(admin.getEmail())
        .fullName(admin.getFullName())
        .role(admin.getRole().name())
        .isActive(admin.isActive())
        .lastLoginAt(admin.getLastLoginAt())
        .createdAt(admin.getCreatedAt())
        .build();
  }

  // DTOs
  @lombok.Data
  @lombok.Builder
  public static class AdminAuthResponse {
    private String accessToken;
    private String refreshToken;
    private AdminDto admin;
  }

  @lombok.Data
  @lombok.Builder
  public static class AdminDto {
    private UUID id;
    private String email;
    private String fullName;
    private String role;
    private boolean isActive;
    private Instant lastLoginAt;
    private Instant createdAt;
  }
}
