package app.kaiz.admin.api;

import app.kaiz.admin.application.KnowledgeHubService;
import app.kaiz.admin.domain.KnowledgeCategory;
import app.kaiz.admin.domain.KnowledgeItem;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/knowledge")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminKnowledgeHubController {

  private final KnowledgeHubService knowledgeHubService;

  // ============ Categories ============

  @GetMapping("/categories")
  public ResponseEntity<Map<String, Object>> getAllCategories() {
    List<KnowledgeCategory> categories = knowledgeHubService.getAllCategories();
    return ResponseEntity.ok(
        Map.of("success", true, "data", categories, "timestamp", System.currentTimeMillis()));
  }

  @GetMapping("/categories/{id}")
  public ResponseEntity<Map<String, Object>> getCategoryById(@PathVariable UUID id) {
    return knowledgeHubService
        .getCategoryById(id)
        .map(
            category ->
                ResponseEntity.ok(
                    Map.of(
                        "success",
                        true,
                        "data",
                        category,
                        "timestamp",
                        System.currentTimeMillis())))
        .orElse(ResponseEntity.notFound().build());
  }

  @PostMapping("/categories")
  public ResponseEntity<Map<String, Object>> createCategory(
      @RequestBody KnowledgeCategory category) {
    KnowledgeCategory created = knowledgeHubService.createCategory(category);
    return ResponseEntity.ok(
        Map.of("success", true, "data", created, "timestamp", System.currentTimeMillis()));
  }

  @PutMapping("/categories/{id}")
  public ResponseEntity<Map<String, Object>> updateCategory(
      @PathVariable UUID id, @RequestBody KnowledgeCategory category) {
    KnowledgeCategory updated = knowledgeHubService.updateCategory(id, category);
    return ResponseEntity.ok(
        Map.of("success", true, "data", updated, "timestamp", System.currentTimeMillis()));
  }

  @DeleteMapping("/categories/{id}")
  public ResponseEntity<Map<String, Object>> deleteCategory(@PathVariable UUID id) {
    knowledgeHubService.deleteCategory(id);
    return ResponseEntity.ok(
        Map.of(
            "success",
            true,
            "message",
            "Category deleted",
            "timestamp",
            System.currentTimeMillis()));
  }

  // ============ Items ============

  @GetMapping("/items")
  public ResponseEntity<Map<String, Object>> getAllItems(
      @RequestParam(required = false) String search,
      @RequestParam(required = false) UUID categoryId) {
    List<KnowledgeItem> items;
    if (search != null && !search.isEmpty()) {
      items = knowledgeHubService.searchAllItems(search);
    } else if (categoryId != null) {
      items = knowledgeHubService.getItemsByCategory(categoryId);
    } else {
      items = knowledgeHubService.getAllItems();
    }
    return ResponseEntity.ok(
        Map.of("success", true, "data", items, "timestamp", System.currentTimeMillis()));
  }

  @GetMapping("/items/{id}")
  public ResponseEntity<Map<String, Object>> getItemById(@PathVariable UUID id) {
    return knowledgeHubService
        .getItemById(id)
        .map(
            item ->
                ResponseEntity.ok(
                    Map.of("success", true, "data", item, "timestamp", System.currentTimeMillis())))
        .orElse(ResponseEntity.notFound().build());
  }

  @PostMapping("/items")
  public ResponseEntity<Map<String, Object>> createItem(@RequestBody KnowledgeItem item) {
    KnowledgeItem created = knowledgeHubService.createItem(item);
    return ResponseEntity.ok(
        Map.of("success", true, "data", created, "timestamp", System.currentTimeMillis()));
  }

  @PutMapping("/items/{id}")
  public ResponseEntity<Map<String, Object>> updateItem(
      @PathVariable UUID id, @RequestBody KnowledgeItem item) {
    KnowledgeItem updated = knowledgeHubService.updateItem(id, item);
    return ResponseEntity.ok(
        Map.of("success", true, "data", updated, "timestamp", System.currentTimeMillis()));
  }

  @DeleteMapping("/items/{id}")
  public ResponseEntity<Map<String, Object>> deleteItem(@PathVariable UUID id) {
    knowledgeHubService.deleteItem(id);
    return ResponseEntity.ok(
        Map.of(
            "success", true, "message", "Item deleted", "timestamp", System.currentTimeMillis()));
  }

  @PutMapping("/items/{id}/status")
  public ResponseEntity<Map<String, Object>> updateItemStatus(
      @PathVariable UUID id, @RequestBody Map<String, String> body) {
    String status = body.get("status");
    knowledgeHubService.updateItemStatus(id, status);
    return ResponseEntity.ok(
        Map.of(
            "success",
            true,
            "message",
            "Status updated to " + status,
            "timestamp",
            System.currentTimeMillis()));
  }

  @PostMapping("/items/bulk")
  public ResponseEntity<Map<String, Object>> bulkImportItems(
      @RequestBody List<KnowledgeItem> items) {
    List<KnowledgeItem> imported = knowledgeHubService.bulkImportItems(items);
    return ResponseEntity.ok(
        Map.of(
            "success",
            true,
            "data",
            imported,
            "count",
            imported.size(),
            "timestamp",
            System.currentTimeMillis()));
  }
}
