package app.kaiz.shared.storage;

import app.kaiz.shared.security.CurrentUser;
import app.kaiz.shared.util.ApiResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * Controller for file upload operations. All files are stored under the user's ID folder for
 * privacy and scalability. Path structure: users/{userId}/{category}/{uniqueFilename}
 */
@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
@Slf4j
public class FileUploadController {

  private final CloudStorageService cloudStorageService;

  /**
   * Upload a single file for the authenticated user. Files are stored under:
   * users/{userId}/{folder}/{filename}
   *
   * @param userId The authenticated user's ID
   * @param file The file to upload
   * @param folder The category folder (e.g., "comments", "tasks", "attachments")
   * @return The uploaded file info
   */
  @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<ApiResponse<FileUploadResponse>> uploadFile(
      @CurrentUser UUID userId,
      @RequestPart("file") MultipartFile file,
      @RequestParam(value = "folder", defaultValue = "uploads") String folder) {
    try {
      // Organize files by user ID for privacy and scalability
      String userFolder = String.format("users/%s/%s", userId.toString(), folder);
      log.info(
          "User {} uploading file: {} to folder: {}",
          userId,
          file.getOriginalFilename(),
          userFolder);

      String fileUrl = cloudStorageService.uploadFile(file, userFolder);

      FileUploadResponse response =
          new FileUploadResponse(
              file.getOriginalFilename(), fileUrl, file.getContentType(), file.getSize());

      return ResponseEntity.ok(ApiResponse.success(response));
    } catch (IOException e) {
      log.error("File upload failed for user {}: {}", userId, e.getMessage(), e);
      return ResponseEntity.internalServerError()
          .body(ApiResponse.error("Failed to upload file: " + e.getMessage()));
    }
  }

  /**
   * Upload multiple files for the authenticated user.
   *
   * @param userId The authenticated user's ID
   * @param files The files to upload
   * @param folder The category folder
   * @return List of uploaded file infos
   */
  @PostMapping(value = "/upload-multiple", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<ApiResponse<List<FileUploadResponse>>> uploadMultipleFiles(
      @CurrentUser UUID userId,
      @RequestPart("files") List<MultipartFile> files,
      @RequestParam(value = "folder", defaultValue = "uploads") String folder) {
    try {
      String userFolder = String.format("users/%s/%s", userId.toString(), folder);
      log.info("User {} uploading {} files to folder: {}", userId, files.size(), userFolder);

      List<FileUploadResponse> responses = new ArrayList<>();

      for (MultipartFile file : files) {
        String fileUrl = cloudStorageService.uploadFile(file, userFolder);
        responses.add(
            new FileUploadResponse(
                file.getOriginalFilename(), fileUrl, file.getContentType(), file.getSize()));
      }

      return ResponseEntity.ok(ApiResponse.success(responses));
    } catch (IOException e) {
      log.error("File upload failed for user {}: {}", userId, e.getMessage(), e);
      return ResponseEntity.internalServerError()
          .body(ApiResponse.error("Failed to upload files: " + e.getMessage()));
    }
  }

  /**
   * Delete a file. Only allows deleting files owned by the authenticated user.
   *
   * @param userId The authenticated user's ID
   * @param fileUrl The URL of the file to delete
   * @return Success status
   */
  @DeleteMapping("/delete")
  public ResponseEntity<ApiResponse<Boolean>> deleteFile(
      @CurrentUser UUID userId, @RequestParam String fileUrl) {
    // Security check: Ensure user can only delete their own files
    String userPathPrefix = String.format("users/%s/", userId.toString());
    if (!fileUrl.contains(userPathPrefix)) {
      log.warn("User {} attempted to delete file not owned by them: {}", userId, fileUrl);
      return ResponseEntity.status(403)
          .body(ApiResponse.error("You can only delete your own files"));
    }

    boolean deleted = cloudStorageService.deleteFile(fileUrl);
    if (deleted) {
      log.info("User {} deleted file: {}", userId, fileUrl);
      return ResponseEntity.ok(ApiResponse.success(true));
    } else {
      return ResponseEntity.badRequest().body(ApiResponse.error("Failed to delete file"));
    }
  }

  public record FileUploadResponse(
      String filename, String fileUrl, String fileType, Long fileSize) {}
}
