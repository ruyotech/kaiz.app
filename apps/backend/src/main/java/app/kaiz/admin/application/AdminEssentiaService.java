package app.kaiz.admin.application;

import app.kaiz.admin.application.dto.AdminEssentiaDtos.*;
import app.kaiz.essentia.domain.EssentiaBook;
import app.kaiz.essentia.domain.EssentiaCard;
import app.kaiz.essentia.infrastructure.EssentiaBookRepository;
import app.kaiz.essentia.infrastructure.EssentiaCardRepository;
import app.kaiz.life_wheel.domain.LifeWheelArea;
import app.kaiz.life_wheel.infrastructure.LifeWheelAreaRepository;
import app.kaiz.shared.exception.BadRequestException;
import app.kaiz.shared.exception.ResourceNotFoundException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class AdminEssentiaService {

  private final EssentiaBookRepository bookRepository;
  private final EssentiaCardRepository cardRepository;
  private final LifeWheelAreaRepository lifeWheelAreaRepository;

  // ============ Book CRUD ============

  public List<BookResponse> getAllBooks() {
    log.debug("Admin: fetching all books (including unpublished)");
    return bookRepository.findAll().stream().map(this::toBookResponse).toList();
  }

  public List<BookResponse> getBooksByLifeWheelArea(String lifeWheelAreaId) {
    log.debug("Admin: fetching books for lifeWheelAreaId={}", lifeWheelAreaId);
    return bookRepository.findByLifeWheelAreaId(lifeWheelAreaId).stream()
        .map(this::toBookResponse)
        .toList();
  }

  public BookResponse getBookById(String id) {
    log.debug("Admin: fetching book id={}", id);
    EssentiaBook book =
        bookRepository
            .findById(UUID.fromString(id))
            .orElseThrow(() -> new ResourceNotFoundException("Book", id));
    return toBookResponse(book);
  }

  @Transactional
  @Caching(
      evict = {
        @CacheEvict(value = "essentiaBooks", allEntries = true),
        @CacheEvict(value = "essentiaCategories", allEntries = true)
      })
  public BookResponse createBook(CreateBookRequest request) {
    log.info("Admin: creating book title={}", request.title());

    LifeWheelArea area =
        lifeWheelAreaRepository
            .findById(request.lifeWheelAreaId())
            .orElseThrow(
                () -> new ResourceNotFoundException("LifeWheelArea", request.lifeWheelAreaId()));

    EssentiaBook book =
        EssentiaBook.builder()
            .title(request.title())
            .author(request.author())
            .lifeWheelArea(area)
            .category(request.category())
            .duration(request.duration())
            .difficulty(request.difficulty())
            .tags(request.tags() != null ? request.tags() : List.of())
            .description(request.description())
            .summaryText(request.summaryText())
            .coreMethodology(request.coreMethodology())
            .appApplication(request.appApplication())
            .coverImageUrl(request.coverImageUrl())
            .isbn(request.isbn())
            .isFeatured(request.isFeatured() != null ? request.isFeatured() : false)
            .isPublished(request.isPublished() != null ? request.isPublished() : true)
            .keyTakeaways(request.keyTakeaways() != null ? request.keyTakeaways() : List.of())
            .publicationYear(request.publicationYear())
            .rating(request.rating() != null ? request.rating() : java.math.BigDecimal.ZERO)
            .completionCount(0)
            .cardCount(0)
            .build();

    EssentiaBook savedBook = bookRepository.save(book);

    // Create cards if provided
    if (request.cards() != null && !request.cards().isEmpty()) {
      List<EssentiaCard> cards = new ArrayList<>();
      for (CreateCardRequest cardReq : request.cards()) {
        EssentiaCard card =
            EssentiaCard.builder()
                .book(savedBook)
                .type(cardReq.type())
                .sortOrder(cardReq.sortOrder())
                .title(cardReq.title())
                .text(cardReq.text())
                .imageUrl(cardReq.imageUrl())
                .build();
        cards.add(card);
      }
      cardRepository.saveAll(cards);
      savedBook.setCardCount(cards.size());
      savedBook = bookRepository.save(savedBook);
    }

    log.info("Admin: book created id={}, title={}", savedBook.getId(), savedBook.getTitle());
    return toBookResponse(savedBook);
  }

  @Transactional
  @Caching(
      evict = {
        @CacheEvict(value = "essentiaBooks", allEntries = true),
        @CacheEvict(value = "essentiaCategories", allEntries = true)
      })
  public BookResponse updateBook(String id, UpdateBookRequest request) {
    log.info("Admin: updating book id={}", id);

    EssentiaBook book =
        bookRepository
            .findById(UUID.fromString(id))
            .orElseThrow(() -> new ResourceNotFoundException("Book", id));

    if (request.title() != null) book.setTitle(request.title());
    if (request.author() != null) book.setAuthor(request.author());
    if (request.lifeWheelAreaId() != null) {
      LifeWheelArea area =
          lifeWheelAreaRepository
              .findById(request.lifeWheelAreaId())
              .orElseThrow(
                  () -> new ResourceNotFoundException("LifeWheelArea", request.lifeWheelAreaId()));
      book.setLifeWheelArea(area);
    }
    if (request.category() != null) book.setCategory(request.category());
    if (request.duration() != null) book.setDuration(request.duration());
    if (request.difficulty() != null) book.setDifficulty(request.difficulty());
    if (request.tags() != null) book.setTags(request.tags());
    if (request.description() != null) book.setDescription(request.description());
    if (request.summaryText() != null) book.setSummaryText(request.summaryText());
    if (request.coreMethodology() != null) book.setCoreMethodology(request.coreMethodology());
    if (request.appApplication() != null) book.setAppApplication(request.appApplication());
    if (request.coverImageUrl() != null) book.setCoverImageUrl(request.coverImageUrl());
    if (request.isbn() != null) book.setIsbn(request.isbn());
    if (request.isFeatured() != null) book.setIsFeatured(request.isFeatured());
    if (request.isPublished() != null) book.setIsPublished(request.isPublished());
    if (request.keyTakeaways() != null) book.setKeyTakeaways(request.keyTakeaways());
    if (request.publicationYear() != null) book.setPublicationYear(request.publicationYear());
    if (request.rating() != null) book.setRating(request.rating());

    EssentiaBook savedBook = bookRepository.save(book);
    log.info("Admin: book updated id={}", savedBook.getId());
    return toBookResponse(savedBook);
  }

  @Transactional
  @Caching(
      evict = {
        @CacheEvict(value = "essentiaBooks", allEntries = true),
        @CacheEvict(value = "essentiaCategories", allEntries = true)
      })
  public void deleteBook(String id) {
    log.info("Admin: deleting book id={}", id);
    EssentiaBook book =
        bookRepository
            .findById(UUID.fromString(id))
            .orElseThrow(() -> new ResourceNotFoundException("Book", id));
    bookRepository.delete(book);
    log.info("Admin: book deleted id={}", id);
  }

  // ============ Card CRUD ============

  @Transactional
  @CacheEvict(value = "essentiaBooks", allEntries = true)
  public CardResponse addCardToBook(String bookId, CreateCardRequest request) {
    log.info("Admin: adding card to book={}, type={}", bookId, request.type());

    EssentiaBook book =
        bookRepository
            .findById(UUID.fromString(bookId))
            .orElseThrow(() -> new ResourceNotFoundException("Book", bookId));

    EssentiaCard card =
        EssentiaCard.builder()
            .book(book)
            .type(request.type())
            .sortOrder(request.sortOrder())
            .title(request.title())
            .text(request.text())
            .imageUrl(request.imageUrl())
            .build();

    EssentiaCard savedCard = cardRepository.save(card);
    book.setCardCount(book.getCardCount() + 1);
    bookRepository.save(book);

    log.info("Admin: card added id={}, bookId={}", savedCard.getId(), bookId);
    return toCardResponse(savedCard);
  }

  @Transactional
  @CacheEvict(value = "essentiaBooks", allEntries = true)
  public CardResponse updateCard(String cardId, UpdateCardRequest request) {
    log.info("Admin: updating card id={}", cardId);

    EssentiaCard card =
        cardRepository
            .findById(UUID.fromString(cardId))
            .orElseThrow(() -> new ResourceNotFoundException("Card", cardId));

    if (request.type() != null) card.setType(request.type());
    if (request.sortOrder() != null) card.setSortOrder(request.sortOrder());
    if (request.title() != null) card.setTitle(request.title());
    if (request.text() != null) card.setText(request.text());
    if (request.imageUrl() != null) card.setImageUrl(request.imageUrl());

    EssentiaCard savedCard = cardRepository.save(card);
    log.info("Admin: card updated id={}", savedCard.getId());
    return toCardResponse(savedCard);
  }

  @Transactional
  @CacheEvict(value = "essentiaBooks", allEntries = true)
  public void deleteCard(String cardId) {
    log.info("Admin: deleting card id={}", cardId);

    EssentiaCard card =
        cardRepository
            .findById(UUID.fromString(cardId))
            .orElseThrow(() -> new ResourceNotFoundException("Card", cardId));

    EssentiaBook book = card.getBook();
    cardRepository.delete(card);
    book.setCardCount(Math.max(0, book.getCardCount() - 1));
    bookRepository.save(book);

    log.info("Admin: card deleted id={}, bookId={}", cardId, book.getId());
  }

  // ============ Bulk Operations ============

  @Transactional
  @Caching(
      evict = {
        @CacheEvict(value = "essentiaBooks", allEntries = true),
        @CacheEvict(value = "essentiaCategories", allEntries = true)
      })
  public List<BookResponse> bulkImportBooks(BulkImportRequest request) {
    log.info("Admin: bulk importing {} books", request.books().size());

    if (request.books().size() > 50) {
      throw new BadRequestException("Maximum 50 books per bulk import");
    }

    List<BookResponse> results = new ArrayList<>();
    for (CreateBookRequest bookReq : request.books()) {
      results.add(createBook(bookReq));
    }

    log.info("Admin: bulk import completed, {} books created", results.size());
    return results;
  }

  @Transactional
  @Caching(
      evict = {
        @CacheEvict(value = "essentiaBooks", allEntries = true),
        @CacheEvict(value = "essentiaCategories", allEntries = true)
      })
  public List<BookResponse> bulkUpdateBooks(BulkUpdateRequest request) {
    log.info("Admin: bulk updating {} books", request.items().size());

    List<BookResponse> results = new ArrayList<>();
    for (BulkUpdateItem item : request.items()) {
      EssentiaBook book =
          bookRepository
              .findById(UUID.fromString(item.bookId()))
              .orElseThrow(() -> new ResourceNotFoundException("Book", item.bookId()));

      if (item.isFeatured() != null) book.setIsFeatured(item.isFeatured());
      if (item.isPublished() != null) book.setIsPublished(item.isPublished());
      if (item.category() != null) book.setCategory(item.category());
      if (item.difficulty() != null) book.setDifficulty(item.difficulty());

      results.add(toBookResponse(bookRepository.save(book)));
    }

    log.info("Admin: bulk update completed, {} books updated", results.size());
    return results;
  }

  // ============ Stats ============

  public BookStatsResponse getBookStats() {
    log.debug("Admin: fetching book stats");

    List<EssentiaBook> allBooks = bookRepository.findAll();
    long totalBooks = allBooks.size();
    long publishedBooks =
        allBooks.stream().filter(b -> Boolean.TRUE.equals(b.getIsPublished())).count();
    long featuredBooks =
        allBooks.stream().filter(b -> Boolean.TRUE.equals(b.getIsFeatured())).count();
    long totalCards = allBooks.stream().mapToInt(EssentiaBook::getCardCount).sum();

    List<CategoryCount> booksByCategory =
        allBooks.stream()
            .filter(b -> b.getCategory() != null)
            .collect(
                java.util.stream.Collectors.groupingBy(
                    EssentiaBook::getCategory, java.util.stream.Collectors.counting()))
            .entrySet()
            .stream()
            .map(e -> new CategoryCount(e.getKey(), e.getValue()))
            .sorted((a, b) -> Long.compare(b.count(), a.count()))
            .toList();

    List<AreaCount> booksByArea =
        allBooks.stream()
            .filter(b -> b.getLifeWheelArea() != null)
            .collect(
                java.util.stream.Collectors.groupingBy(
                    b -> b.getLifeWheelArea().getId(), java.util.stream.Collectors.counting()))
            .entrySet()
            .stream()
            .map(e -> new AreaCount(e.getKey(), e.getValue()))
            .sorted((a, b) -> a.lifeWheelAreaId().compareTo(b.lifeWheelAreaId()))
            .toList();

    return new BookStatsResponse(
        totalBooks, publishedBooks, featuredBooks, totalCards, booksByCategory, booksByArea);
  }

  // ============ Mappers ============

  private BookResponse toBookResponse(EssentiaBook book) {
    List<CardResponse> cards =
        book.getCards() != null
            ? book.getCards().stream()
                .map(this::toCardResponse)
                .sorted((a, b) -> Integer.compare(a.sortOrder(), b.sortOrder()))
                .toList()
            : List.of();

    return new BookResponse(
        book.getId().toString(),
        book.getTitle(),
        book.getAuthor(),
        book.getLifeWheelArea() != null ? book.getLifeWheelArea().getId() : null,
        book.getCategory(),
        book.getDuration(),
        book.getCardCount(),
        book.getDifficulty(),
        book.getTags(),
        book.getDescription(),
        book.getSummaryText(),
        book.getCoreMethodology(),
        book.getAppApplication(),
        book.getCoverImageUrl(),
        book.getIsbn(),
        book.getIsFeatured(),
        book.getIsPublished(),
        book.getKeyTakeaways(),
        book.getPublicationYear(),
        book.getRating(),
        book.getCompletionCount(),
        book.getCreatedAt(),
        book.getUpdatedAt(),
        cards);
  }

  private CardResponse toCardResponse(EssentiaCard card) {
    return new CardResponse(
        card.getId().toString(),
        card.getType(),
        card.getSortOrder(),
        card.getTitle(),
        card.getText(),
        card.getImageUrl());
  }
}
