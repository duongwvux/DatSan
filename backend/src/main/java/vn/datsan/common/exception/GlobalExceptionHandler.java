package vn.datsan.common.exception;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger log = 
            LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
        MethodArgumentNotValidException ex,
        HttpServletRequest request
    ) {
        List<FieldErrorResponse> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> new FieldErrorResponse(
                    error.getField(), 
                    mapValidationCode(error.getCode()), 
                    error.getDefaultMessage() != null ? error.getDefaultMessage() : "Giá trị không hợp lệ"
                )).toList();
        
            return buildResponse(
                HttpStatus.BAD_REQUEST,
                "Validation_Failed",
                "Dữ liệu gửi lên không hợp lệ",
                request,
                errors
            );
    }

    @ExceptionHandler(BusinessValidationException.class)
    public ResponseEntity<ErrorResponse> handleBusinessValidation(
            BusinessValidationException ex,
            HttpServletRequest request
    ) {
        return buildResponse(
                HttpStatus.BAD_REQUEST,
                "VALIDATION_FAILED",
                ex.getMessage(),
                request,
                ex.getErrors()
        );
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(
            ResourceNotFoundException ex,
            HttpServletRequest request
    ) {
        return buildResponse(
                HttpStatus.NOT_FOUND,
                "RESOURCE_NOT_FOUND",
                ex.getMessage(),
                request,
                List.of()
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(
            Exception ex,
            HttpServletRequest request
    ) {
        return buildResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "INTERNAL_SERVER_ERROR",
                "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.",
                request,
                List.of(),
                ex
        );
    }

    private ResponseEntity<ErrorResponse> buildResponse(
        HttpStatus status,
        String code,
        String message,
        HttpServletRequest request,
        List<FieldErrorResponse> errors
    ) {
        return buildResponse(status, code, message, request, errors, null);
    }

    private ResponseEntity<ErrorResponse> buildResponse(
        HttpStatus status,
        String code,
        String message,
        HttpServletRequest request,
        List<FieldErrorResponse> errors,
        Exception cause
    ) {
        String traceId = MDC.get("traceId");

        // Dự phòng khi ứng dụng chưa cấu hình tracing.
        if (traceId == null || traceId.isBlank()) {
            traceId = UUID.randomUUID().toString().replace("-", "");
        }

        if (cause != null) {
            log.error(
                    "Request failed: traceId={}, path={}",
                    traceId,
                    request.getRequestURI(),
                    cause
            );
        } else {
            log.warn(
                    "Request rejected: traceId={}, path={}, code={}",
                    traceId,
                    request.getRequestURI(),
                    code
            );
        }

        ErrorResponse body = new ErrorResponse(
                code,
                message,
                Instant.now(),
                request.getRequestURI(),
                traceId,
                errors
        );

        return ResponseEntity.status(status).body(body);
    }

    private String mapValidationCode(String constraint) {
        if (constraint == null) {
            return "INVALID_VALUE";
        }

        return switch (constraint) {
            case "NotNull", "NotBlank", "NotEmpty" -> "REQUIRED";
            case "Size" -> "INVALID_SIZE";
            case "Min", "Max", "DecimalMin", "DecimalMax",
                 "Positive", "PositiveOrZero",
                 "Negative", "NegativeOrZero" -> "OUT_OF_RANGE";
            case "Email", "Pattern" -> "INVALID_FORMAT";
            case "Future", "FutureOrPresent",
                 "Past", "PastOrPresent" -> "INVALID_DATE";
            default -> "INVALID_VALUE";
        };
    }
}
