package app.kaiz.admin.api;

import app.kaiz.admin.application.AdminAuthService;
import app.kaiz.admin.application.AdminAuthService.AdminAuthResponse;
import app.kaiz.admin.application.AdminAuthService.AdminDto;
import app.kaiz.admin.domain.AdminUser;
import app.kaiz.shared.util.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/auth")
@RequiredArgsConstructor
public class AdminAuthController {

  private final AdminAuthService adminAuthService;

  @PostMapping("/login")
  public ResponseEntity<ApiResponse<AdminAuthResponse>> login(
      @Valid @RequestBody LoginRequest request,
      HttpServletRequest httpRequest) {

    String deviceInfo = httpRequest.getHeader("User-Agent");
    String ipAddress = getClientIp(httpRequest);

    AdminAuthResponse response = adminAuthService.login(
        request.getEmail(),
        request.getPassword(),
        deviceInfo,
        ipAddress
    );

    return ResponseEntity.ok(ApiResponse.success(response));
  }

  @PostMapping("/refresh")
  public ResponseEntity<ApiResponse<AdminAuthResponse>> refresh(
      @Valid @RequestBody RefreshRequest request) {

    AdminAuthResponse response = adminAuthService.refreshToken(request.getRefreshToken());
    return ResponseEntity.ok(ApiResponse.success(response));
  }

  @PostMapping("/logout")
  public ResponseEntity<ApiResponse<Void>> logout(
      @Valid @RequestBody LogoutRequest request) {

    adminAuthService.logout(request.getRefreshToken());
    return ResponseEntity.ok(ApiResponse.success(null));
  }

  @GetMapping("/me")
  public ResponseEntity<ApiResponse<AdminDto>> getCurrentAdmin(
      @RequestAttribute(name = "adminId", required = false) UUID adminId) {

    if (adminId == null) {
      return ResponseEntity.status(401)
          .body(ApiResponse.error("Admin authentication required"));
    }

    AdminDto admin = adminAuthService.getCurrentAdmin(adminId);
    return ResponseEntity.ok(ApiResponse.success(admin));
  }

  // Internal endpoint to create first admin (should be disabled in production or protected)
  @PostMapping("/setup")
  public ResponseEntity<ApiResponse<AdminDto>> createAdmin(
      @Valid @RequestBody CreateAdminRequest request,
      @RequestHeader(value = "X-Setup-Key", required = false) String setupKey) {

    // Simple protection - in production use a more secure mechanism
    if (!"KAIZ_ADMIN_SETUP_2026".equals(setupKey)) {
      return ResponseEntity.status(403)
          .body(ApiResponse.error("Invalid setup key"));
    }

    AdminDto admin = adminAuthService.createAdmin(
        request.getEmail(),
        request.getPassword(),
        request.getFullName(),
        AdminUser.AdminRole.valueOf(request.getRole())
    );

    return ResponseEntity.ok(ApiResponse.success(admin));
  }

  private String getClientIp(HttpServletRequest request) {
    String xForwardedFor = request.getHeader("X-Forwarded-For");
    if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
      return xForwardedFor.split(",")[0].trim();
    }
    return request.getRemoteAddr();
  }

  // Request DTOs
  @Data
  public static class LoginRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
  }

  @Data
  public static class RefreshRequest {
    @NotBlank(message = "Refresh token is required")
    private String refreshToken;
  }

  @Data
  public static class LogoutRequest {
    @NotBlank(message = "Refresh token is required")
    private String refreshToken;
  }

  @Data
  public static class CreateAdminRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Role is required")
    private String role;
  }
}
