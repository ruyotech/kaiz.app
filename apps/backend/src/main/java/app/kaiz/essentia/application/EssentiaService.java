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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EssentiaService {

  private final EssentiaBookRepository bookRepository;
  private final EssentiaUserProgressRepository progressRepository;
  private final UserRepository userRepository;
  private final EssentiaMapper mapper;

  public List<EssentiaBookDto> getAllBooks() {
    return bookRepository.findAll().stream().map(mapper::toBookDtoWithoutCards).toList();
  }

  public EssentiaBookDto getBookById(String id) {
    EssentiaBook book =
        bookRepository
            .findById(UUID.fromString(id))
            .orElseThrow(() -> new ResourceNotFoundException("Book not found: " + id));
    return mapper.toBookDto(book);
  }

  public List<EssentiaBookDto> getBooksByCategory(String category) {
    return bookRepository.findByCategory(category).stream()
        .map(mapper::toBookDtoWithoutCards)
        .toList();
  }

  public List<EssentiaBookDto> getBooksByDifficulty(Difficulty difficulty) {
    return bookRepository.findByDifficulty(difficulty).stream()
        .map(mapper::toBookDtoWithoutCards)
        .toList();
  }

  public List<EssentiaBookDto> getBooksByLifeWheelArea(String lifeWheelAreaId) {
    return bookRepository.findByLifeWheelAreaId(UUID.fromString(lifeWheelAreaId)).stream()
        .map(mapper::toBookDtoWithoutCards)
        .toList();
  }

  public List<EssentiaBookDto> getTopRatedBooks() {
    return bookRepository.findAllOrderByRating().stream()
        .map(mapper::toBookDtoWithoutCards)
        .toList();
  }

  public List<EssentiaBookDto> getPopularBooks() {
    return bookRepository.findAllOrderByPopularity().stream()
        .map(mapper::toBookDtoWithoutCards)
        .toList();
  }

  public List<String> getAllCategories() {
    return bookRepository.findAllCategories();
  }

  // User progress methods
  public List<EssentiaUserProgressDto> getUserProgress(UUID userId) {
    return progressRepository.findByUserId(userId).stream().map(mapper::toProgressDto).toList();
  }

  public EssentiaUserProgressDto getUserProgressForBook(UUID userId, String bookId) {
    EssentiaUserProgress progress =
        progressRepository
            .findByUserIdAndBookId(userId, UUID.fromString(bookId))
            .orElseThrow(
                () ->
                    new ResourceNotFoundException(
                        "Progress not found for book: " + bookId));
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
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

    EssentiaBook book =
        bookRepository
            .findById(UUID.fromString(bookId))
            .orElseThrow(() -> new ResourceNotFoundException("Book not found: " + bookId));

    // Check if progress already exists
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
  public EssentiaUserProgressDto updateProgress(UUID userId, String bookId, int cardIndex) {
    EssentiaUserProgress progress =
        progressRepository
            .findByUserIdAndBookId(userId, UUID.fromString(bookId))
            .orElseThrow(
                () ->
                    new ResourceNotFoundException(
                        "Progress not found for book: " + bookId));

    progress.setCurrentCardIndex(cardIndex);

    // Check if completed
    if (cardIndex >= progress.getBook().getCardCount() - 1) {
      progress.setIsCompleted(true);
      // Increment completion count on the book
      EssentiaBook book = progress.getBook();
      book.setCompletionCount(book.getCompletionCount() + 1);
      bookRepository.save(book);
    }

    return mapper.toProgressDto(progressRepository.save(progress));
  }

  @Transactional
  public EssentiaUserProgressDto toggleFavorite(UUID userId, String bookId) {
    EssentiaUserProgress progress =
        progressRepository
            .findByUserIdAndBookId(userId, UUID.fromString(bookId))
            .orElseGet(
                () -> {
                  User user =
                      userRepository
                          .findById(userId)
                          .orElseThrow(
                              () -> new ResourceNotFoundException("User not found: " + userId));
                  EssentiaBook book =
                      bookRepository
                          .findById(UUID.fromString(bookId))
                          .orElseThrow(
                              () -> new ResourceNotFoundException("Book not found: " + bookId));
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
