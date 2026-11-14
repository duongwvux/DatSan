package vn.datsan.backend.common.exception;

public record FieldErrorResponse(
    String field,
    String code,
    String message
) {
    
}
