package com.kaiz.lifeos.essentia.api;

import com.kaiz.lifeos.essentia.application.EssentiaService;
import com.kaiz.lifeos.essentia.application.dto.EssentiaBookDto;
import com.kaiz.lifeos.essentia.application.dto.EssentiaUserProgressDto;
import com.kaiz.lifeos.essentia.domain.Difficulty;
import com.kaiz.lifeos.shared.security.CurrentUser;
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
  public ResponseEntity<List<EssentiaBookDto>> getAllBooks() {
    return ResponseEntity.ok(essentiaService.getAllBooks());
  }

  @GetMapping("/books/{id}")
  @Operation(
      summary = "Get book by ID",
      description = "Retrieve a specific book with all its cards")
  public ResponseEntity<EssentiaBookDto> getBookById(@PathVariable String id) {
    return ResponseEntity.ok(essentiaService.getBookById(id));
  }

  @GetMapping("/books/category/{category}")
  @Operation(summary = "Get books by category", description = "Retrieve books filtered by category")
  public ResponseEntity<List<EssentiaBookDto>> getBooksByCategory(@PathVariable String category) {
    return ResponseEntity.ok(essentiaService.getBooksByCategory(category));
  }

  @GetMapping("/books/difficulty/{difficulty}")
  @Operation(
      summary = "Get books by difficulty",
      description = "Retrieve books filtered by difficulty level")
  public ResponseEntity<List<EssentiaBookDto>> getBooksByDifficulty(
      @PathVariable Difficulty difficulty) {
    return ResponseEntity.ok(essentiaService.getBooksByDifficulty(difficulty));
  }

  @GetMapping("/books/life-wheel/{lifeWheelAreaId}")
  @Operation(
      summary = "Get books by life wheel area",
      description = "Retrieve books for a specific life wheel dimension")
  public ResponseEntity<List<EssentiaBookDto>> getBooksByLifeWheelArea(
      @PathVariable String lifeWheelAreaId) {
    return ResponseEntity.ok(essentiaService.getBooksByLifeWheelArea(lifeWheelAreaId));
  }

  @GetMapping("/books/top-rated")
  @Operation(
      summary = "Get top rated books",
      description = "Retrieve books ordered by highest rating")
  public ResponseEntity<List<EssentiaBookDto>> getTopRatedBooks() {
    return ResponseEntity.ok(essentiaService.getTopRatedBooks());
  }

  @GetMapping("/books/popular")
  @Operation(
      summary = "Get popular books",
      description = "Retrieve books ordered by completion count")
  public ResponseEntity<List<EssentiaBookDto>> getPopularBooks() {
    return ResponseEntity.ok(essentiaService.getPopularBooks());
  }

  @GetMapping("/categories")
  @Operation(summary = "Get all categories", description = "Retrieve all available book categories")
  public ResponseEntity<List<String>> getAllCategories() {
    return ResponseEntity.ok(essentiaService.getAllCategories());
  }

  // Authenticated endpoints for user progress
  @GetMapping("/progress")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(
      summary = "Get user progress",
      description = "Retrieve all reading progress for the current user")
  public ResponseEntity<List<EssentiaUserProgressDto>> getUserProgress(@CurrentUser UUID userId) {
    return ResponseEntity.ok(essentiaService.getUserProgress(userId));
  }

  @GetMapping("/progress/{bookId}")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(
      summary = "Get progress for book",
      description = "Retrieve reading progress for a specific book")
  public ResponseEntity<EssentiaUserProgressDto> getProgressForBook(
      @CurrentUser UUID userId, @PathVariable String bookId) {
    return ResponseEntity.ok(essentiaService.getUserProgressForBook(userId, bookId));
  }

  @GetMapping("/progress/completed")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(
      summary = "Get completed books",
      description = "Retrieve all books completed by the current user")
  public ResponseEntity<List<EssentiaUserProgressDto>> getCompletedBooks(@CurrentUser UUID userId) {
    return ResponseEntity.ok(essentiaService.getCompletedBooks(userId));
  }

  @GetMapping("/progress/favorites")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(
      summary = "Get favorite books",
      description = "Retrieve all favorited books for the current user")
  public ResponseEntity<List<EssentiaUserProgressDto>> getFavoriteBooks(@CurrentUser UUID userId) {
    return ResponseEntity.ok(essentiaService.getFavoriteBooks(userId));
  }

  @GetMapping("/progress/in-progress")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(
      summary = "Get in-progress books",
      description = "Retrieve all books currently being read by the user")
  public ResponseEntity<List<EssentiaUserProgressDto>> getInProgressBooks(@CurrentUser UUID userId) {
    return ResponseEntity.ok(essentiaService.getInProgressBooks(userId));
  }

  @PostMapping("/books/{bookId}/start")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(
      summary = "Start reading a book",
      description = "Begin reading a book and create progress entry")
  public ResponseEntity<EssentiaUserProgressDto> startBook(
      @CurrentUser UUID userId, @PathVariable String bookId) {
    return ResponseEntity.ok(essentiaService.startBook(userId, bookId));
  }

  @PutMapping("/books/{bookId}/progress")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(
      summary = "Update reading progress",
      description = "Update the current card index for a book")
  public ResponseEntity<EssentiaUserProgressDto> updateProgress(
      @CurrentUser UUID userId,
      @PathVariable String bookId,
      @RequestParam int cardIndex) {
    return ResponseEntity.ok(essentiaService.updateProgress(userId, bookId, cardIndex));
  }

  @PostMapping("/books/{bookId}/toggle-favorite")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(
      summary = "Toggle favorite status",
      description = "Toggle the favorite status of a book")
  public ResponseEntity<EssentiaUserProgressDto> toggleFavorite(
      @CurrentUser UUID userId, @PathVariable String bookId) {
    return ResponseEntity.ok(essentiaService.toggleFavorite(userId, bookId));
  }
}
