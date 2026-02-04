package app.kaiz.admin.application;

import app.kaiz.admin.application.dto.CommandCenterAdminDtos.*;
import app.kaiz.admin.domain.*;
import app.kaiz.admin.repository.*;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/**
 * Service for managing Command Center admin settings.
 * Handles LLM providers, system prompts, test attachments, and feature flags.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AdminCommandCenterService {

    private final LlmProviderRepository llmProviderRepository;
    private final SystemPromptRepository systemPromptRepository;
    private final TestAttachmentRepository testAttachmentRepository;
    private final CommandCenterSettingRepository settingRepository;
    private final CommandCenterFeatureFlagRepository featureFlagRepository;

    // =============== LLM Providers ===============

    @Transactional(readOnly = true)
    public List<LlmProviderResponse> getAllProviders() {
        return llmProviderRepository.findAllByOrderByDisplayNameAsc().stream()
                .map(this::toProviderResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LlmProviderResponse getProvider(UUID id) {
        return llmProviderRepository.findById(id)
                .map(this::toProviderResponse)
                .orElseThrow(() -> new IllegalArgumentException("Provider not found: " + id));
    }

    public LlmProviderResponse createProvider(CreateLlmProviderRequest request) {
        log.info("Creating LLM provider: {}", request.providerName());

        LlmProvider provider = LlmProvider.builder()
                .providerName(request.providerName())
                .displayName(request.displayName())
                .providerType(LlmProvider.ProviderType.valueOf(request.providerType()))
                .apiBaseUrl(request.apiBaseUrl())
                .apiKeyReference(request.apiKeyReference())
                .defaultModel(request.defaultModel())
                .availableModels(request.availableModels())
                .maxTokens(request.maxTokens())
                .temperature(request.temperature())
                .rateLimitRpm(request.rateLimitRpm())
                .rateLimitTpm(request.rateLimitTpm())
                .active(request.isActive())
                .isDefault(false)
                .build();

        return toProviderResponse(llmProviderRepository.save(provider));
    }

    public LlmProviderResponse updateProvider(UUID id, UpdateLlmProviderRequest request) {
        log.info("Updating LLM provider: {}", id);

        LlmProvider provider = llmProviderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Provider not found: " + id));

        if (request.displayName() != null) provider.setDisplayName(request.displayName());
        if (request.apiBaseUrl() != null) provider.setApiBaseUrl(request.apiBaseUrl());
        if (request.apiKeyReference() != null) provider.setApiKeyReference(request.apiKeyReference());
        if (request.defaultModel() != null) provider.setDefaultModel(request.defaultModel());
        if (request.availableModels() != null) provider.setAvailableModels(request.availableModels());
        if (request.maxTokens() != null) provider.setMaxTokens(request.maxTokens());
        if (request.temperature() != null) provider.setTemperature(request.temperature());
        if (request.rateLimitRpm() != null) provider.setRateLimitRpm(request.rateLimitRpm());
        if (request.rateLimitTpm() != null) provider.setRateLimitTpm(request.rateLimitTpm());
        if (request.isActive() != null) provider.setActive(request.isActive());

        return toProviderResponse(llmProviderRepository.save(provider));
    }

    public void setDefaultProvider(UUID id) {
        log.info("Setting default LLM provider: {}", id);

        // Remove current default
        llmProviderRepository.findDefaultProvider()
                .ifPresent(p -> {
                    p.setDefault(false);
                    llmProviderRepository.save(p);
                });

        // Set new default
        LlmProvider provider = llmProviderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Provider not found: " + id));
        provider.setDefault(true);
        provider.setActive(true);
        llmProviderRepository.save(provider);
    }

    public void deleteProvider(UUID id) {
        log.info("Deleting LLM provider: {}", id);
        llmProviderRepository.deleteById(id);
    }

    // =============== System Prompts ===============

    @Transactional(readOnly = true)
    public List<SystemPromptResponse> getAllPrompts() {
        return systemPromptRepository.findAllByOrderByPromptCategoryAscPromptNameAsc().stream()
                .map(this::toPromptResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SystemPromptResponse> getPromptsByCategory(String category) {
        SystemPrompt.PromptCategory cat = SystemPrompt.PromptCategory.valueOf(category);
        return systemPromptRepository.findByPromptCategory(cat).stream()
                .map(this::toPromptResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SystemPromptResponse getPrompt(UUID id) {
        return systemPromptRepository.findById(id)
                .map(this::toPromptResponse)
                .orElseThrow(() -> new IllegalArgumentException("Prompt not found: " + id));
    }

    @Transactional(readOnly = true)
    public SystemPromptResponse getPromptByKey(String key) {
        return systemPromptRepository.findByPromptKey(key)
                .map(this::toPromptResponse)
                .orElseThrow(() -> new IllegalArgumentException("Prompt not found: " + key));
    }

    public SystemPromptResponse createPrompt(CreateSystemPromptRequest request) {
        log.info("Creating system prompt: {}", request.promptKey());

        SystemPrompt prompt = SystemPrompt.builder()
                .promptKey(request.promptKey())
                .promptName(request.promptName())
                .promptCategory(SystemPrompt.PromptCategory.valueOf(request.promptCategory()))
                .promptContent(request.promptContent())
                .variables(request.variables())
                .description(request.description())
                .version(1)
                .active(true)
                .build();

        return toPromptResponse(systemPromptRepository.save(prompt));
    }

    public SystemPromptResponse updatePrompt(UUID id, UpdateSystemPromptRequest request) {
        log.info("Updating system prompt: {}", id);

        SystemPrompt prompt = systemPromptRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Prompt not found: " + id));

        if (request.promptName() != null) prompt.setPromptName(request.promptName());
        if (request.promptContent() != null) {
            prompt.setPromptContent(request.promptContent());
            prompt.setVersion(prompt.getVersion() + 1);
        }
        if (request.variables() != null) prompt.setVariables(request.variables());
        if (request.description() != null) prompt.setDescription(request.description());
        if (request.isActive() != null) prompt.setActive(request.isActive());

        return toPromptResponse(systemPromptRepository.save(prompt));
    }

    public void deletePrompt(UUID id) {
        log.info("Deleting system prompt: {}", id);
        systemPromptRepository.deleteById(id);
    }

    // =============== Test Attachments ===============

    @Transactional(readOnly = true)
    public List<TestAttachmentResponse> getAllTestAttachments() {
        return testAttachmentRepository.findByActiveTrueOrderByDisplayOrderAsc().stream()
                .map(this::toAttachmentResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TestAttachmentResponse> getTestAttachmentsByType(String type) {
        TestAttachment.AttachmentType attachmentType = TestAttachment.AttachmentType.valueOf(type);
        return testAttachmentRepository.findByAttachmentTypeAndActiveTrue(attachmentType).stream()
                .map(this::toAttachmentResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TestAttachmentResponse getTestAttachment(UUID id) {
        return testAttachmentRepository.findById(id)
                .map(this::toAttachmentResponse)
                .orElseThrow(() -> new IllegalArgumentException("Test attachment not found: " + id));
    }

    public TestAttachmentResponse createTestAttachment(CreateTestAttachmentRequest request, MultipartFile file) {
        log.info("Creating test attachment: {}", request.attachmentName());

        TestAttachment attachment = TestAttachment.builder()
                .attachmentName(request.attachmentName())
                .attachmentType(TestAttachment.AttachmentType.valueOf(request.attachmentType()))
                .mimeType(file != null ? file.getContentType() : request.mimeType())
                .description(request.description())
                .useCase(request.useCase())
                .expectedOutput(request.expectedOutput())
                .displayOrder(request.displayOrder() != null ? request.displayOrder() : 0)
                .active(true)
                .build();

        if (file != null) {
            try {
                attachment.setFileData(file.getBytes());
                attachment.setFileSizeBytes(file.getSize());
            } catch (Exception e) {
                log.error("Failed to read file: {}", e.getMessage());
                throw new RuntimeException("Failed to process uploaded file", e);
            }
        } else if (request.fileUrl() != null) {
            attachment.setFileUrl(request.fileUrl());
        }

        return toAttachmentResponse(testAttachmentRepository.save(attachment));
    }

    public TestAttachmentResponse updateTestAttachment(UUID id, UpdateTestAttachmentRequest request) {
        log.info("Updating test attachment: {}", id);

        TestAttachment attachment = testAttachmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Test attachment not found: " + id));

        if (request.attachmentName() != null) attachment.setAttachmentName(request.attachmentName());
        if (request.description() != null) attachment.setDescription(request.description());
        if (request.useCase() != null) attachment.setUseCase(request.useCase());
        if (request.expectedOutput() != null) attachment.setExpectedOutput(request.expectedOutput());
        if (request.displayOrder() != null) attachment.setDisplayOrder(request.displayOrder());
        if (request.isActive() != null) attachment.setActive(request.isActive());

        return toAttachmentResponse(testAttachmentRepository.save(attachment));
    }

    public void deleteTestAttachment(UUID id) {
        log.info("Deleting test attachment: {}", id);
        testAttachmentRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public byte[] getTestAttachmentData(UUID id) {
        TestAttachment attachment = testAttachmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Test attachment not found: " + id));
        return attachment.getFileData();
    }

    // =============== Settings ===============

    @Transactional(readOnly = true)
    public List<SettingResponse> getAllSettings() {
        return settingRepository.findByActiveTrue().stream()
                .map(this::toSettingResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SettingResponse getSetting(String key) {
        return settingRepository.findBySettingKey(key)
                .map(this::toSettingResponse)
                .orElseThrow(() -> new IllegalArgumentException("Setting not found: " + key));
    }

    public SettingResponse updateSetting(String key, UpdateSettingRequest request) {
        log.info("Updating setting: {}", key);

        CommandCenterSetting setting = settingRepository.findBySettingKey(key)
                .orElseThrow(() -> new IllegalArgumentException("Setting not found: " + key));

        if (request.settingValue() != null) setting.setSettingValue(request.settingValue());
        if (request.description() != null) setting.setDescription(request.description());
        if (request.isActive() != null) setting.setActive(request.isActive());

        return toSettingResponse(settingRepository.save(setting));
    }

    // =============== Feature Flags ===============

    @Transactional(readOnly = true)
    public List<FeatureFlagResponse> getAllFeatureFlags() {
        return featureFlagRepository.findAllByOrderByFlagNameAsc().stream()
                .map(this::toFeatureFlagResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FeatureFlagResponse getFeatureFlag(String key) {
        return featureFlagRepository.findByFlagKey(key)
                .map(this::toFeatureFlagResponse)
                .orElseThrow(() -> new IllegalArgumentException("Feature flag not found: " + key));
    }

    public FeatureFlagResponse updateFeatureFlag(String key, UpdateFeatureFlagRequest request) {
        log.info("Updating feature flag: {}", key);

        CommandCenterFeatureFlag flag = featureFlagRepository.findByFlagKey(key)
                .orElseThrow(() -> new IllegalArgumentException("Feature flag not found: " + key));

        if (request.isEnabled() != null) flag.setEnabled(request.isEnabled());
        if (request.rolloutPercentage() != null) flag.setRolloutPercentage(request.rolloutPercentage());
        if (request.allowedUserIds() != null) flag.setAllowedUserIds(request.allowedUserIds());
        if (request.metadata() != null) flag.setMetadata(request.metadata());

        return toFeatureFlagResponse(featureFlagRepository.save(flag));
    }

    // =============== Mappers ===============

    private LlmProviderResponse toProviderResponse(LlmProvider provider) {
        return new LlmProviderResponse(
                provider.getId(),
                provider.getProviderName(),
                provider.getDisplayName(),
                provider.getProviderType().name(),
                provider.getApiBaseUrl(),
                provider.getApiKeyReference() != null ? "********" : null, // Mask key reference
                provider.getDefaultModel(),
                provider.getAvailableModels(),
                provider.getMaxTokens(),
                provider.getTemperature(),
                provider.getRateLimitRpm(),
                provider.getRateLimitTpm(),
                provider.isActive(),
                provider.isDefault()
        );
    }

    private SystemPromptResponse toPromptResponse(SystemPrompt prompt) {
        return new SystemPromptResponse(
                prompt.getId(),
                prompt.getPromptKey(),
                prompt.getPromptName(),
                prompt.getPromptCategory().name(),
                prompt.getPromptContent(),
                prompt.getVariables(),
                prompt.getDescription(),
                prompt.getVersion(),
                prompt.isActive()
        );
    }

    private TestAttachmentResponse toAttachmentResponse(TestAttachment attachment) {
        return new TestAttachmentResponse(
                attachment.getId(),
                attachment.getAttachmentName(),
                attachment.getAttachmentType().name(),
                attachment.getFileUrl(),
                attachment.getFileData() != null,
                attachment.getMimeType(),
                attachment.getFileSizeBytes(),
                attachment.getDescription(),
                attachment.getUseCase(),
                attachment.getExpectedOutput(),
                attachment.getDisplayOrder(),
                attachment.isActive()
        );
    }

    private SettingResponse toSettingResponse(CommandCenterSetting setting) {
        return new SettingResponse(
                setting.getId(),
                setting.getSettingKey(),
                setting.isSecret() ? "********" : setting.getSettingValue(),
                setting.getSettingType().name(),
                setting.getDescription(),
                setting.isSecret(),
                setting.isActive()
        );
    }

    private FeatureFlagResponse toFeatureFlagResponse(CommandCenterFeatureFlag flag) {
        return new FeatureFlagResponse(
                flag.getId(),
                flag.getFlagKey(),
                flag.getFlagName(),
                flag.getDescription(),
                flag.isEnabled(),
                flag.getRolloutPercentage(),
                flag.getAllowedUserIds(),
                flag.getMetadata()
        );
    }
}
