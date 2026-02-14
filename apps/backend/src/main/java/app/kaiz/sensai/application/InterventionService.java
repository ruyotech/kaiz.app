package app.kaiz.sensai.application;

import app.kaiz.identity.domain.User;
import app.kaiz.identity.infrastructure.UserRepository;
import app.kaiz.sensai.application.dto.InterventionDto;
import app.kaiz.sensai.domain.*;
import app.kaiz.sensai.infrastructure.InterventionRepository;
import app.kaiz.shared.exception.ResourceNotFoundException;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Manages AI-driven interventions: triggering, acknowledging, dismissing, and history retrieval.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class InterventionService {

  private final InterventionRepository interventionRepository;
  private final UserRepository userRepository;
  private final SensAIMapper mapper;

  public List<InterventionDto> getActiveInterventions(UUID userId) {
    return mapper.toInterventionDtos(
        interventionRepository.findByUserIdAndIsActiveTrueOrderByTriggeredAtDesc(userId));
  }

  public Page<InterventionDto> getInterventionHistory(UUID userId, Pageable pageable) {
    return interventionRepository
        .findByUserIdOrderByTriggeredAtDesc(userId, pageable)
        .map(mapper::toDto);
  }

  @Transactional
  public InterventionDto acknowledgeIntervention(
      UUID userId, UUID interventionId, InterventionDto.AcknowledgeRequest request) {
    Intervention intervention =
        interventionRepository
            .findById(interventionId)
            .orElseThrow(() -> new ResourceNotFoundException("Intervention not found"));

    if (!intervention.getUser().getId().equals(userId)) {
      throw new ResourceNotFoundException("Intervention not found");
    }

    intervention.setAcknowledgedAt(Instant.now());
    intervention.setActionTaken(request.actionTaken());
    intervention.setActive(false);

    log.info(
        "Intervention acknowledged: userId={}, interventionId={}, action={}",
        userId,
        interventionId,
        request.actionTaken());
    return mapper.toDto(interventionRepository.save(intervention));
  }

  @Transactional
  public InterventionDto dismissIntervention(
      UUID userId, UUID interventionId, InterventionDto.DismissRequest request) {
    Intervention intervention =
        interventionRepository
            .findById(interventionId)
            .orElseThrow(() -> new ResourceNotFoundException("Intervention not found"));

    if (!intervention.getUser().getId().equals(userId)) {
      throw new ResourceNotFoundException("Intervention not found");
    }

    intervention.setDismissedAt(Instant.now());
    intervention.setDismissReason(request.dismissReason());
    intervention.setActive(false);

    log.info(
        "Intervention dismissed: userId={}, interventionId={}, reason={}",
        userId,
        interventionId,
        request.dismissReason());
    return mapper.toDto(interventionRepository.save(intervention));
  }

  @Transactional
  public Intervention triggerIntervention(
      UUID userId,
      InterventionType type,
      InterventionUrgency urgency,
      String title,
      String message,
      String actionSuggestion,
      String dataContext,
      String relatedSprintId,
      String relatedDimension) {
    // Check if similar active intervention already exists
    if (interventionRepository.existsByUserIdAndInterventionTypeAndIsActiveTrue(userId, type)) {
      log.debug("Skipping duplicate intervention of type {} for user {}", type, userId);
      return null;
    }

    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    Intervention intervention =
        Intervention.builder()
            .user(user)
            .interventionType(type)
            .urgency(urgency)
            .title(title)
            .message(message)
            .actionSuggestion(actionSuggestion)
            .dataContext(dataContext)
            .triggeredAt(Instant.now())
            .isActive(true)
            .relatedSprintId(relatedSprintId)
            .relatedDimension(relatedDimension)
            .build();

    log.info("Intervention triggered: userId={}, type={}, urgency={}", userId, type, urgency);
    return interventionRepository.save(intervention);
  }
}
