package com.kaiz.lifeos.identity.api;

import com.kaiz.lifeos.identity.application.AuthService;
import com.kaiz.lifeos.identity.application.dto.AuthDtos.AuthResponse;
import com.kaiz.lifeos.identity.application.dto.AuthDtos.ForgotPasswordRequest;
import com.kaiz.lifeos.identity.application.dto.AuthDtos.LoginRequest;
import com.kaiz.lifeos.identity.application.dto.AuthDtos.MessageResponse;
import com.kaiz.lifeos.identity.application.dto.AuthDtos.RefreshTokenRequest;
import com.kaiz.lifeos.identity.application.dto.AuthDtos.RegisterRequest;
import com.kaiz.lifeos.identity.application.dto.AuthDtos.ResetPasswordRequest;
import com.kaiz.lifeos.identity.application.dto.AuthDtos.TokenResponse;
import com.kaiz.lifeos.identity.application.dto.AuthDtos.UserResponse;
import com.kaiz.lifeos.identity.application.dto.AuthDtos.VerifyEmailRequest;
import com.kaiz.lifeos.shared.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "User authentication endpoints")
public class AuthController {

  private final AuthService authService;

  @PostMapping("/register")
  @Operation(summary = "Register a new user")
  public ResponseEntity<ApiResponse<AuthResponse>> register(
      @Valid @RequestBody RegisterRequest request) {
    AuthResponse response = authService.register(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
  }

  @PostMapping("/login")
  @Operation(summary = "Login with email and password")
  public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
    AuthResponse response = authService.login(request);
    return ResponseEntity.ok(ApiResponse.success(response));
  }

  @PostMapping("/refresh")
  @Operation(summary = "Refresh access token using refresh token")
  public ResponseEntity<ApiResponse<TokenResponse>> refresh(
      @Valid @RequestBody RefreshTokenRequest request) {
    TokenResponse response = authService.refreshToken(request);
    return ResponseEntity.ok(ApiResponse.success(response));
  }

  @PostMapping("/logout")
  @Operation(summary = "Logout and revoke all refresh tokens")
  public ResponseEntity<ApiResponse<Void>> logout(@AuthenticationPrincipal String userId) {
    authService.logout(UUID.fromString(userId));
    return ResponseEntity.ok(ApiResponse.success(null));
  }

  @GetMapping("/me")
  @Operation(summary = "Get current authenticated user")
  public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(
      @AuthenticationPrincipal String userId) {
    UserResponse response = authService.getCurrentUser(UUID.fromString(userId));
    return ResponseEntity.ok(ApiResponse.success(response));
  }

  @PostMapping("/forgot-password")
  @Operation(summary = "Request password reset email")
  public ResponseEntity<ApiResponse<MessageResponse>> forgotPassword(
      @Valid @RequestBody ForgotPasswordRequest request) {
    String message = authService.forgotPassword(request);
    return ResponseEntity.ok(ApiResponse.success(new MessageResponse(message)));
  }

  @PostMapping("/reset-password")
  @Operation(summary = "Reset password using token from email")
  public ResponseEntity<ApiResponse<MessageResponse>> resetPassword(
      @Valid @RequestBody ResetPasswordRequest request) {
    authService.resetPassword(request);
    return ResponseEntity.ok(
        ApiResponse.success(new MessageResponse("Password has been reset successfully")));
  }

  @PostMapping("/verify-email/send")
  @Operation(summary = "Send email verification code")
  public ResponseEntity<ApiResponse<MessageResponse>> sendVerificationCode(
      @AuthenticationPrincipal String userId) {
    String message = authService.sendVerificationCode(UUID.fromString(userId));
    return ResponseEntity.ok(ApiResponse.success(new MessageResponse(message)));
  }

  @PostMapping("/verify-email")
  @Operation(summary = "Verify email with code")
  public ResponseEntity<ApiResponse<MessageResponse>> verifyEmail(
      @AuthenticationPrincipal String userId, @Valid @RequestBody VerifyEmailRequest request) {
    authService.verifyEmail(UUID.fromString(userId), request);
    return ResponseEntity.ok(
        ApiResponse.success(new MessageResponse("Email verified successfully")));
  }
}
