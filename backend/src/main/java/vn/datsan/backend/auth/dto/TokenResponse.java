package vn.datsan.backend.auth.dto;

public record TokenResponse(
    String accessToken,
    String tokenTypes,
    long expiresIn
) {

}