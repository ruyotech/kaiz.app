package app.kaiz.command_center.application;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Normalizes input from various sources (text, voice, image) into a uniform text representation for
 * downstream pipeline processing.
 *
 * <p>Phase 5: Text passthrough only. Phase 6 will add:
 *
 * <ul>
 *   <li>Voice → Deepgram transcription
 *   <li>Image → Claude Vision analysis
 * </ul>
 */
@Component
@Slf4j
public class InputNormalizer {

  /** Normalized input ready for the pipeline. */
  public record NormalizedInput(
      String text, InputType type, String attachmentInfo, boolean hasVoice, boolean hasImage) {

    public static NormalizedInput textOnly(String text) {
      return new NormalizedInput(text, InputType.TEXT, null, false, false);
    }

    public static NormalizedInput withVoice(String transcribedText, String originalAudioInfo) {
      return new NormalizedInput(transcribedText, InputType.VOICE, originalAudioInfo, true, false);
    }

    public static NormalizedInput withImage(String text, String imageDescription) {
      return new NormalizedInput(text, InputType.IMAGE, imageDescription, false, true);
    }
  }

  public enum InputType {
    TEXT,
    VOICE,
    IMAGE,
    MULTIMODAL
  }

  /**
   * Normalize text-only input. Trims whitespace, collapses multiple spaces.
   *
   * @param rawInput the raw user input
   * @return normalized input
   */
  public NormalizedInput normalizeText(String rawInput) {
    if (rawInput == null || rawInput.isBlank()) {
      log.debug("Empty input received, returning empty normalized input");
      return NormalizedInput.textOnly("");
    }

    String cleaned = rawInput.strip().replaceAll("\\s+", " ");
    log.debug("Normalized text input: {} chars → {} chars", rawInput.length(), cleaned.length());
    return NormalizedInput.textOnly(cleaned);
  }

  /**
   * Normalize voice input (Phase 6: will call Deepgram). Currently returns a placeholder.
   *
   * @param audioBase64 base64-encoded audio data
   * @return normalized input with transcription
   */
  public NormalizedInput normalizeVoice(String audioBase64) {
    // Phase 6: Deepgram integration
    // For now, return placeholder
    log.info("Voice normalization requested — Deepgram integration pending (Phase 6)");
    return NormalizedInput.withVoice(
        "[Voice transcription pending — Deepgram integration in Phase 6]",
        "audio_base64_length=" + (audioBase64 != null ? audioBase64.length() : 0));
  }

  /**
   * Normalize image input (Phase 6: will call Claude Vision). Currently returns a placeholder.
   *
   * @param imageBase64 base64-encoded image data
   * @param userText optional accompanying text
   * @return normalized input with image description
   */
  public NormalizedInput normalizeImage(String imageBase64, String userText) {
    // Phase 6: Claude Vision integration
    log.info("Image normalization requested — Claude Vision integration pending (Phase 6)");
    String text = (userText != null && !userText.isBlank()) ? userText : "[Image uploaded]";
    return NormalizedInput.withImage(
        text, "image_base64_length=" + (imageBase64 != null ? imageBase64.length() : 0));
  }
}
