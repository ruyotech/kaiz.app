package app.kaiz.admin.api;

import app.kaiz.admin.application.AdminEssentiaService;
import app.kaiz.admin.application.dto.AdminEssentiaDtos.*;
import app.kaiz.shared.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/essentia")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Admin - Essentia", description = "Admin endpoints for managing Essentia books & cards")
public class AdminEssentiaController {

  private final AdminEssentiaService adminEssentiaService;

  // ============ Book Endpoints ============

  @GetMapping("/books")
  @Operation(
      summary = "Get all books (admin)",
      description = "Retrieve all books including unpublished ones")
  public ResponseEntity<ApiResponse<List<BookResponse>>> getAllBooks() {
    return ResponseEntity.ok(ApiResponse.success(adminEssentiaService.getAllBooks()));
  }

  @GetMapping("/books/life-wheel/{lifeWheelAreaId}")
  @Operation(
      summary = "Get books by life wheel area (admin)",
      description = "Retrieve all books for a specific life wheel area")
  public ResponseEntity<ApiResponse<List<BookResponse>>> getBooksByLifeWheelArea(
      @PathVariable String lifeWheelAreaId) {
    return ResponseEntity.ok(
        ApiResponse.success(adminEssentiaService.getBooksByLifeWheelArea(lifeWheelAreaId)));
  }

  @GetMapping("/books/{id}")
  @Operation(
      summary = "Get book by ID (admin)",
      description = "Retrieve a specific book with all cards")
  public ResponseEntity<ApiResponse<BookResponse>> getBookById(@PathVariable String id) {
    return ResponseEntity.ok(ApiResponse.success(adminEssentiaService.getBookById(id)));
  }

  @PostMapping("/books")
  @Operation(summary = "Create a book", description = "Create a new Essentia book with cards")
  public ResponseEntity<ApiResponse<BookResponse>> createBook(
      @Valid @RequestBody CreateBookRequest request) {
    return ResponseEntity.ok(ApiResponse.success(adminEssentiaService.createBook(request)));
  }

  @PutMapping("/books/{id}")
  @Operation(
      summary = "Update a book",
      description = "Partially update an existing book (null fields are ignored)")
  public ResponseEntity<ApiResponse<BookResponse>> updateBook(
      @PathVariable String id, @Valid @RequestBody UpdateBookRequest request) {
    return ResponseEntity.ok(ApiResponse.success(adminEssentiaService.updateBook(id, request)));
  }

  @DeleteMapping("/books/{id}")
  @Operation(summary = "Delete a book", description = "Delete a book and all its cards")
  public ResponseEntity<ApiResponse<Void>> deleteBook(@PathVariable String id) {
    adminEssentiaService.deleteBook(id);
    return ResponseEntity.ok(ApiResponse.success(null));
  }

  // ============ Card Endpoints ============

  @PostMapping("/books/{bookId}/cards")
  @Operation(
      summary = "Add a card to a book",
      description = "Create a new card for an existing book")
  public ResponseEntity<ApiResponse<CardResponse>> addCard(
      @PathVariable String bookId, @Valid @RequestBody CreateCardRequest request) {
    return ResponseEntity.ok(
        ApiResponse.success(adminEssentiaService.addCardToBook(bookId, request)));
  }

  @PutMapping("/cards/{cardId}")
  @Operation(
      summary = "Update a card",
      description = "Partially update an existing card (null fields are ignored)")
  public ResponseEntity<ApiResponse<CardResponse>> updateCard(
      @PathVariable String cardId, @Valid @RequestBody UpdateCardRequest request) {
    return ResponseEntity.ok(ApiResponse.success(adminEssentiaService.updateCard(cardId, request)));
  }

  @DeleteMapping("/cards/{cardId}")
  @Operation(summary = "Delete a card", description = "Delete a card from a book")
  public ResponseEntity<ApiResponse<Void>> deleteCard(@PathVariable String cardId) {
    adminEssentiaService.deleteCard(cardId);
    return ResponseEntity.ok(ApiResponse.success(null));
  }

  // ============ Bulk Operations ============

  @PostMapping("/books/bulk-import")
  @Operation(
      summary = "Bulk import books",
      description = "Import multiple books at once (max 50 per request)")
  public ResponseEntity<ApiResponse<List<BookResponse>>> bulkImportBooks(
      @Valid @RequestBody BulkImportRequest request) {
    return ResponseEntity.ok(ApiResponse.success(adminEssentiaService.bulkImportBooks(request)));
  }

  @PutMapping("/books/bulk-update")
  @Operation(
      summary = "Bulk update books",
      description =
          "Update multiple books at once (featured, published, category, difficulty fields)")
  public ResponseEntity<ApiResponse<List<BookResponse>>> bulkUpdateBooks(
      @Valid @RequestBody BulkUpdateRequest request) {
    return ResponseEntity.ok(ApiResponse.success(adminEssentiaService.bulkUpdateBooks(request)));
  }

  // ============ Stats ============

  @GetMapping("/stats")
  @Operation(
      summary = "Get book stats",
      description = "Retrieve statistics about books, categories, and life wheel areas")
  public ResponseEntity<ApiResponse<BookStatsResponse>> getBookStats() {
    return ResponseEntity.ok(ApiResponse.success(adminEssentiaService.getBookStats()));
  }
}
