package app.kaiz.mindset.application;

import app.kaiz.mindset.application.dto.MindsetContentDto;
import app.kaiz.mindset.application.dto.MindsetThemeDto;
import app.kaiz.mindset.domain.EmotionalTone;
import app.kaiz.mindset.domain.MindsetContent;
import app.kaiz.mindset.domain.MindsetTheme;
import app.kaiz.mindset.infrastructure.MindsetContentRepository;
import app.kaiz.mindset.infrastructure.MindsetThemeRepository;
import app.kaiz.shared.exception.ResourceNotFoundException;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MindsetService {

  private final MindsetContentRepository contentRepository;
  private final MindsetThemeRepository themeRepository;
  private final MindsetMapper mapper;

  public List<MindsetContentDto> getAllContent() {
    return contentRepository.findAllOrderByInterventionWeight().stream()
        .map(mapper::toContentDto)
        .toList();
  }

  public MindsetContentDto getContentById(String id) {
    MindsetContent content =
        contentRepository
            .findById(UUID.fromString(id))
            .orElseThrow(() -> new ResourceNotFoundException("Mindset content not found: " + id));
    return mapper.toContentDto(content);
  }

  public List<MindsetContentDto> getContentByDimensionTag(String dimensionTag) {
    return contentRepository.findByDimensionTag(dimensionTag).stream()
        .map(mapper::toContentDto)
        .toList();
  }

  public List<MindsetContentDto> getContentByEmotionalTone(EmotionalTone tone) {
    return contentRepository.findByEmotionalTone(tone).stream().map(mapper::toContentDto).toList();
  }

  public List<MindsetContentDto> getFavorites() {
    return contentRepository.findByIsFavoriteTrue().stream().map(mapper::toContentDto).toList();
  }

  @Transactional
  public MindsetContentDto toggleFavorite(String id) {
    MindsetContent content =
        contentRepository
            .findById(UUID.fromString(id))
            .orElseThrow(() -> new ResourceNotFoundException("Mindset content not found: " + id));
    content.setIsFavorite(!content.getIsFavorite());
    return mapper.toContentDto(contentRepository.save(content));
  }

  public List<MindsetThemeDto> getAllThemes() {
    return themeRepository.findAll().stream().map(mapper::toThemeDto).toList();
  }

  public MindsetThemeDto getThemeById(String id) {
    MindsetTheme theme =
        themeRepository
            .findById(UUID.fromString(id))
            .orElseThrow(() -> new ResourceNotFoundException("Mindset theme not found: " + id));
    return mapper.toThemeDto(theme);
  }

  public MindsetThemeDto getThemeByName(String name) {
    MindsetTheme theme =
        themeRepository
            .findByName(name)
            .orElseThrow(() -> new ResourceNotFoundException("Mindset theme not found: " + name));
    return mapper.toThemeDto(theme);
  }
}
