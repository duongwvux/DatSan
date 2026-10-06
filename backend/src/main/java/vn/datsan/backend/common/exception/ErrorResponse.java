package vn.datsan.common.exception;

import java.time.Instant;
import java.util.List;

public record ErrorResponse(
    String code,
    String message,
    Instant timeStamp,
    String path,
    String traceId,
    List<FieldErrorResponse> errors
) {

}
