package app.kaiz.shared.util;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(boolean success, T data, PageMeta meta, String error) {

  public static <T> ApiResponse<T> success(T data) {
    return new ApiResponse<>(true, data, null, null);
  }

  public static <T> ApiResponse<T> success(T data, PageMeta meta) {
    return new ApiResponse<>(true, data, meta, null);
  }

  public static <T> ApiResponse<T> error(String error) {
    return new ApiResponse<>(false, null, null, error);
  }

  public record PageMeta(int page, int size, long total, int totalPages) {
    public static PageMeta of(int page, int size, long total) {
      int totalPages = (int) Math.ceil((double) total / size);
      return new PageMeta(page, size, total, totalPages);
    }
  }
}
