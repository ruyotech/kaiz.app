package com.kaiz.lifeos.challenge.api;

import com.kaiz.lifeos.challenge.application.ChallengeService;
import com.kaiz.lifeos.challenge.application.dto.*;
import com.kaiz.lifeos.challenge.domain.ChallengeStatus;
import com.kaiz.lifeos.shared.security.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/challenges")
@RequiredArgsConstructor
@Tag(name = "Challenges", description = "Challenge management endpoints")
public class ChallengeController {

  private final ChallengeService challengeService;

  // Template endpoints (public)
  @GetMapping("/templates")
  @Operation(
      summary = "Get challenge templates",
      description = "Retrieve all challenge templates, optionally filtered by life wheel area")
  public ResponseEntity<List<ChallengeTemplateDto>> getTemplates(
      @RequestParam(required = false) String lifeWheelAreaId) {
    List<ChallengeTemplateDto> templates =
        lifeWheelAreaId != null
            ? challengeService.getTemplatesByLifeWheelArea(lifeWheelAreaId)
            : challengeService.getAllTemplates();
    return ResponseEntity.ok(templates);
  }

  @GetMapping("/templates/{id}")
  @Operation(summary = "Get template by ID", description = "Retrieve a specific challenge template")
  public ResponseEntity<ChallengeTemplateDto> getTemplateById(@PathVariable String id) {
    return ResponseEntity.ok(challengeService.getTemplateById(id));
  }

  // Challenge endpoints (authenticated)
  @GetMapping
  @SecurityRequirement(name = "bearerAuth")
  @Operation(
      summary = "Get all challenges",
      description = "Retrieve all challenges for the current user")
  public ResponseEntity<List<ChallengeDto>> getChallenges(
      @CurrentUser UUID userId, @RequestParam(required = false) ChallengeStatus status) {
    List<ChallengeDto> challenges =
        status != null
            ? challengeService.getChallengesByUserIdAndStatus(userId, status)
            : challengeService.getChallengesByUserId(userId);
    return ResponseEntity.ok(challenges);
  }

  @GetMapping("/active")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(
      summary = "Get active challenges",
      description = "Retrieve all active challenges for the current user")
  public ResponseEntity<List<ChallengeDto>> getActiveChallenges(@CurrentUser UUID userId) {
    return ResponseEntity.ok(challengeService.getActiveChallenges(userId));
  }

  @GetMapping("/{id}")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(
      summary = "Get challenge by ID",
      description = "Retrieve a specific challenge with participants")
  public ResponseEntity<ChallengeDto> getChallengeById(
      @CurrentUser UUID userId, @PathVariable UUID id) {
    return ResponseEntity.ok(challengeService.getChallengeById(userId, id));
  }

  @PostMapping
  @SecurityRequirement(name = "bearerAuth")
  @Operation(summary = "Create challenge", description = "Create a new challenge")
  public ResponseEntity<ChallengeDto> createChallenge(
      @CurrentUser UUID userId, @Valid @RequestBody ChallengeDto.CreateChallengeRequest request) {
    ChallengeDto challenge = challengeService.createChallenge(userId, request);
    return ResponseEntity.created(URI.create("/api/v1/challenges/" + challenge.id()))
        .body(challenge);
  }

  @PutMapping("/{id}")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(summary = "Update challenge", description = "Update an existing challenge")
  public ResponseEntity<ChallengeDto> updateChallenge(
      @CurrentUser UUID userId,
      @PathVariable UUID id,
      @Valid @RequestBody ChallengeDto.UpdateChallengeRequest request) {
    return ResponseEntity.ok(challengeService.updateChallenge(userId, id, request));
  }

  @DeleteMapping("/{id}")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(summary = "Delete challenge", description = "Delete a challenge")
  public ResponseEntity<Void> deleteChallenge(@CurrentUser UUID userId, @PathVariable UUID id) {
    challengeService.deleteChallenge(userId, id);
    return ResponseEntity.noContent().build();
  }

  // Entry endpoints
  @GetMapping("/{id}/entries")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(
      summary = "Get challenge entries",
      description = "Retrieve all entries for a challenge")
  public ResponseEntity<List<ChallengeEntryDto>> getEntries(
      @CurrentUser UUID userId, @PathVariable UUID id) {
    return ResponseEntity.ok(challengeService.getEntriesByChallengeId(userId, id));
  }

  @PostMapping("/{id}/entries")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(summary = "Log entry", description = "Log a new entry for a challenge")
  public ResponseEntity<ChallengeEntryDto> logEntry(
      @CurrentUser UUID userId,
      @PathVariable UUID id,
      @Valid @RequestBody ChallengeEntryDto.CreateChallengeEntryRequest request) {
    ChallengeEntryDto entry = challengeService.logEntry(userId, id, request);
    return ResponseEntity.created(URI.create("/api/v1/challenges/" + id + "/entries/" + entry.id()))
        .body(entry);
  }

  // Participant endpoints
  @PostMapping("/{id}/participants")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(summary = "Invite participant", description = "Invite a user to join the challenge")
  public ResponseEntity<ChallengeParticipantDto> inviteParticipant(
      @CurrentUser UUID userId,
      @PathVariable UUID id,
      @Valid @RequestBody ChallengeParticipantDto.InviteParticipantRequest request) {
    ChallengeParticipantDto participant = challengeService.inviteParticipant(userId, id, request);
    return ResponseEntity.created(
            URI.create("/api/v1/challenges/" + id + "/participants/" + participant.id()))
        .body(participant);
  }
}
