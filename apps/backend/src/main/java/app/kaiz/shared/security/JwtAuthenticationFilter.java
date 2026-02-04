package app.kaiz.shared.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private static final String AUTHORIZATION_HEADER = "Authorization";
  private static final String BEARER_PREFIX = "Bearer ";

  private final JwtTokenProvider jwtTokenProvider;

  @Override
  protected void doFilterInternal(
      @NonNull HttpServletRequest request,
      @NonNull HttpServletResponse response,
      @NonNull FilterChain filterChain)
      throws ServletException, IOException {

    try {
      String token = extractToken(request);
      String uri = request.getRequestURI();
      
      // Log for admin endpoints
      if (uri.contains("/admin/")) {
        log.info("Processing admin request: {} - Token present: {}", uri, StringUtils.hasText(token));
      }

      if (StringUtils.hasText(token) && jwtTokenProvider.validateToken(token)) {

        // Check if it's an admin token
        if (jwtTokenProvider.isAdminToken(token)) {
          UUID adminId = jwtTokenProvider.getUserIdFromToken(token);
          String email = jwtTokenProvider.getEmailFromToken(token);
          String adminRole = jwtTokenProvider.getAdminRole(token);

          List<SimpleGrantedAuthority> authorities = new ArrayList<>();
          authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
          // Add specific admin role (SUPER_ADMIN, ADMIN, SUPPORT, MARKETING)
          if (adminRole != null) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + adminRole));
          }

          UsernamePasswordAuthenticationToken authentication =
              new UsernamePasswordAuthenticationToken(adminId.toString(), null, authorities);

          authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
          SecurityContextHolder.getContext().setAuthentication(authentication);

          // Set adminId as request attribute for controllers
          request.setAttribute("adminId", adminId);

          log.info("Authenticated admin: {} with role: {} for {}", email, adminRole, uri);
        }
        // Regular user access token
        else if (jwtTokenProvider.isAccessToken(token)) {
          UUID userId = jwtTokenProvider.getUserIdFromToken(token);
          String email = jwtTokenProvider.getEmailFromToken(token);

          UsernamePasswordAuthenticationToken authentication =
              new UsernamePasswordAuthenticationToken(
                  userId.toString(), null, List.of(new SimpleGrantedAuthority("ROLE_USER")));

          authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
          SecurityContextHolder.getContext().setAuthentication(authentication);

          log.debug("Authenticated user: {}", email);
        } else {
          log.info("Token is neither admin nor access token for {}", uri);
        }
      } else if (StringUtils.hasText(token)) {
        log.info("Token validation failed for {}", uri);
      }
    } catch (Exception e) {
      log.warn("Could not set user authentication for {}: {}", request.getRequestURI(), e.getMessage());
    }

    filterChain.doFilter(request, response);
  }

  private String extractToken(HttpServletRequest request) {
    String bearerToken = request.getHeader(AUTHORIZATION_HEADER);
    if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(BEARER_PREFIX)) {
      return bearerToken.substring(BEARER_PREFIX.length());
    }
    return null;
  }
}
