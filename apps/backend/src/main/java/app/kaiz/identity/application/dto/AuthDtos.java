package app.kaiz.identity.application.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public sealed interface AuthDtos {

  record RegisterRequest(
      @NotBlank(message = "Email is required") @Email(message = "Invalid email format")
          String email,
      @NotBlank(message = "Password is required")
          @Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
          String password,
      @NotBlank(message = "Full name is required")
          @Size(min = 2, max = 255, message = "Full name must be between 2 and 255 characters")
          String fullName,
      String timezone)
      implements AuthDtos {}

  record LoginRequest(
      @NotBlank(message = "Email is required") @Email(message = "Invalid email format")
          String email,
      @NotBlank(message = "Password is required") String password)
      implements AuthDtos {}

  record RefreshTokenRequest(@NotBlank(message = "Refresh token is required") String refreshToken)
      implements AuthDtos {}

  record AuthResponse(String accessToken, String refreshToken, UserResponse user)
      implements AuthDtos {}

  record UserResponse(
      String id,
      String email,
      String fullName,
      String accountType,
      String subscriptionTier,
      String timezone,
      String avatarUrl,
      boolean emailVerified)
      implements AuthDtos {}

  record TokenResponse(String accessToken, String refreshToken) implements AuthDtos {}

  record ForgotPasswordRequest(
      @NotBlank(message = "Email is required") @Email(message = "Invalid email format")
          String email)
      implements AuthDtos {}

  record ResetPasswordRequest(
      @NotBlank(message = "Token is required") String token,
      @NotBlank(message = "New password is required")
          @Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
          String newPassword)
      implements AuthDtos {}

  record VerifyEmailRequest(@NotBlank(message = "Code is required") String code)
      implements AuthDtos {}

  record MessageResponse(String message) implements AuthDtos {}
}
