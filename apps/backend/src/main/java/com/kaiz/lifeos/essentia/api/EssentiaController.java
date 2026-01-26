package com.kaiz.lifeos.essentia.api;

import com.kaiz.lifeos.essentia.application.EssentiaService;
import com.kaiz.lifeos.essentia.application.dto.EssentiaBookDto;
import com.kaiz.lifeos.essentia.application.dto.EssentiaUserProgressDto;
import com.kaiz.lifeos.essentia.domain.Difficulty;
import com.kaiz.lifeos.shared.security.CurrentUser;
import com.kaiz.lifeos.shared.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/essentia")
@RequiredArgsConstructor
@Tag(name = "Essentia", description = "Micro-learning book content endpoints")
public class EssentiaController {

  private final EssentiaService essentiaService;

  // Public endpoints for books
  @GetMapping("/books")
  @Operation(summary = "Get all books", description = "Retrieve all available micro-learning books")
  public ResponseEntity<ApiResponse<List<EssentiaBookDto>>> getAllBooks() {
    return ResponseEntity.ok(ApiResponse.success(essentiaService.getAllBooks()));
  }

  @GetMapping("/books/{id}")
  @Operation(
      summary = "Get book by ID",
      description = "Retrieve a specific book with all its cards")
  public ResponseEntity<ApiResponse<EssentiaBookDto>> getBookById(@PathVariable String id) {
    return ResponseEntity.ok(ApiResponse.success(essentiaService.getBookById(id)));
  }

  @GetMapping("/books/category/{category}")
  @Operation(summary = "Get books by category", description = "Retrieve books filtered by category")
  public ResponseEntity<ApiResponse<List<EssentiaBookDto>>> getBooksByCategory(@PathVariable String category) {
    return ResponseEntity.ok(ApiResponse.success(essentiaService.getBooksByCategory(category)));
  }

  @GetMapping("/books/difficulty/{difficulty}")
  @Operation(
      summary = "Get books by difficulty",
      description = "Retrieve books filtered by difficulty level")
  public ResponseEntity<ApiResponse<List<EssentiaBookDto>>> getBooksByDifficulty(
      @PathVariable Difficulty difficulty) {
    return ResponseEntity.ok(ApiResponse.success(essentiaService.getBooksByDifficulty(difficulty)));
  }

  @GetMapping("/books/life-wheel/{lifeWheelAreaId}")
  @Operation(
      summary = "Get books by life wheel area",
      description = "Retrieve books for a specific life wheel dimension")
  public ResponseEntity<ApiResponse<List<EssentiaBookDto>>> getBooksByLifeWheelArea(
      @PathVariable String lifeWheelAreaId) {
    return ResponseEntity.ok(ApiResponse.success(essentiaService.getBooksByLifeWheelArea(lifeWheelAreaId)));
  }

  @GetMapping("/books/top-rated")
  @Operation(
      summary = "Get top rated books",
      description = "Retrieve books ordered by highest rating")
  public ResponseEntity<ApiResponse<List<EssentiaBookDto>>> getTopRatedBooks() {
    return ResponseEntity.ok(ApiResponse.success(essentiaService.getTopRatedBooks()));
  }

  @GetMapping("/books/popular")
  @Operation(
      summary = "Get popular books",
      description = "Retrieve books ordered by completion count")
  public ResponseEntity<ApiResponse<List<EssentiaBookDto>>> getPopularBooks() {
    return ResponseEntity.ok(ApiResponse.success(essentiaService.getPopularBooks()));
  }

  @GetMapping("/categories")
  @Operation(summary = "Get all categories", description = "Retrieve all available book categories")
  public ResponseEntity<ApiResponse<List<String>>> getAllCategories() {
    return ResponseEntity.ok(ApiResponse.success(essentiaService.getAllCategories()));
  }

  // Authenticated endpoints for user progress
  @GetMapping("/progress")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(
      summary = "Get user progress",
      description = "Retrieve all reading progress for the current user")
  public ResponseEntity<ApiResponse<List<EssentiaUserProgressDto>>> getUserProgress(@CurrentUser UUID userId) {
    return ResponseEntity.ok(ApiResponse.success(essentiaService.getUserProgress(userId)));
  }

  @GetMapping("/progress/{bookId}")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(
      summary = "Get progress for book",
      description = "Retrieve reading progress for a specific book")
  public ResponseEntity<ApiResponse<EssentiaUserProgressDto>> getProgressForBook(
      @CurrentUser UUID userId, @PathVariable String bookId) {
    return ResponseEntity.ok(ApiResponse.success(essentiaService.getUserProgressForBook(userId, bookId)));
  }

  @GetMapping("/progress/completed")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(
      summary = "Get completed books",
      description = "Retrieve all books completed by the current user")
  public ResponseEntity<ApiResponse<List<EssentiaUserProgressDto>>> getCompletedBooks(@CurrentUser UUID userId) {
    return ResponseEntity.ok(ApiResponse.success(essentiaService.getCompletedBooks(userId)));
  }

  @GetMapping("/progress/favorites")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(
      summary = "Get favorite books",
      description = "Retrieve all favorited books for the current user")
  public ResponseEntity<ApiResponse<List<EssentiaUserProgressDto>>> getFavoriteBooks(@CurrentUser UUID userId) {
    return ResponseEntity.ok(ApiResponse.success(essentiaService.getFavoriteBooks(userId)));
  }

  @GetMapping("/progress/in-progress")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(
      summary = "Get in-progress books",
      description = "Retrieve all books currently being read by the user")
  public ResponseEntity<ApiResponse<List<EssentiaUserProgressDto>>> getInProgressBooks(@CurrentUser UUID userId) {
    return ResponseEntity.ok(ApiResponse.success(essentiaService.getInProgressBooks(userId)));
  }

  @PostMapping("/books/{bookId}/start")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(
      summary = "Start reading a book",
      description = "Begin reading a book and create progress entry")
  public ResponseEntity<ApiResponse<EssentiaUserProgressDto>> startBook(
      @CurrentUser UUID userId, @PathVariable String bookId) {
    return ResponseEntity.ok(ApiResponse.success(essentiaService.startBook(userId, bookId)));
  }

  @PutMapping("/books/{bookId}/progress")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(
      summary = "Update reading progress",
      description = "Update the current card index for a book")
  public ResponseEntity<ApiResponse<EssentiaUserProgressDto>> updateProgress(
      @CurrentUser UUID userId,
      @PathVariable String bookId,
      @RequestParam int cardIndex) {
    return ResponseEntity.ok(ApiResponse.success(essentiaService.updateProgress(userId, bookId, cardIndex)));
  }

  @PostMapping("/books/{bookId}/toggle-favorite")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(
      summary = "Toggle favorite status",
      description = "Toggle the favorite status of a book")
  public ResponseEntity<ApiResponse<EssentiaUserProgressDto>> toggleFavorite(
      @CurrentUser UUID userId, @PathVariable String bookId) {
    return ResponseEntity.ok(ApiResponse.success(essentiaService.toggleFavorite(userId, bookId)));
  }
}
