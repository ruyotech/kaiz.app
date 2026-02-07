package app.kaiz.community.application;

import app.kaiz.community.application.dto.CreateTemplateRequest;
import app.kaiz.community.application.dto.TemplateResponse;
import app.kaiz.community.domain.ActivityType;
import app.kaiz.community.domain.CommunityMember;
import app.kaiz.community.domain.CommunityTemplate;
import app.kaiz.community.domain.TemplateType;
import app.kaiz.community.infrastructure.CommunityMemberRepository;
import app.kaiz.community.infrastructure.CommunityTemplateRepository;
import app.kaiz.shared.exception.ResourceNotFoundException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Handles community template CRUD, downloads, and ratings. */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CommunityTemplateService {

  private final CommunityTemplateRepository templateRepository;
  private final CommunityMemberRepository memberRepository;
  private final CommunityActivityService activityService;

  @Transactional(readOnly = true)
  public Page<TemplateResponse> getTemplates(TemplateType type, String tag, int page, int size) {
    Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "downloadCount"));
    Page<CommunityTemplate> templates;

    if (type != null) {
      templates = templateRepository.findByTemplateType(type, pageable);
    } else {
      templates = templateRepository.findAll(pageable);
    }

    return templates.map(this::toTemplateResponse);
  }

  @Transactional(readOnly = true)
  public List<TemplateResponse> getFeaturedTemplates() {
    return templateRepository.findByIsFeaturedTrueOrderByDownloadCountDesc().stream()
        .map(this::toTemplateResponse)
        .toList();
  }

  public TemplateResponse createTemplate(UUID authorId, CreateTemplateRequest request) {
    CommunityMember author =
        memberRepository
            .findById(authorId)
            .orElseThrow(() -> new ResourceNotFoundException("Member not found: " + authorId));

    CommunityTemplate template =
        CommunityTemplate.builder()
            .author(author)
            .name(request.name())
            .description(request.description())
            .templateType(request.templateType())
            .content(request.content())
            .lifeWheelAreaId(request.lifeWheelAreaId())
            .tags(request.tags() != null ? new ArrayList<>(request.tags()) : new ArrayList<>())
            .previewImageUrl(request.previewImageUrl())
            .build();

    template = templateRepository.save(template);

    author.setTemplatesShared(author.getTemplatesShared() + 1);
    memberRepository.save(author);

    activityService.recordActivity(
        author, ActivityType.TEMPLATE_SHARED, "Shared template: " + template.getName());

    return toTemplateResponse(template);
  }

  public void downloadTemplate(UUID templateId, UUID memberId) {
    CommunityTemplate template =
        templateRepository
            .findById(templateId)
            .orElseThrow(() -> new ResourceNotFoundException("Template not found: " + templateId));
    template.incrementDownloadCount();
    templateRepository.save(template);
  }

  public void rateTemplate(UUID templateId, UUID memberId, int rating) {
    CommunityTemplate template =
        templateRepository
            .findById(templateId)
            .orElseThrow(() -> new ResourceNotFoundException("Template not found: " + templateId));
    template.addRating(rating);
    templateRepository.save(template);
  }

  TemplateResponse toTemplateResponse(CommunityTemplate template) {
    return new TemplateResponse(
        template.getId(),
        template.getName(),
        template.getDescription(),
        template.getTemplateType().name(),
        CommunityMemberMapper.toMemberResponse(template.getAuthor()),
        template.getContent(),
        template.getLifeWheelAreaId(),
        template.getTags(),
        template.getDownloadCount(),
        template.getRating(),
        template.getRatingCount(),
        template.getPreviewImageUrl(),
        template.getIsFeatured(),
        template.getCreatedAt());
  }
}
