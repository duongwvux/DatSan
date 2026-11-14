package vn.datsan.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record VerifyEmailRequest(
    @NotBlank 
    String token
) {
    
}
