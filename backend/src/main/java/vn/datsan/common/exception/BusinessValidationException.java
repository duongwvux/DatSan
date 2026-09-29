package vn.datsan.common.exception;

import java.util.List;

public class BusinessValidationException extends RuntimeException {
    private final List<FieldErrorResponse> errors;

    public BusinessValidationException(List<FieldErrorResponse> errors) {
        super("Dữ liệu không hơp lệ!");
        this.errors = errors;
    }

    public List<FieldErrorResponse> getErrors() {
        return errors;
    }
}
