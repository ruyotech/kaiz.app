package app.kaiz.command_center.api.dto;

import app.kaiz.command_center.domain.AIInterpretation;
import app.kaiz.command_center.domain.Draft;
import app.kaiz.command_center.domain.DraftType;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Enhanced response DTO supporting clarification flows.
 * Replaces CommandCenterAIResponse for the new flow.
 */
public record SmartInputResponse(
        UUID sessionId,
        ResponseStatus status,
        DraftType intentDetected,
        double confidenceScore,
        Draft draft,
        String reasoning,
        List<String> suggestions,
        ClarificationFlowDTO clarificationFlow,
        ImageAnalysisDTO imageAnalysis,
        OriginalInput originalInput,
        Instant timestamp,
        Instant expiresAt) {

    /**
     * Response status indicating what the client should do next.
     */
    public enum ResponseStatus {
        READY,                // Draft is ready for approval
        NEEDS_CLARIFICATION,  // Show clarification questions to user
        SUGGEST_ALTERNATIVE   // AI suggests different entity type
    }

    /**
     * Clarification flow for gathering missing information.
     */
    public record ClarificationFlowDTO(
            String flowId,
            String title,
            String description,
            List<QuestionDTO> questions,
            int currentQuestionIndex,
            int totalQuestions) {

        public record QuestionDTO(
                String id,
                String question,
                String type,
                List<OptionDTO> options,
                String fieldToPopulate,
                boolean required,
                String defaultValue) {

            public record OptionDTO(
                    String value,
                    String label,
                    String icon,
                    String description) {}
        }

        public static ClarificationFlowDTO from(AIInterpretation.ClarificationFlow flow) {
            if (flow == null) return null;

            List<QuestionDTO> questions = flow.questions().stream()
                    .map(q -> new QuestionDTO(
                            q.id(),
                            q.question(),
                            q.type().name(),
                            q.options().stream()
                                    .map(o -> new QuestionDTO.OptionDTO(
                                            o.value(), o.label(), o.icon(), o.description()))
                                    .toList(),
                            q.fieldToPopulate(),
                            q.required(),
                            q.defaultValue()))
                    .toList();

            return new ClarificationFlowDTO(
                    flow.flowId(),
                    flow.title(),
                    flow.description(),
                    questions,
                    flow.currentQuestionIndex(),
                    flow.questions().size());
        }
    }

    /**
     * Image analysis result.
     */
    public record ImageAnalysisDTO(
            String detectedType,
            String extractedText,
            ExtractedDataDTO extractedData,
            double confidence) {

        public record ExtractedDataDTO(
                String eventTitle,
                String eventDate,
                String eventTime,
                String eventLocation,
                List<String> attendees,
                String vendorName,
                String amount,
                String currency,
                String dueDate,
                String occasionType,
                String personName,
                String rawText) {}

        public static ImageAnalysisDTO from(AIInterpretation.ImageAnalysis analysis) {
            if (analysis == null) return null;

            var data = analysis.extractedData();
            ExtractedDataDTO extractedData = data == null ? null : new ExtractedDataDTO(
                    data.eventTitle(),
                    data.eventDate(),
                    data.eventTime(),
                    data.eventLocation(),
                    data.attendees(),
                    data.vendorName(),
                    data.amount(),
                    data.currency(),
                    data.dueDate(),
                    data.occasionType(),
                    data.personName(),
                    data.rawText());

            return new ImageAnalysisDTO(
                    analysis.detectedType().name(),
                    analysis.extractedText(),
                    extractedData,
                    analysis.confidence());
        }
    }

    /**
     * Original input preserved for reference.
     */
    public record OriginalInput(
            String text,
            List<AttachmentSummary> attachments,
            String voiceTranscription) {

        public record AttachmentSummary(
                String name,
                String type,
                String mimeType,
                long size,
                String extractedText) {}
    }

    // =========================================================================
    // Factory methods
    // =========================================================================

    /**
     * Create response for a ready draft.
     */
    public static SmartInputResponse ready(
            UUID sessionId,
            DraftType type,
            double confidence,
            Draft draft,
            String reasoning,
            List<String> suggestions,
            OriginalInput originalInput,
            Instant expiresAt) {

        return new SmartInputResponse(
                sessionId,
                ResponseStatus.READY,
                type,
                confidence,
                draft,
                reasoning,
                suggestions,
                null,
                null,
                originalInput,
                Instant.now(),
                expiresAt);
    }

    /**
     * Create response that needs clarification.
     */
    public static SmartInputResponse needsClarification(
            UUID sessionId,
            DraftType suggestedType,
            Draft partialDraft,
            String reasoning,
            ClarificationFlowDTO flow,
            ImageAnalysisDTO imageAnalysis,
            OriginalInput originalInput) {

        return new SmartInputResponse(
                sessionId,
                ResponseStatus.NEEDS_CLARIFICATION,
                suggestedType,
                0.5,
                partialDraft,
                reasoning,
                List.of(),
                flow,
                imageAnalysis,
                originalInput,
                Instant.now(),
                null);
    }

    /**
     * Create response suggesting an alternative.
     */
    public static SmartInputResponse suggestAlternative(
            UUID sessionId,
            DraftType suggestedType,
            Draft suggestedDraft,
            String reasoning,
            List<String> suggestions,
            ClarificationFlowDTO confirmationFlow,
            OriginalInput originalInput) {

        return new SmartInputResponse(
                sessionId,
                ResponseStatus.SUGGEST_ALTERNATIVE,
                suggestedType,
                0.7,
                suggestedDraft,
                reasoning,
                suggestions,
                confirmationFlow,
                null,
                originalInput,
                Instant.now(),
                null);
    }
}
