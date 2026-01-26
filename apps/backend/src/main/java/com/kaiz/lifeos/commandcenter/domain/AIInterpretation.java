package com.kaiz.lifeos.commandcenter.domain;

import java.util.List;

/**
 * AI response that may require clarification before creating a draft.
 * Supports two modes:
 * 1. READY - Draft is complete, can be created immediately
 * 2. NEEDS_CLARIFICATION - Need to ask user questions first
 */
public record AIInterpretation(
        InterpretationStatus status,
        DraftType suggestedType,
        double confidenceScore,
        Draft partialDraft,
        String reasoning,
        List<String> suggestions,
        ClarificationFlow clarificationFlow,
        ImageAnalysis imageAnalysis) {

    public enum InterpretationStatus {
        READY,                // Draft is complete, can proceed
        NEEDS_CLARIFICATION,  // Need to ask questions
        SUGGEST_ALTERNATIVE   // AI suggests something different (e.g., challenge instead of task)
    }

    /**
     * Flow for gathering missing information.
     * Max 3-5 questions to keep it focused.
     */
    public record ClarificationFlow(
            String flowId,
            String title,
            String description,
            List<ClarificationQuestion> questions,
            int currentQuestionIndex,
            int maxQuestions) {

        public static final int DEFAULT_MAX_QUESTIONS = 5;

        public boolean isComplete() {
            return currentQuestionIndex >= questions.size();
        }

        public ClarificationQuestion currentQuestion() {
            if (currentQuestionIndex < questions.size()) {
                return questions.get(currentQuestionIndex);
            }
            return null;
        }

        public int remainingQuestions() {
            return Math.max(0, questions.size() - currentQuestionIndex);
        }
    }

    /**
     * Analysis result for image attachments.
     */
    public record ImageAnalysis(
            ImageType detectedType,
            String extractedText,
            ExtractedData extractedData,
            double confidence) {

        public enum ImageType {
            CALENDAR_SCREENSHOT,    // Outlook, Google Calendar, Teams meeting
            RECEIPT,                // Store receipt, payment confirmation
            BILL,                   // Credit card statement, utility bill
            INVITATION,             // Birthday card, party invite, wedding
            DOCUMENT,               // General document with text
            HANDWRITTEN_NOTE,       // Handwritten to-do or note
            OTHER                   // Unrecognized
        }

        /**
         * Structured data extracted from images.
         */
        public record ExtractedData(
                // For calendar/meeting screenshots
                String eventTitle,
                String eventDate,
                String eventTime,
                String eventLocation,
                List<String> attendees,

                // For bills/receipts
                String vendorName,
                String amount,
                String currency,
                String dueDate,

                // For invitations
                String occasionType,
                String personName,

                // Raw text
                String rawText) {}
    }

    // =========================================================================
    // Factory methods for common scenarios
    // =========================================================================

    /**
     * Create a ready response with complete draft.
     */
    public static AIInterpretation ready(
            DraftType type, double confidence, Draft draft, String reasoning, List<String> suggestions) {
        return new AIInterpretation(
                InterpretationStatus.READY,
                type,
                confidence,
                draft,
                reasoning,
                suggestions,
                null,
                null);
    }

    /**
     * Create a response that needs clarification.
     */
    public static AIInterpretation needsClarification(
            DraftType suggestedType,
            Draft partialDraft,
            String reasoning,
            ClarificationFlow flow) {
        return new AIInterpretation(
                InterpretationStatus.NEEDS_CLARIFICATION,
                suggestedType,
                0.5, // Lower confidence when clarification needed
                partialDraft,
                reasoning,
                List.of(),
                flow,
                null);
    }

    /**
     * Create a response suggesting an alternative (e.g., challenge instead of task).
     */
    public static AIInterpretation suggestAlternative(
            DraftType suggestedType,
            Draft suggestedDraft,
            String reasoning,
            List<String> suggestions,
            ClarificationFlow confirmationFlow) {
        return new AIInterpretation(
                InterpretationStatus.SUGGEST_ALTERNATIVE,
                suggestedType,
                0.7,
                suggestedDraft,
                reasoning,
                suggestions,
                confirmationFlow,
                null);
    }

    /**
     * Create a response with image analysis.
     */
    public static AIInterpretation withImageAnalysis(
            InterpretationStatus status,
            DraftType type,
            double confidence,
            Draft draft,
            String reasoning,
            ImageAnalysis imageAnalysis,
            ClarificationFlow flow) {
        return new AIInterpretation(
                status, type, confidence, draft, reasoning, List.of(), flow, imageAnalysis);
    }
}
