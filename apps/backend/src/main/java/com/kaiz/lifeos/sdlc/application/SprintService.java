package com.kaiz.lifeos.sdlc.application;

import com.kaiz.lifeos.sdlc.application.dto.SprintDto;
import com.kaiz.lifeos.sdlc.domain.Sprint;
import com.kaiz.lifeos.sdlc.domain.SprintStatus;
import com.kaiz.lifeos.sdlc.infrastructure.SprintRepository;
import com.kaiz.lifeos.shared.exception.ResourceNotFoundException;
import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SprintService {

  private final SprintRepository sprintRepository;
  private final SdlcMapper sdlcMapper;

  public List<SprintDto> getAllSprints() {
    return sdlcMapper.toSprintDtoList(sprintRepository.findAll());
  }

  public List<SprintDto> getSprintsByYear(int year) {
    return sdlcMapper.toSprintDtoList(sprintRepository.findByYearOrderByWeekNumberAsc(year));
  }

  public SprintDto getSprintById(String id) {
    Sprint sprint =
        sprintRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Sprint", id));
    return sdlcMapper.toSprintDto(sprint);
  }

  @Cacheable(value = "currentSprint", key = "'active'")
  public SprintDto getCurrentSprint() {
    return sprintRepository
        .findByStatus(SprintStatus.ACTIVE)
        .map(sdlcMapper::toSprintDto)
        .orElseGet(this::calculateCurrentSprint);
  }

  private SprintDto calculateCurrentSprint() {
    LocalDate today = LocalDate.now();
    int year = today.getYear();
    int weekNumber = today.get(WeekFields.of(Locale.getDefault()).weekOfWeekBasedYear());

    return sprintRepository
        .findByWeekNumberAndYear(weekNumber, year)
        .map(sdlcMapper::toSprintDto)
        .orElseThrow(
            () ->
                new ResourceNotFoundException(
                    "Sprint", "week " + weekNumber + " of year " + year));
  }

  public List<SprintDto> getUpcomingSprints(int limit) {
    LocalDate today = LocalDate.now();
    int year = today.getYear();
    int weekNumber = today.get(WeekFields.of(Locale.getDefault()).weekOfWeekBasedYear());

    List<Sprint> sprints = sprintRepository.findUpcomingSprints(year, weekNumber);
    return sdlcMapper.toSprintDtoList(
        sprints.size() > limit ? sprints.subList(0, limit) : sprints);
  }

  @Transactional
  public SprintDto activateSprint(String sprintId) {
    // Deactivate any currently active sprint
    sprintRepository
        .findByStatus(SprintStatus.ACTIVE)
        .ifPresent(
            active -> {
              active.setStatus(SprintStatus.COMPLETED);
              sprintRepository.save(active);
            });

    // Activate the new sprint
    Sprint sprint =
        sprintRepository
            .findById(sprintId)
            .orElseThrow(() -> new ResourceNotFoundException("Sprint", sprintId));
    sprint.setStatus(SprintStatus.ACTIVE);
    return sdlcMapper.toSprintDto(sprintRepository.save(sprint));
  }
}
