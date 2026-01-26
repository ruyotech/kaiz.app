package app.kaiz.life_wheel.api;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;

import app.kaiz.IntegrationTestBase;
import io.restassured.RestAssured;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

class LifeWheelControllerIntegrationTest extends IntegrationTestBase {

  private static final String API_PATH = "/api/v1";

  @BeforeEach
  void setUpRestAssured() {
    RestAssured.port = port;
  }

  @Nested
  @DisplayName("GET /api/v1/life-wheel-areas")
  class GetLifeWheelAreasTests {

    @Test
    @DisplayName("should return all life wheel areas from seed data")
    void shouldReturnAllLifeWheelAreas() {
      given()
          .when()
          .get(API_PATH + "/life-wheel-areas")
          .then()
          .statusCode(200)
          .body("success", is(true))
          .body("data", hasSize(8))
          .body("data[0].id", notNullValue())
          .body("data[0].name", notNullValue())
          .body("data[0].icon", notNullValue())
          .body("data[0].color", notNullValue())
          .body("data[0].displayOrder", notNullValue());
    }

    @Test
    @DisplayName("should return life wheel areas in correct order")
    void shouldReturnAreasInCorrectOrder() {
      given()
          .when()
          .get(API_PATH + "/life-wheel-areas")
          .then()
          .statusCode(200)
          .body("data[0].displayOrder", equalTo(1))
          .body("data[1].displayOrder", equalTo(2))
          .body("data[2].displayOrder", equalTo(3));
    }

    @Test
    @DisplayName("should include Career area")
    void shouldIncludeCareerArea() {
      given()
          .when()
          .get(API_PATH + "/life-wheel-areas")
          .then()
          .statusCode(200)
          .body("data.find { it.id == 'lw-career' }.name", equalTo("Career"));
    }

    @Test
    @DisplayName("should include Finance area")
    void shouldIncludeFinanceArea() {
      given()
          .when()
          .get(API_PATH + "/life-wheel-areas")
          .then()
          .statusCode(200)
          .body("data.find { it.id == 'lw-finance' }.name", equalTo("Finance"));
    }

    @Test
    @DisplayName("should include Health area")
    void shouldIncludeHealthArea() {
      given()
          .when()
          .get(API_PATH + "/life-wheel-areas")
          .then()
          .statusCode(200)
          .body("data.find { it.id == 'lw-health' }.name", equalTo("Health"));
    }

    @Test
    @DisplayName("should include relationships area")
    void shouldIncludeRelationshipsArea() {
      given()
          .when()
          .get(API_PATH + "/life-wheel-areas")
          .then()
          .statusCode(200)
          .body("data.find { it.id == 'lw-relationships' }.name", equalTo("Relationships"));
    }

    @Test
    @DisplayName("should be publicly accessible without authentication")
    void shouldBePubliclyAccessible() {
      given().when().get(API_PATH + "/life-wheel-areas").then().statusCode(200);
    }

    @Test
    @DisplayName("should have valid color format")
    void shouldHaveValidColorFormat() {
      given()
          .when()
          .get(API_PATH + "/life-wheel-areas")
          .then()
          .statusCode(200)
          .body("data.every { it.color.startsWith('#') }", is(true));
    }
  }

  @Nested
  @DisplayName("GET /api/v1/eisenhower-quadrants")
  class GetEisenhowerQuadrantsTests {

    @Test
    @DisplayName("should return all 4 eisenhower quadrants from seed data")
    void shouldReturnAllEisenhowerQuadrants() {
      given()
          .when()
          .get(API_PATH + "/eisenhower-quadrants")
          .then()
          .statusCode(200)
          .body("success", is(true))
          .body("data", hasSize(4))
          .body("data[0].id", notNullValue())
          .body("data[0].name", notNullValue())
          .body("data[0].label", notNullValue())
          .body("data[0].color", notNullValue())
          .body("data[0].displayOrder", notNullValue());
    }

    @Test
    @DisplayName("should return quadrants in correct order")
    void shouldReturnQuadrantsInCorrectOrder() {
      given()
          .when()
          .get(API_PATH + "/eisenhower-quadrants")
          .then()
          .statusCode(200)
          .body("data[0].displayOrder", equalTo(1))
          .body("data[1].displayOrder", equalTo(2))
          .body("data[2].displayOrder", equalTo(3))
          .body("data[3].displayOrder", equalTo(4));
    }

    @Test
    @DisplayName("should include Q1 - Do First quadrant")
    void shouldIncludeDoFirstQuadrant() {
      given()
          .when()
          .get(API_PATH + "/eisenhower-quadrants")
          .then()
          .statusCode(200)
          .body("data.find { it.id == 'eq-1' }.name", equalTo("Do First"))
          .body("data.find { it.id == 'eq-1' }.label", equalTo("Urgent & Important"));
    }

    @Test
    @DisplayName("should include Q2 - Schedule quadrant")
    void shouldIncludeScheduleQuadrant() {
      given()
          .when()
          .get(API_PATH + "/eisenhower-quadrants")
          .then()
          .statusCode(200)
          .body("data.find { it.id == 'eq-2' }.name", equalTo("Schedule"))
          .body("data.find { it.id == 'eq-2' }.label", equalTo("Not Urgent & Important"));
    }

    @Test
    @DisplayName("should include Q3 - Delegate quadrant")
    void shouldIncludeDelegateQuadrant() {
      given()
          .when()
          .get(API_PATH + "/eisenhower-quadrants")
          .then()
          .statusCode(200)
          .body("data.find { it.id == 'eq-3' }.name", equalTo("Delegate"))
          .body("data.find { it.id == 'eq-3' }.label", equalTo("Urgent & Not Important"));
    }

    @Test
    @DisplayName("should include Q4 - Eliminate quadrant")
    void shouldIncludeEliminateQuadrant() {
      given()
          .when()
          .get(API_PATH + "/eisenhower-quadrants")
          .then()
          .statusCode(200)
          .body("data.find { it.id == 'eq-4' }.name", equalTo("Eliminate"))
          .body("data.find { it.id == 'eq-4' }.label", equalTo("Not Urgent & Not Important"));
    }

    @Test
    @DisplayName("should be publicly accessible without authentication")
    void shouldBePubliclyAccessible() {
      given().when().get(API_PATH + "/eisenhower-quadrants").then().statusCode(200);
    }

    @Test
    @DisplayName("should have valid color format")
    void shouldHaveValidColorFormat() {
      given()
          .when()
          .get(API_PATH + "/eisenhower-quadrants")
          .then()
          .statusCode(200)
          .body("data.every { it.color.startsWith('#') }", is(true));
    }

    @Test
    @DisplayName("should include description for quadrants")
    void shouldIncludeDescription() {
      given()
          .when()
          .get(API_PATH + "/eisenhower-quadrants")
          .then()
          .statusCode(200)
          .body("data[0].description", notNullValue());
    }
  }
}
