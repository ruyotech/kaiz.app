package app.kaiz.command_center.application;

import app.kaiz.command_center.application.dto.SmartInputRequest;
import app.kaiz.shared.exception.AIProcessingException;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.StreamingChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * SSE streaming service for Command Center AI. Streams AI responses token-by-token to the client
 * via Server-Sent Events for real-time UX.
 *
 * <p>Uses Spring AI's built-in streaming support with Anthropic and Spring MVC's SseEmitter (no
 * WebFlux dependency needed).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StreamingAIService {

  private static final long SSE_TIMEOUT_MS = 120_000; // 2 minutes

  private final ChatModelProvider chatModelProvider;
  private final SystemPromptService systemPromptService;

  // Virtual threads (Java 21) for non-blocking SSE emission
  private final ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();

  /**
   * Stream AI response for smart input. Sends token-by-token SSE events, then a final "done" event
   * with the complete response for JSON parsing by the client.
   *
   * @param userId the user making the request
   * @param request the smart input request
   * @return SseEmitter that streams AI tokens
   */
  public SseEmitter streamSmartInput(UUID userId, SmartInputRequest request) {
    SseEmitter emitter = new SseEmitter(SSE_TIMEOUT_MS);

    executor.submit(
        () -> {
          StringBuilder fullResponse = new StringBuilder();
          try {
            String userPrompt = buildUserPrompt(userId, request);

            boolean hasImage =
                request.attachments() != null
                    && request.attachments().stream()
                        .anyMatch(
                            a -> a.type() != null && a.type().toLowerCase().contains("image"));
            boolean hasVoice =
                request.attachments() != null
                    && request.attachments().stream()
                        .anyMatch(
                            a ->
                                a.type() != null
                                    && (a.type().toLowerCase().contains("audio")
                                        || a.type().toLowerCase().contains("voice")));

            String systemPrompt = systemPromptService.getPromptForInputType(hasImage, hasVoice);

            var prompt =
                new Prompt(List.of(new SystemMessage(systemPrompt), new UserMessage(userPrompt)));

            // Stream using Spring AI's Flux-based streaming, consumed imperatively
            ChatModel model = chatModelProvider.getChatModel();
            if (!(model instanceof StreamingChatModel streamingModel)) {
              throw new AIProcessingException("Configured ChatModel does not support streaming");
            }
            streamingModel.stream(prompt)
                .doOnNext(
                    response -> {
                      try {
                        String token = response.getResult().getOutput().getText();
                        if (token != null && !token.isEmpty()) {
                          fullResponse.append(token);
                          emitter.send(SseEmitter.event().name("token").data(token));
                        }
                      } catch (Exception e) {
                        log.debug("Failed to send SSE token: {}", e.getMessage());
                      }
                    })
                .doOnComplete(
                    () -> {
                      try {
                        // Send the complete response as a "done" event for client-side parsing
                        emitter.send(SseEmitter.event().name("done").data(fullResponse.toString()));
                        emitter.complete();
                        log.debug(
                            "Streaming completed for user {}, total length: {}",
                            userId,
                            fullResponse.length());
                      } catch (Exception e) {
                        log.debug("Failed to send completion event: {}", e.getMessage());
                      }
                    })
                .doOnError(
                    error -> {
                      log.error("Streaming error for user {}: {}", userId, error.getMessage());
                      try {
                        emitter.send(
                            SseEmitter.event()
                                .name("error")
                                .data("AI processing failed: " + error.getMessage()));
                        emitter.completeWithError(error);
                      } catch (Exception e) {
                        log.debug("Failed to send error event: {}", e.getMessage());
                      }
                    })
                .blockLast(); // Block in the virtual thread — safe with Java 21 virtual threads

          } catch (Exception e) {
            log.error("Failed to start streaming for user {}: {}", userId, e.getMessage(), e);
            try {
              emitter.send(
                  SseEmitter.event()
                      .name("error")
                      .data("Failed to start AI processing: " + e.getMessage()));
              emitter.completeWithError(e);
            } catch (Exception ex) {
              log.debug("Failed to send error to SSE emitter: {}", ex.getMessage());
            }
          }
        });

    emitter.onTimeout(() -> log.warn("SSE connection timed out for user {}", userId));
    emitter.onCompletion(() -> log.debug("SSE connection completed for user {}", userId));

    return emitter;
  }

  /**
   * Build user prompt from smart input request. Reuses the same prompt format as
   * SmartInputAIService.
   */
  private String buildUserPrompt(UUID userId, SmartInputRequest request) {
    StringBuilder prompt = new StringBuilder();
    prompt.append("User input: \"").append(request.text()).append("\"");

    if (request.attachments() != null && !request.attachments().isEmpty()) {
      prompt.append("\n\nAttachments:");
      for (var attachment : request.attachments()) {
        prompt.append("\n- Type: ").append(attachment.mimeType());
        if (attachment.extractedText() != null) {
          prompt.append(", Extracted text: \"").append(attachment.extractedText()).append("\"");
        }
        if (attachment.metadata() != null) {
          prompt.append(", Metadata: ").append(attachment.metadata());
        }
      }
    }

    if (request.voiceTranscription() != null) {
      prompt
          .append("\n\nVoice transcription: \"")
          .append(request.voiceTranscription())
          .append("\"");
    }

    prompt.append("\n\nContext: User ID=").append(userId);
    prompt.append(", Current time=").append(java.time.Instant.now());
    prompt.append(", Timezone=").append(java.time.ZoneId.systemDefault());

    return prompt.toString();
  }
}
