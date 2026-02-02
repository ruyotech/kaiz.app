package app.kaiz.admin.application;

import app.kaiz.admin.domain.KnowledgeCategory;
import app.kaiz.admin.domain.KnowledgeItem;
import app.kaiz.admin.repository.KnowledgeCategoryRepository;
import app.kaiz.admin.repository.KnowledgeItemRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class KnowledgeHubService {

  private final KnowledgeCategoryRepository categoryRepository;
  private final KnowledgeItemRepository itemRepository;

  // ============ Categories ============

  public List<KnowledgeCategory> getAllCategories() {
    return categoryRepository.findAllByOrderByDisplayOrderAsc();
  }

  public List<KnowledgeCategory> getActiveCategories() {
    return categoryRepository.findAllByStatusOrderByDisplayOrderAsc("ACTIVE");
  }

  public Optional<KnowledgeCategory> getCategoryById(UUID id) {
    return categoryRepository.findById(id);
  }

  public Optional<KnowledgeCategory> getCategoryBySlug(String slug) {
    return categoryRepository.findBySlug(slug);
  }

  @Transactional
  public KnowledgeCategory createCategory(KnowledgeCategory category) {
    return categoryRepository.save(category);
  }

  @Transactional
  public KnowledgeCategory updateCategory(UUID id, KnowledgeCategory updated) {
    return categoryRepository
        .findById(id)
        .map(
            existing -> {
              existing.setName(updated.getName());
              existing.setSlug(updated.getSlug());
              existing.setDescription(updated.getDescription());
              existing.setIcon(updated.getIcon());
              existing.setColor(updated.getColor());
              existing.setDisplayOrder(updated.getDisplayOrder());
              existing.setStatus(updated.getStatus());
              return categoryRepository.save(existing);
            })
        .orElseThrow(() -> new RuntimeException("Category not found: " + id));
  }

  @Transactional
  public void deleteCategory(UUID id) {
    categoryRepository.deleteById(id);
  }

  // ============ Items ============

  public List<KnowledgeItem> getAllItems() {
    List<KnowledgeItem> items = itemRepository.findAll();
    enrichWithCategoryNames(items);
    return items;
  }

  public List<KnowledgeItem> getPublishedItems() {
    List<KnowledgeItem> items = itemRepository.findByStatusOrderByDisplayOrderAsc("PUBLISHED");
    enrichWithCategoryNames(items);
    return items;
  }

  public List<KnowledgeItem> getItemsByCategory(UUID categoryId) {
    List<KnowledgeItem> items = itemRepository.findByCategoryIdOrderByDisplayOrderAsc(categoryId);
    enrichWithCategoryNames(items);
    return items;
  }

  public List<KnowledgeItem> getPublishedItemsByCategory(UUID categoryId) {
    List<KnowledgeItem> items =
        itemRepository.findByCategoryIdAndStatusOrderByDisplayOrderAsc(categoryId, "PUBLISHED");
    enrichWithCategoryNames(items);
    return items;
  }

  public List<KnowledgeItem> getFeaturedItems() {
    List<KnowledgeItem> items = itemRepository.findByFeaturedTrueAndStatus("PUBLISHED");
    enrichWithCategoryNames(items);
    return items;
  }

  public Optional<KnowledgeItem> getItemById(UUID id) {
    Optional<KnowledgeItem> item = itemRepository.findById(id);
    item.ifPresent(i -> enrichWithCategoryName(i));
    return item;
  }

  public Optional<KnowledgeItem> getItemBySlug(String slug) {
    Optional<KnowledgeItem> item = itemRepository.findBySlug(slug);
    item.ifPresent(i -> enrichWithCategoryName(i));
    return item;
  }

  public List<KnowledgeItem> searchItems(String query) {
    List<KnowledgeItem> items = itemRepository.searchByKeywords(query, "PUBLISHED");
    enrichWithCategoryNames(items);
    return items;
  }

  public List<KnowledgeItem> searchAllItems(String query) {
    List<KnowledgeItem> items = itemRepository.searchAll(query);
    enrichWithCategoryNames(items);
    return items;
  }

  @Transactional
  public KnowledgeItem createItem(KnowledgeItem item) {
    KnowledgeItem saved = itemRepository.save(item);
    updateCategoryItemCount(item.getCategoryId());
    enrichWithCategoryName(saved);
    return saved;
  }

  @Transactional
  public KnowledgeItem updateItem(UUID id, KnowledgeItem updated) {
    return itemRepository
        .findById(id)
        .map(
            existing -> {
              UUID oldCategoryId = existing.getCategoryId();
              existing.setCategoryId(updated.getCategoryId());
              existing.setSlug(updated.getSlug());
              existing.setTitle(updated.getTitle());
              existing.setSummary(updated.getSummary());
              existing.setContent(updated.getContent());
              existing.setDifficulty(updated.getDifficulty());
              existing.setReadTimeMinutes(updated.getReadTimeMinutes());
              existing.setTags(updated.getTags());
              existing.setIcon(updated.getIcon());
              existing.setStatus(updated.getStatus());
              existing.setFeatured(updated.getFeatured());
              existing.setDisplayOrder(updated.getDisplayOrder());
              existing.setSearchKeywords(updated.getSearchKeywords());
              existing.setUpdatedBy(updated.getUpdatedBy());
              KnowledgeItem saved = itemRepository.save(existing);
              updateCategoryItemCount(oldCategoryId);
              if (!oldCategoryId.equals(updated.getCategoryId())) {
                updateCategoryItemCount(updated.getCategoryId());
              }
              enrichWithCategoryName(saved);
              return saved;
            })
        .orElseThrow(() -> new RuntimeException("Item not found: " + id));
  }

  @Transactional
  public void deleteItem(UUID id) {
    itemRepository
        .findById(id)
        .ifPresent(
            item -> {
              UUID categoryId = item.getCategoryId();
              itemRepository.deleteById(id);
              updateCategoryItemCount(categoryId);
            });
  }

  @Transactional
  public void updateItemStatus(UUID id, String status) {
    itemRepository
        .findById(id)
        .ifPresent(
            item -> {
              item.setStatus(status);
              itemRepository.save(item);
              updateCategoryItemCount(item.getCategoryId());
            });
  }

  @Transactional
  public void incrementViewCount(UUID id) {
    itemRepository.incrementViewCount(id);
  }

  @Transactional
  public void incrementHelpfulCount(UUID id) {
    itemRepository.incrementHelpfulCount(id);
  }

  @Transactional
  public List<KnowledgeItem> bulkImportItems(List<KnowledgeItem> items) {
    List<KnowledgeItem> saved = itemRepository.saveAll(items);
    saved.forEach(item -> updateCategoryItemCount(item.getCategoryId()));
    enrichWithCategoryNames(saved);
    return saved;
  }

  // ============ Helpers ============

  private void updateCategoryItemCount(UUID categoryId) {
    if (categoryId != null) {
      Long count = itemRepository.countByCategoryIdAndStatus(categoryId, "PUBLISHED");
      categoryRepository.updateItemCount(categoryId, count.intValue());
    }
  }

  private void enrichWithCategoryNames(List<KnowledgeItem> items) {
    items.forEach(this::enrichWithCategoryName);
  }

  private void enrichWithCategoryName(KnowledgeItem item) {
    if (item.getCategoryId() != null) {
      categoryRepository
          .findById(item.getCategoryId())
          .ifPresent(cat -> item.setCategoryName(cat.getName()));
    }
  }
}
