package app.kaiz.tasks.application;

import app.kaiz.identity.domain.User;
import app.kaiz.identity.infrastructure.UserRepository;
import app.kaiz.shared.exception.ResourceNotFoundException;
import app.kaiz.tasks.application.dto.UserTagDto;
import app.kaiz.tasks.domain.UserTag;
import app.kaiz.tasks.infrastructure.UserTagRepository;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class UserTagService {

  private final UserTagRepository userTagRepository;
  private final UserRepository userRepository;

  public List<UserTagDto> getUserTags(UUID userId) {
    return userTagRepository.findByUserIdOrderByUsageCountDesc(userId).stream()
        .map(this::toDto)
        .collect(Collectors.toList());
  }

  public UserTagDto getTagById(UUID userId, UUID tagId) {
    UserTag tag =
        userTagRepository
            .findByIdAndUserId(tagId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Tag", tagId.toString()));
    return toDto(tag);
  }

  @Transactional
  public UserTagDto createTag(UUID userId, UserTagDto.CreateTagRequest request) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

    String normalizedName = request.name().trim().toLowerCase();

    // Check if tag already exists
    if (userTagRepository.existsByUserIdAndName(userId, normalizedName)) {
      throw new IllegalArgumentException("Tag with this name already exists");
    }

    UserTag tag =
        UserTag.builder()
            .user(user)
            .name(normalizedName)
            .color(request.color() != null ? request.color() : "#6B7280")
            .build();

    return toDto(userTagRepository.save(tag));
  }

  @Transactional
  public UserTagDto updateTag(UUID userId, UUID tagId, UserTagDto.UpdateTagRequest request) {
    UserTag tag =
        userTagRepository
            .findByIdAndUserId(tagId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Tag", tagId.toString()));

    if (request.name() != null) {
      String normalizedName = request.name().trim().toLowerCase();
      // Check if another tag with this name exists
      userTagRepository
          .findByUserIdAndName(userId, normalizedName)
          .ifPresent(
              existingTag -> {
                if (!existingTag.getId().equals(tagId)) {
                  throw new IllegalArgumentException("Tag with this name already exists");
                }
              });
      tag.setName(normalizedName);
    }

    if (request.color() != null) {
      tag.setColor(request.color());
    }

    return toDto(userTagRepository.save(tag));
  }

  @Transactional
  public void deleteTag(UUID userId, UUID tagId) {
    UserTag tag =
        userTagRepository
            .findByIdAndUserId(tagId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Tag", tagId.toString()));
    userTagRepository.delete(tag);
  }

  /** Find or create tags by names. Returns list of UserTag entities. */
  @Transactional
  public List<UserTag> findOrCreateTags(UUID userId, List<String> tagNames) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

    return tagNames.stream()
        .map(name -> name.trim().toLowerCase())
        .filter(name -> !name.isEmpty())
        .distinct()
        .map(
            normalizedName ->
                userTagRepository
                    .findByUserIdAndName(userId, normalizedName)
                    .orElseGet(
                        () -> {
                          UserTag newTag =
                              UserTag.builder().user(user).name(normalizedName).build();
                          return userTagRepository.save(newTag);
                        }))
        .collect(Collectors.toList());
  }

  private UserTagDto toDto(UserTag tag) {
    return new UserTagDto(
        tag.getId(), tag.getName(), tag.getColor(), tag.getUsageCount(), tag.getCreatedAt());
  }
}
