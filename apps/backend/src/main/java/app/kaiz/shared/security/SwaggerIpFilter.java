package app.kaiz.shared.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Filter to restrict Swagger/API docs access to specific IPs only.
 * This provides additional security for API documentation in production.
 */
@Component
@Slf4j
public class SwaggerIpFilter extends OncePerRequestFilter {

  @Value("${security.swagger.allowed-ips:}")
  private String allowedIpsConfig;

  @Value("${security.swagger.enabled:true}")
  private boolean swaggerEnabled;

  private static final List<String> SWAGGER_PATHS = List.of(
      "/swagger-ui",
      "/swagger-ui.html",
      "/api-docs",
      "/v3/api-docs"
  );

  @Override
  protected void doFilterInternal(
      HttpServletRequest request,
      HttpServletResponse response,
      FilterChain filterChain) throws ServletException, IOException {

    String requestUri = request.getRequestURI();

    // Check if this is a Swagger-related request
    if (isSwaggerRequest(requestUri)) {
      // If swagger is disabled in production, block all access
      if (!swaggerEnabled) {
        log.warn("Swagger access denied - disabled in configuration. IP: {}", getClientIp(request));
        response.sendError(HttpServletResponse.SC_NOT_FOUND, "Not Found");
        return;
      }

      // If allowed IPs are configured, check the client IP
      if (allowedIpsConfig != null && !allowedIpsConfig.isBlank()) {
        String clientIp = getClientIp(request);
        List<String> allowedIps = Arrays.asList(allowedIpsConfig.split(","));

        if (!isIpAllowed(clientIp, allowedIps)) {
          log.warn("Swagger access denied for IP: {} - not in allowed list", clientIp);
          response.sendError(HttpServletResponse.SC_FORBIDDEN, "Access denied");
          return;
        }
        log.debug("Swagger access granted for IP: {}", clientIp);
      }
    }

    filterChain.doFilter(request, response);
  }

  private boolean isSwaggerRequest(String uri) {
    return SWAGGER_PATHS.stream().anyMatch(uri::startsWith);
  }

  private String getClientIp(HttpServletRequest request) {
    // Check X-Forwarded-For header first (for requests behind load balancers/proxies)
    String xForwardedFor = request.getHeader("X-Forwarded-For");
    if (xForwardedFor != null && !xForwardedFor.isBlank()) {
      // X-Forwarded-For can contain multiple IPs, take the first one (original client)
      return xForwardedFor.split(",")[0].trim();
    }

    // Check X-Real-IP header
    String xRealIp = request.getHeader("X-Real-IP");
    if (xRealIp != null && !xRealIp.isBlank()) {
      return xRealIp.trim();
    }

    // Fall back to remote address
    return request.getRemoteAddr();
  }

  private boolean isIpAllowed(String clientIp, List<String> allowedIps) {
    // Allow localhost always for development
    if ("127.0.0.1".equals(clientIp) || "0:0:0:0:0:0:0:1".equals(clientIp) || "localhost".equals(clientIp)) {
      return true;
    }

    // Check if client IP is in allowed list
    return allowedIps.stream()
        .map(String::trim)
        .anyMatch(allowedIp -> {
          // Support CIDR notation in the future, for now exact match
          if (allowedIp.equals(clientIp)) {
            return true;
          }
          // Support wildcard suffix (e.g., "192.168.1.*")
          if (allowedIp.endsWith("*")) {
            String prefix = allowedIp.substring(0, allowedIp.length() - 1);
            return clientIp.startsWith(prefix);
          }
          return false;
        });
  }
}
