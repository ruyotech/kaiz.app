package com.kaiz.lifeos.shared.exception;

import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends ApiException {

  public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
    super(
        HttpStatus.NOT_FOUND,
        "RESOURCE_NOT_FOUND",
        String.format("%s not found with %s: %s", resourceName, fieldName, fieldValue));
  }

  public ResourceNotFoundException(String resourceName, String id) {
    super(
        HttpStatus.NOT_FOUND,
        "RESOURCE_NOT_FOUND",
        String.format("%s not found with id: %s", resourceName, id));
  }

  public ResourceNotFoundException(String message) {
    super(HttpStatus.NOT_FOUND, "RESOURCE_NOT_FOUND", message);
  }
}
