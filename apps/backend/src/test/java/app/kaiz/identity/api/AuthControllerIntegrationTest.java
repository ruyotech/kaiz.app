package app.kaiz.identity.api;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;

import app.kaiz.IntegrationTestBase;
import app.kaiz.identity.application.dto.AuthDtos.LoginRequest;
import app.kaiz.identity.application.dto.AuthDtos.RefreshTokenRequest;
import app.kaiz.identity.application.dto.AuthDtos.RegisterRequest;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

class AuthControllerIntegrationTest extends IntegrationTestBase {

  private static final String AUTH_PATH = "/api/v1/auth";

  @BeforeEach
  void setUpRestAssured() {
    RestAssured.port = port;
  }

  @Nested
  @DisplayName("POST /api/v1/auth/register")
  class RegisterTests {

    @Test
    @DisplayName("should register new user successfully")
    void shouldRegisterNewUserSuccessfully() {
      RegisterRequest request =
          new RegisterRequest(
              "newuser@example.com", "SecurePassword123!", "New User", "America/New_York", null);

      given()
          .contentType(ContentType.JSON)
          .body(request)
          .when()
          .post(AUTH_PATH + "/register")
          .then()
          .statusCode(201)
          .body("success", is(true))
          .body("data.accessToken", notNullValue())
          .body("data.refreshToken", notNullValue())
          .body("data.user.email", equalTo("newuser@example.com"))
          .body("data.user.fullName", equalTo("New User"))
          .body("data.user.timezone", equalTo("America/New_York"))
          .body("data.user.accountType", equalTo("INDIVIDUAL"))
          .body("data.user.subscriptionTier", equalTo("FREE"));
    }

    @Test
    @DisplayName("should normalize email to lowercase")
    void shouldNormalizeEmailToLowercase() {
      RegisterRequest request =
          new RegisterRequest(
              "UPPERCASE@EXAMPLE.COM", "SecurePassword123!", "Test User", null, null);

      given()
          .contentType(ContentType.JSON)
          .body(request)
          .when()
          .post(AUTH_PATH + "/register")
          .then()
          .statusCode(201)
          .body("data.user.email", equalTo("uppercase@example.com"));
    }

    @Test
    @DisplayName("should use UTC timezone when not provided")
    void shouldUseUtcTimezoneWhenNotProvided() {
      RegisterRequest request =
          new RegisterRequest(
              "notimezone@example.com", "SecurePassword123!", "No Timezone", null, null);

      given()
          .contentType(ContentType.JSON)
          .body(request)
          .when()
          .post(AUTH_PATH + "/register")
          .then()
          .statusCode(201)
          .body("data.user.timezone", equalTo("UTC"));
    }

    @Test
    @DisplayName("should return 400 when email already exists")
    void shouldReturn400WhenEmailExists() {
      RegisterRequest request =
          new RegisterRequest(
              "duplicate@example.com", "SecurePassword123!", "First User", null, null);

      // First registration
      given().contentType(ContentType.JSON).body(request).when().post(AUTH_PATH + "/register");

      // Second registration with same email
      given()
          .contentType(ContentType.JSON)
          .body(request)
          .when()
          .post(AUTH_PATH + "/register")
          .then()
          .statusCode(400)
          .body("success", is(false));
    }

    @Test
    @DisplayName("should return 400 when email is invalid")
    void shouldReturn400WhenEmailInvalid() {
      RegisterRequest request =
          new RegisterRequest("not-an-email", "SecurePassword123!", "Test User", null, null);

      given()
          .contentType(ContentType.JSON)
          .body(request)
          .when()
          .post(AUTH_PATH + "/register")
          .then()
          .statusCode(400);
    }

    @Test
    @DisplayName("should return 400 when password is too short")
    void shouldReturn400WhenPasswordTooShort() {
      RegisterRequest request =
          new RegisterRequest("valid@example.com", "short", "Test User", null, null);

      given()
          .contentType(ContentType.JSON)
          .body(request)
          .when()
          .post(AUTH_PATH + "/register")
          .then()
          .statusCode(400);
    }

    @Test
    @DisplayName("should return 400 when full name is missing")
    void shouldReturn400WhenFullNameMissing() {
      RegisterRequest request =
          new RegisterRequest("valid@example.com", "SecurePassword123!", "", null, null);

      given()
          .contentType(ContentType.JSON)
          .body(request)
          .when()
          .post(AUTH_PATH + "/register")
          .then()
          .statusCode(400);
    }
  }

  @Nested
  @DisplayName("POST /api/v1/auth/login")
  class LoginTests {

    @Test
    @DisplayName("should login successfully with valid credentials")
    void shouldLoginSuccessfully() {
      // First register a user
      RegisterRequest registerRequest =
          new RegisterRequest("login@example.com", "SecurePassword123!", "Login User", null, null);
      given()
          .contentType(ContentType.JSON)
          .body(registerRequest)
          .when()
          .post(AUTH_PATH + "/register");

      // Then login
      LoginRequest loginRequest = new LoginRequest("login@example.com", "SecurePassword123!", null);

      given()
          .contentType(ContentType.JSON)
          .body(loginRequest)
          .when()
          .post(AUTH_PATH + "/login")
          .then()
          .statusCode(200)
          .body("success", is(true))
          .body("data.accessToken", notNullValue())
          .body("data.refreshToken", notNullValue())
          .body("data.user.email", equalTo("login@example.com"));
    }

    @Test
    @DisplayName("should return 401 when user does not exist")
    void shouldReturn401WhenUserNotFound() {
      LoginRequest request =
          new LoginRequest("nonexistent@example.com", "SecurePassword123!", null);

      given()
          .contentType(ContentType.JSON)
          .body(request)
          .when()
          .post(AUTH_PATH + "/login")
          .then()
          .statusCode(401);
    }

    @Test
    @DisplayName("should return 401 when password is incorrect")
    void shouldReturn401WhenPasswordIncorrect() {
      // First register a user
      RegisterRequest registerRequest =
          new RegisterRequest(
              "wrongpass@example.com", "SecurePassword123!", "Wrong Pass User", null, null);
      given()
          .contentType(ContentType.JSON)
          .body(registerRequest)
          .when()
          .post(AUTH_PATH + "/register");

      // Then try login with wrong password
      LoginRequest loginRequest = new LoginRequest("wrongpass@example.com", "WrongPassword!", null);

      given()
          .contentType(ContentType.JSON)
          .body(loginRequest)
          .when()
          .post(AUTH_PATH + "/login")
          .then()
          .statusCode(401);
    }

    @Test
    @DisplayName("should normalize email to lowercase")
    void shouldNormalizeEmailToLowercase() {
      // First register a user
      RegisterRequest registerRequest =
          new RegisterRequest(
              "casetest@example.com", "SecurePassword123!", "Case Test User", null, null);
      given()
          .contentType(ContentType.JSON)
          .body(registerRequest)
          .when()
          .post(AUTH_PATH + "/register");

      // Then login with uppercase email
      LoginRequest loginRequest =
          new LoginRequest("CASETEST@EXAMPLE.COM", "SecurePassword123!", null);

      given()
          .contentType(ContentType.JSON)
          .body(loginRequest)
          .when()
          .post(AUTH_PATH + "/login")
          .then()
          .statusCode(200)
          .body("success", is(true));
    }
  }

  @Nested
  @DisplayName("POST /api/v1/auth/refresh")
  class RefreshTokenTests {

    @Test
    @DisplayName("should refresh token successfully")
    void shouldRefreshTokenSuccessfully() {
      // First register to get tokens
      RegisterRequest registerRequest =
          new RegisterRequest(
              "refresh@example.com", "SecurePassword123!", "Refresh User", null, null);

      String refreshToken =
          given()
              .contentType(ContentType.JSON)
              .body(registerRequest)
              .when()
              .post(AUTH_PATH + "/register")
              .then()
              .statusCode(201)
              .extract()
              .path("data.refreshToken");

      // Then refresh
      RefreshTokenRequest refreshRequest = new RefreshTokenRequest(refreshToken);

      given()
          .contentType(ContentType.JSON)
          .body(refreshRequest)
          .when()
          .post(AUTH_PATH + "/refresh")
          .then()
          .statusCode(200)
          .body("success", is(true))
          .body("data.accessToken", notNullValue())
          .body("data.refreshToken", notNullValue());
    }

    @Test
    @DisplayName("should return 401 when refresh token is invalid")
    void shouldReturn401WhenRefreshTokenInvalid() {
      RefreshTokenRequest request = new RefreshTokenRequest("invalid.refresh.token");

      given()
          .contentType(ContentType.JSON)
          .body(request)
          .when()
          .post(AUTH_PATH + "/refresh")
          .then()
          .statusCode(401);
    }

    @Test
    @DisplayName("should invalidate old refresh token after rotation")
    void shouldInvalidateOldRefreshTokenAfterRotation() {
      // First register to get tokens
      RegisterRequest registerRequest =
          new RegisterRequest(
              "rotation@example.com", "SecurePassword123!", "Rotation User", null, null);

      String oldRefreshToken =
          given()
              .contentType(ContentType.JSON)
              .body(registerRequest)
              .when()
              .post(AUTH_PATH + "/register")
              .then()
              .statusCode(201)
              .extract()
              .path("data.refreshToken");

      // Refresh once
      RefreshTokenRequest refreshRequest = new RefreshTokenRequest(oldRefreshToken);
      given()
          .contentType(ContentType.JSON)
          .body(refreshRequest)
          .when()
          .post(AUTH_PATH + "/refresh")
          .then()
          .statusCode(200);

      // Try to use old refresh token again
      given()
          .contentType(ContentType.JSON)
          .body(refreshRequest)
          .when()
          .post(AUTH_PATH + "/refresh")
          .then()
          .statusCode(401);
    }
  }

  @Nested
  @DisplayName("GET /api/v1/auth/me")
  class GetCurrentUserTests {

    @Test
    @DisplayName("should return current user when authenticated")
    void shouldReturnCurrentUserWhenAuthenticated() {
      // First register to get tokens
      RegisterRequest registerRequest =
          new RegisterRequest(
              "me@example.com", "SecurePassword123!", "Me User", "Europe/London", null);

      String accessToken =
          given()
              .contentType(ContentType.JSON)
              .body(registerRequest)
              .when()
              .post(AUTH_PATH + "/register")
              .then()
              .statusCode(201)
              .extract()
              .path("data.accessToken");

      // Then get current user
      given()
          .header("Authorization", "Bearer " + accessToken)
          .when()
          .get(AUTH_PATH + "/me")
          .then()
          .statusCode(200)
          .body("success", is(true))
          .body("data.email", equalTo("me@example.com"))
          .body("data.fullName", equalTo("Me User"))
          .body("data.timezone", equalTo("Europe/London"));
    }

    @Test
    @DisplayName("should return 401 when not authenticated")
    void shouldReturn401WhenNotAuthenticated() {
      given().when().get(AUTH_PATH + "/me").then().statusCode(401);
    }

    @Test
    @DisplayName("should return 401 when token is invalid")
    void shouldReturn401WhenTokenInvalid() {
      given()
          .header("Authorization", "Bearer invalid.token.here")
          .when()
          .get(AUTH_PATH + "/me")
          .then()
          .statusCode(401);
    }
  }

  @Nested
  @DisplayName("POST /api/v1/auth/logout")
  class LogoutTests {

    @Test
    @DisplayName("should logout successfully when authenticated")
    void shouldLogoutSuccessfully() {
      // First register to get tokens
      RegisterRequest registerRequest =
          new RegisterRequest(
              "logout@example.com", "SecurePassword123!", "Logout User", null, null);

      String accessToken =
          given()
              .contentType(ContentType.JSON)
              .body(registerRequest)
              .when()
              .post(AUTH_PATH + "/register")
              .then()
              .statusCode(201)
              .extract()
              .path("data.accessToken");

      // Then logout
      given()
          .header("Authorization", "Bearer " + accessToken)
          .when()
          .post(AUTH_PATH + "/logout")
          .then()
          .statusCode(200)
          .body("success", is(true));
    }

    @Test
    @DisplayName("should return 401 when not authenticated")
    void shouldReturn401WhenNotAuthenticated() {
      given().when().post(AUTH_PATH + "/logout").then().statusCode(401);
    }
  }
}
