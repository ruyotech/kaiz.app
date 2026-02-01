package app.kaiz.shared.security;

import app.kaiz.shared.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;
import javax.crypto.SecretKey;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class JwtTokenProvider {

  private final JwtProperties jwtProperties;
  private final SecretKey secretKey;

  public JwtTokenProvider(JwtProperties jwtProperties) {
    this.jwtProperties = jwtProperties;
    this.secretKey = Keys.hmacShaKeyFor(jwtProperties.secret().getBytes(StandardCharsets.UTF_8));
  }

  public String generateAccessToken(UUID userId, String email) {
    Instant now = Instant.now();
    Instant expiry = now.plusMillis(jwtProperties.accessTokenExpiration());

    return Jwts.builder()
        .id(UUID.randomUUID().toString())
        .subject(userId.toString())
        .claim("email", email)
        .claim("type", "access")
        .issuer(jwtProperties.issuer())
        .audience()
        .add(jwtProperties.audience())
        .and()
        .issuedAt(Date.from(now))
        .expiration(Date.from(expiry))
        .signWith(secretKey)
        .compact();
  }

  public String generateRefreshToken(UUID userId) {
    Instant now = Instant.now();
    Instant expiry = now.plusMillis(jwtProperties.refreshTokenExpiration());

    return Jwts.builder()
        .id(UUID.randomUUID().toString())
        .subject(userId.toString())
        .claim("type", "refresh")
        .issuer(jwtProperties.issuer())
        .audience()
        .add(jwtProperties.audience())
        .and()
        .issuedAt(Date.from(now))
        .expiration(Date.from(expiry))
        .signWith(secretKey)
        .compact();
  }

  public boolean validateToken(String token) {
    if (token == null || token.isBlank()) {
      log.debug("JWT token is null or empty");
      return false;
    }
    try {
      Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token);
      return true;
    } catch (ExpiredJwtException e) {
      log.debug("JWT token expired");
    } catch (JwtException e) {
      log.debug("Invalid JWT token: {}", e.getMessage());
    }
    return false;
  }

  public Claims getClaims(String token) {
    return Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token).getPayload();
  }

  public UUID getUserIdFromToken(String token) {
    Claims claims = getClaims(token);
    return UUID.fromString(claims.getSubject());
  }

  public String getEmailFromToken(String token) {
    Claims claims = getClaims(token);
    return claims.get("email", String.class);
  }

  public String getTokenType(String token) {
    Claims claims = getClaims(token);
    return claims.get("type", String.class);
  }

  public String getTokenId(String token) {
    Claims claims = getClaims(token);
    return claims.getId();
  }

  public boolean isAccessToken(String token) {
    return "access".equals(getTokenType(token));
  }

  public boolean isRefreshToken(String token) {
    return "refresh".equals(getTokenType(token));
  }

  public boolean isAdminToken(String token) {
    return "admin".equals(getTokenType(token));
  }

  public String getAdminRole(String token) {
    Claims claims = getClaims(token);
    return claims.get("role", String.class);
  }
}
