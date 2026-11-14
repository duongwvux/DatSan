package vn.datsan.backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank @Size(min = 2, max = 100)
    String fullName,

    @NotBlank @Email @Size(max = 254)
    String email,
    
    @NotBlank 
    String phone,

    @NotBlank 
    String password
) {
    
} 
