package app.kaiz.essentia.application;

import app.kaiz.essentia.application.dto.EssentiaBookDto;
import app.kaiz.essentia.application.dto.EssentiaUserProgressDto;
import app.kaiz.essentia.domain.Difficulty;
import app.kaiz.essentia.domain.EssentiaBook;
import app.kaiz.essentia.domain.EssentiaUserProgress;
import app.kaiz.essentia.infrastructure.EssentiaBookRepository;
import app.kaiz.essentia.infrastructure.EssentiaUserProgressRepository;
import app.kaiz.identity.domain.User;
import app.kaiz.identity.infrastructure.UserRepository;
import app.kaiz.shared.exception.ResourceNotFoundException;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class EssentiaService {

  private final EssentiaBookRepository bookRepository;
  private final EssentiaUserProgressRepository progressRepository;
  private final UserRepository userRepository;
  private final EssentiaMapper mapper;

  @Cacheable("essentiaBooks")
  public List<EssentiaBookDto> getAllBooks() {
    log.debug("Fetching all published books");
    return bookRepository.findAllPublished().stream().map(mapper::toBookDtoWithoutCards).toList();
  }

  public EssentiaBookDto getBookById(String id) {
    log.debug("Fetching book by id={}", id);
    EssentiaBook book =
        bookRepository
            .findById(UUID.fromString(id))
            .orElseThrow(() -> new ResourceNotFoundException("Book", id));
    return mapper.toBookDto(book);
  }

  public List<EssentiaBookDto> getBooksByCategory(String category) {
    log.debug("Fetching books by category={}", category);
    return bookRepository.findByCategory(category).stream()
        .map(mapper::toBookDtoWithoutCards)
        .toList();
  }

  public List<EssentiaBookDto> getBooksByDifficulty(Difficulty difficulty) {
    log.debug("Fetching books by difficulty={}", difficulty);
    return bookRepository.findByDifficulty(difficulty).stream()
        .map(mapper::toBookDtoWithoutCards)
        .toList();
  }

  public List<EssentiaBookDto> getBooksByLifeWheelArea(String lifeWheelAreaId) {
    log.debug("Fetching published books for lifeWheelAreaId={}", lifeWheelAreaId);
    return bookRepository.findPublishedByLifeWheelAreaId(lifeWheelAreaId).stream()
        .map(mapper::toBookDtoWithoutCards)
        .toList();
  }

  public List<EssentiaBookDto> getFeaturedBooks() {
    log.debug("Fetching featured books");
    return bookRepository.findFeaturedBooks().stream().map(mapper::toBookDtoWithoutCards).toList();
  }

  public List<EssentiaBookDto> getTopRatedBooks() {
    log.debug("Fetching top rated books");
    return bookRepository.findAllOrderByRating().stream()
        .map(mapper::toBookDtoWithoutCards)
        .toList();
  }

  public List<EssentiaBookDto> getPopularBooks() {
    log.debug("Fetching popular books");
    return bookRepository.findAllOrderByPopularity().stream()
        .map(mapper::toBookDtoWithoutCards)
        .toList();
  }

  @Cacheable("essentiaCategories")
  public List<String> getAllCategories() {
    log.debug("Fetching all categories");
    return bookRepository.findAllCategories();
  }

  // User progress methods
  public List<EssentiaUserProgressDto> getUserProgress(UUID userId) {
    log.debug("Fetching user progress for userId={}", userId);
    return progressRepository.findByUserId(userId).stream().map(mapper::toProgressDto).toList();
  }

  public EssentiaUserProgressDto getUserProgressForBook(UUID userId, String bookId) {
    log.debug("Fetching progress for userId={}, bookId={}", userId, bookId);
    EssentiaUserProgress progress =
        progressRepository
            .findByUserIdAndBookId(userId, UUID.fromString(bookId))
            .orElseThrow(
                () -> new ResourceNotFoundException("Progress not found for book: " + bookId));
    return mapper.toProgressDto(progress);
  }

  public List<EssentiaUserProgressDto> getCompletedBooks(UUID userId) {
    return progressRepository.findCompletedByUserId(userId).stream()
        .map(mapper::toProgressDto)
        .toList();
  }

  public List<EssentiaUserProgressDto> getFavoriteBooks(UUID userId) {
    return progressRepository.findFavoritesByUserId(userId).stream()
        .map(mapper::toProgressDto)
        .toList();
  }

  public List<EssentiaUserProgressDto> getInProgressBooks(UUID userId) {
    return progressRepository.findInProgressByUserId(userId).stream()
        .map(mapper::toProgressDto)
        .toList();
  }

  @Transactional
  public EssentiaUserProgressDto startBook(UUID userId, String bookId) {
    log.info("User {} starting book {}", userId, bookId);
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

    EssentiaBook book =
        bookRepository
            .findById(UUID.fromString(bookId))
            .orElseThrow(() -> new ResourceNotFoundException("Book", bookId));

    return progressRepository
        .findByUserIdAndBookId(userId, UUID.fromString(bookId))
        .map(mapper::toProgressDto)
        .orElseGet(
            () -> {
              EssentiaUserProgress progress =
                  EssentiaUserProgress.builder()
                      .user(user)
                      .book(book)
                      .currentCardIndex(0)
                      .isCompleted(false)
                      .isFavorite(false)
                      .build();
              return mapper.toProgressDto(progressRepository.save(progress));
            });
  }

  @Transactional
  @CacheEvict(value = "essentiaBooks", allEntries = true)
  public EssentiaUserProgressDto updateProgress(UUID userId, String bookId, int cardIndex) {
    log.info("Updating progress for userId={}, bookId={}, cardIndex={}", userId, bookId, cardIndex);
    EssentiaUserProgress progress =
        progressRepository
            .findByUserIdAndBookId(userId, UUID.fromString(bookId))
            .orElseThrow(
                () -> new ResourceNotFoundException("Progress not found for book: " + bookId));

    progress.setCurrentCardIndex(cardIndex);

    if (cardIndex >= progress.getBook().getCardCount() - 1) {
      progress.setIsCompleted(true);
      EssentiaBook book = progress.getBook();
      book.setCompletionCount(book.getCompletionCount() + 1);
      bookRepository.save(book);
      log.info("Book {} completed by user {}", bookId, userId);
    }

    return mapper.toProgressDto(progressRepository.save(progress));
  }

  @Transactional
  public EssentiaUserProgressDto toggleFavorite(UUID userId, String bookId) {
    log.info("Toggling favorite for userId={}, bookId={}", userId, bookId);
    EssentiaUserProgress progress =
        progressRepository
            .findByUserIdAndBookId(userId, UUID.fromString(bookId))
            .orElseGet(
                () -> {
                  User user =
                      userRepository
                          .findById(userId)
                          .orElseThrow(
                              () -> new ResourceNotFoundException("User", userId.toString()));
                  EssentiaBook book =
                      bookRepository
                          .findById(UUID.fromString(bookId))
                          .orElseThrow(() -> new ResourceNotFoundException("Book", bookId));
                  return EssentiaUserProgress.builder()
                      .user(user)
                      .book(book)
                      .currentCardIndex(0)
                      .isCompleted(false)
                      .isFavorite(false)
                      .build();
                });

    progress.setIsFavorite(!progress.getIsFavorite());
    return mapper.toProgressDto(progressRepository.save(progress));
  }
}
