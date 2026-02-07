package app.kaiz.shared.storage;

import com.google.cloud.storage.*;
import java.io.IOException;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/** Service for uploading files to Google Cloud Storage. */
@Service
@Slf4j
public class CloudStorageService {

  private Storage storage;
  private final String bucketName;
  private final String publicUrlBase;
  private boolean initialized = false;

  public CloudStorageService(
      @Value("${gcp.storage.bucket:kaiz-app-uploads}") String bucketName,
      @Value("${gcp.storage.public-url-base:https://storage.googleapis.com}")
          String publicUrlBase) {
    this.bucketName = bucketName;
    this.publicUrlBase = publicUrlBase;
    log.info("CloudStorageService configured with bucket: {}", bucketName);
  }

  /** Lazy initialization of GCS client to avoid startup failures. */
  private synchronized Storage getStorage() throws IOException {
    if (!initialized) {
      try {
        this.storage = StorageOptions.getDefaultInstance().getService();
        this.initialized = true;
        log.info("CloudStorageService GCS client initialized successfully");
      } catch (Exception e) {
        log.error("Failed to initialize GCS client: {}", e.getMessage());
        throw new IOException("GCS not available: " + e.getMessage(), e);
      }
    }
    return storage;
  }

  /**
   * Upload a file to cloud storage.
   *
   * @param file The file to upload
   * @param folder The folder/prefix in the bucket (e.g., "comments", "tasks")
   * @return The public URL of the uploaded file
   */
  public String uploadFile(MultipartFile file, String folder) throws IOException {
    String originalFilename = file.getOriginalFilename();
    String extension = getFileExtension(originalFilename);
    String uniqueFilename = UUID.randomUUID().toString() + extension;
    String objectPath = folder + "/" + uniqueFilename;

    BlobId blobId = BlobId.of(bucketName, objectPath);
    BlobInfo blobInfo = BlobInfo.newBuilder(blobId).setContentType(file.getContentType()).build();

    try {
      getStorage().create(blobInfo, file.getBytes());
      String publicUrl = String.format("%s/%s/%s", publicUrlBase, bucketName, objectPath);
      log.info("File uploaded successfully: {}", publicUrl);
      return publicUrl;
    } catch (Exception e) {
      log.error("Failed to upload file to GCS: {}", e.getMessage(), e);
      throw new IOException("Failed to upload file: " + e.getMessage(), e);
    }
  }

  /**
   * Upload file bytes directly.
   *
   * @param bytes The file bytes
   * @param filename The original filename
   * @param contentType The content type
   * @param folder The folder/prefix
   * @return The public URL
   */
  public String uploadBytes(byte[] bytes, String filename, String contentType, String folder)
      throws IOException {
    String extension = getFileExtension(filename);
    String uniqueFilename = UUID.randomUUID().toString() + extension;
    String objectPath = folder + "/" + uniqueFilename;

    BlobId blobId = BlobId.of(bucketName, objectPath);
    BlobInfo blobInfo = BlobInfo.newBuilder(blobId).setContentType(contentType).build();

    try {
      getStorage().create(blobInfo, bytes);
      String publicUrl = String.format("%s/%s/%s", publicUrlBase, bucketName, objectPath);
      log.info("File uploaded successfully: {}", publicUrl);
      return publicUrl;
    } catch (Exception e) {
      log.error("Failed to upload file to GCS: {}", e.getMessage(), e);
      throw new IOException("Failed to upload file: " + e.getMessage(), e);
    }
  }

  /**
   * Delete a file from cloud storage.
   *
   * @param fileUrl The public URL of the file
   * @return true if deleted, false otherwise
   */
  public boolean deleteFile(String fileUrl) {
    try {
      // Extract object path from URL
      String objectPath = fileUrl.replace(publicUrlBase + "/" + bucketName + "/", "");
      BlobId blobId = BlobId.of(bucketName, objectPath);
      boolean deleted = getStorage().delete(blobId);
      log.info("File deletion result for {}: {}", objectPath, deleted);
      return deleted;
    } catch (com.google.cloud.storage.StorageException | IOException e) {
      log.error("Failed to delete file: {}", e.getMessage(), e);
      return false;
    }
  }

  private String getFileExtension(String filename) {
    if (filename == null || !filename.contains(".")) {
      return "";
    }
    return filename.substring(filename.lastIndexOf("."));
  }
}
