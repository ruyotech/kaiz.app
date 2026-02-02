package app.kaiz.admin.api;

import app.kaiz.admin.application.KnowledgeHubService;
import app.kaiz.admin.domain.KnowledgeCategory;
import app.kaiz.admin.domain.KnowledgeItem;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/public/knowledge")
@RequiredArgsConstructor
public class PublicKnowledgeHubController {

  private final KnowledgeHubService knowledgeHubService;

  @GetMapping("/categories")
  public ResponseEntity<Map<String, Object>> getActiveCategories() {
    List<KnowledgeCategory> categories = knowledgeHubService.getActiveCategories();
    return ResponseEntity.ok(
        Map.of("success", true, "data", categories, "timestamp", System.currentTimeMillis()));
  }

  @GetMapping("/categories/{slug}")
  public ResponseEntity<Map<String, Object>> getCategoryBySlug(@PathVariable String slug) {
    return knowledgeHubService
        .getCategoryBySlug(slug)
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

  @GetMapping("/items")
  public ResponseEntity<Map<String, Object>> getPublishedItems(
      @RequestParam(required = false) String search,
      @RequestParam(required = false) UUID categoryId) {
    List<KnowledgeItem> items;
    if (search != null && !search.isEmpty()) {
      items = knowledgeHubService.searchItems(search);
    } else if (categoryId != null) {
      items = knowledgeHubService.getPublishedItemsByCategory(categoryId);
    } else {
      items = knowledgeHubService.getPublishedItems();
    }
    return ResponseEntity.ok(
        Map.of("success", true, "data", items, "timestamp", System.currentTimeMillis()));
  }

  @GetMapping("/items/featured")
  public ResponseEntity<Map<String, Object>> getFeaturedItems() {
    List<KnowledgeItem> items = knowledgeHubService.getFeaturedItems();
    return ResponseEntity.ok(
        Map.of("success", true, "data", items, "timestamp", System.currentTimeMillis()));
  }

  @GetMapping("/items/{slug}")
  public ResponseEntity<Map<String, Object>> getItemBySlug(@PathVariable String slug) {
    return knowledgeHubService
        .getItemBySlug(slug)
        .filter(item -> "PUBLISHED".equals(item.getStatus()))
        .map(
            item ->
                ResponseEntity.ok(
                    Map.of("success", true, "data", item, "timestamp", System.currentTimeMillis())))
        .orElse(ResponseEntity.notFound().build());
  }

  @PostMapping("/items/{id}/view")
  public ResponseEntity<Map<String, Object>> incrementViewCount(@PathVariable UUID id) {
    knowledgeHubService.incrementViewCount(id);
    return ResponseEntity.ok(
        Map.of(
            "success",
            true,
            "message",
            "View count incremented",
            "timestamp",
            System.currentTimeMillis()));
  }

  @PostMapping("/items/{id}/helpful")
  public ResponseEntity<Map<String, Object>> incrementHelpfulCount(@PathVariable UUID id) {
    knowledgeHubService.incrementHelpfulCount(id);
    return ResponseEntity.ok(
        Map.of(
            "success",
            true,
            "message",
            "Helpful count incremented",
            "timestamp",
            System.currentTimeMillis()));
  }
}
