package app.kaiz.admin.application;

import app.kaiz.admin.domain.AdminUser;
import app.kaiz.admin.domain.crm.Lead;
import app.kaiz.admin.domain.crm.LeadActivity;
import app.kaiz.admin.domain.crm.LeadTask;
import app.kaiz.admin.infrastructure.AdminUserRepository;
import app.kaiz.admin.infrastructure.LeadRepository;
import app.kaiz.identity.domain.User;
import app.kaiz.identity.infrastructure.UserRepository;
import app.kaiz.shared.exception.ResourceNotFoundException;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CrmService {

  private final LeadRepository leadRepository;
  private final AdminUserRepository adminUserRepository;
  private final UserRepository userRepository;

  // ========== Lead CRUD ==========

  public Lead createLead(CreateLeadRequest request) {
    if (leadRepository.existsByEmail(request.email())) {
      log.warn("Lead with email {} already exists", request.email());
      // Return existing lead instead of throwing
      return leadRepository
          .findByEmail(request.email())
          .orElseThrow(() -> new ResourceNotFoundException("Lead not found"));
    }

    Lead lead =
        Lead.builder()
            .email(request.email())
            .fullName(request.fullName())
            .phone(request.phone())
            .company(request.company())
            .jobTitle(request.jobTitle())
            .source(request.source())
            .status(Lead.LeadStatus.NEW)
            .priority(request.priority() != null ? request.priority() : Lead.LeadPriority.MEDIUM)
            .lifecycleStage(Lead.LifecycleStage.SUBSCRIBER)
            .firstContactAt(Instant.now())
            .notes(request.notes())
            .tags(request.tags())
            .build();

    if (request.assignedToId() != null) {
      AdminUser assignee = adminUserRepository.findById(request.assignedToId()).orElse(null);
      lead.setAssignedTo(assignee);
    }

    Lead saved = leadRepository.save(lead);
    log.info("Created lead: {} - {}", saved.getId(), saved.getEmail());
    return saved;
  }

  public Lead updateLead(UUID leadId, UpdateLeadRequest request) {
    Lead lead = getLeadById(leadId);

    if (request.fullName() != null) lead.setFullName(request.fullName());
    if (request.phone() != null) lead.setPhone(request.phone());
    if (request.company() != null) lead.setCompany(request.company());
    if (request.jobTitle() != null) lead.setJobTitle(request.jobTitle());
    if (request.status() != null) lead.setStatus(request.status());
    if (request.priority() != null) lead.setPriority(request.priority());
    if (request.lifecycleStage() != null) lead.setLifecycleStage(request.lifecycleStage());
    if (request.notes() != null) lead.setNotes(request.notes());
    if (request.tags() != null) lead.setTags(request.tags());

    if (request.assignedToId() != null) {
      AdminUser assignee = adminUserRepository.findById(request.assignedToId()).orElse(null);
      lead.setAssignedTo(assignee);
    }

    return leadRepository.save(lead);
  }

  @Transactional(readOnly = true)
  public Lead getLeadById(UUID leadId) {
    return leadRepository
        .findById(leadId)
        .orElseThrow(() -> new ResourceNotFoundException("Lead not found: " + leadId));
  }

  @Transactional(readOnly = true)
  public Page<Lead> getLeads(
      Lead.LeadStatus status, String source, UUID assignedToId, Pageable pageable) {
    return leadRepository.findWithFilters(status, source, assignedToId, pageable);
  }

  @Transactional(readOnly = true)
  public Page<Lead> searchLeads(String query, Pageable pageable) {
    return leadRepository.search(query, pageable);
  }

  public void deleteLead(UUID leadId) {
    if (!leadRepository.existsById(leadId)) {
      throw new ResourceNotFoundException("Lead not found: " + leadId);
    }
    leadRepository.deleteById(leadId);
    log.info("Deleted lead: {}", leadId);
  }

  // ========== Lead Activities ==========

  public LeadActivity addActivity(UUID leadId, AddActivityRequest request, UUID performedById) {
    Lead lead = getLeadById(leadId);
    AdminUser performer =
        performedById != null ? adminUserRepository.findById(performedById).orElse(null) : null;

    LeadActivity activity =
        LeadActivity.builder()
            .activityType(request.activityType())
            .title(request.title())
            .description(request.description())
            .performedBy(performer)
            .performedAt(Instant.now())
            .build();

    lead.addActivity(activity);
    leadRepository.save(lead);

    return activity;
  }

  // ========== Lead Tasks ==========

  public LeadTask addTask(UUID leadId, AddTaskRequest request, UUID assignedToId) {
    Lead lead = getLeadById(leadId);
    AdminUser assignee =
        assignedToId != null ? adminUserRepository.findById(assignedToId).orElse(null) : null;

    LeadTask task =
        LeadTask.builder()
            .title(request.title())
            .description(request.description())
            .taskType(request.taskType())
            .assignedTo(assignee)
            .dueDate(request.dueDate())
            .priority(request.priority())
            .build();

    lead.addTask(task);
    leadRepository.save(lead);

    return task;
  }

  // ========== Conversion ==========

  public Lead convertToUser(UUID leadId, BigDecimal conversionValue) {
    Lead lead = getLeadById(leadId);

    if (lead.isConverted()) {
      log.warn("Lead {} is already converted", leadId);
      return lead;
    }

    // Check if user with this email already exists
    Optional<User> existingUser = userRepository.findByEmail(lead.getEmail());
    User user = existingUser.orElse(null);

    lead.markAsConverted(user, conversionValue);
    return leadRepository.save(lead);
  }

  // ========== Stats ==========

  @Transactional(readOnly = true)
  public CrmStats getStats() {
    Instant thirtyDaysAgo = Instant.now().minus(30, ChronoUnit.DAYS);

    long totalLeads = leadRepository.count();
    long newLeads = leadRepository.countByStatus(Lead.LeadStatus.NEW);
    long qualifiedLeads = leadRepository.countByStatus(Lead.LeadStatus.QUALIFIED);
    long wonLeads = leadRepository.countByStatus(Lead.LeadStatus.WON);
    long lostLeads = leadRepository.countByStatus(Lead.LeadStatus.LOST);
    long conversions = leadRepository.countConversions(thirtyDaysAgo);

    Map<String, Long> bySource = new HashMap<>();
    leadRepository.countBySource().forEach(row -> bySource.put((String) row[0], (Long) row[1]));

    Map<String, Long> byStatus = new HashMap<>();
    leadRepository
        .countByStatusGrouped()
        .forEach(row -> byStatus.put(row[0].toString(), (Long) row[1]));

    double conversionRate = totalLeads > 0 ? (double) wonLeads / totalLeads * 100 : 0;

    return new CrmStats(
        totalLeads,
        newLeads,
        qualifiedLeads,
        wonLeads,
        lostLeads,
        conversions,
        conversionRate,
        bySource,
        byStatus);
  }

  @Transactional(readOnly = true)
  public List<Lead> getRecentLeads() {
    return leadRepository.findTop10ByOrderByCreatedAtDesc();
  }

  @Transactional(readOnly = true)
  public List<Lead> getHighPriorityLeads() {
    Instant threshold = Instant.now().minus(7, ChronoUnit.DAYS);
    return leadRepository.findHighPriorityNeedingAttention(threshold);
  }

  // ========== DTOs ==========

  public record CreateLeadRequest(
      String email,
      String fullName,
      String phone,
      String company,
      String jobTitle,
      String source,
      Lead.LeadPriority priority,
      String notes,
      String[] tags,
      UUID assignedToId) {}

  public record UpdateLeadRequest(
      String fullName,
      String phone,
      String company,
      String jobTitle,
      Lead.LeadStatus status,
      Lead.LeadPriority priority,
      Lead.LifecycleStage lifecycleStage,
      String notes,
      String[] tags,
      UUID assignedToId) {}

  public record AddActivityRequest(
      LeadActivity.ActivityType activityType, String title, String description) {}

  public record AddTaskRequest(
      String title,
      String description,
      LeadTask.TaskType taskType,
      Instant dueDate,
      Lead.LeadPriority priority) {}

  public record CrmStats(
      long totalLeads,
      long newLeads,
      long qualifiedLeads,
      long wonLeads,
      long lostLeads,
      long conversionsLast30Days,
      double conversionRate,
      Map<String, Long> leadsBySource,
      Map<String, Long> leadsByStatus) {}
}
