package vn.datsan.backend.auth.service;

import java.time.Clock;
import java.util.Locale;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.security.auth.message.AuthException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import vn.datsan.backend.auth.dto.PasswordPolicy;
import vn.datsan.backend.auth.dto.RegisterRequest;
import vn.datsan.backend.auth.entity.OneTimeToken;
import vn.datsan.backend.auth.entity.PasswordCredential;
import vn.datsan.backend.auth.security.OpaqueTokenService;

@Service 
@RequiredArgsConstructor 
public class RegistrationService {
    private final UserAccountService users;
    private final PasswordCredential credentials;
    private final OneTimeToken tokens;
    private final VerificationEmailOutbox emailOutBox;
    private final PasswordEncoder passwordEncoder;
    private final OpaqueTokenService opaqueTokens;
    private final Clock clock;

    @Transactional 
    public void register(RegisterRequest request) {
        PasswordPolicy.validate(request.password());

        String email = request.email().trim().toLowerCase(Locale.ROOT);

        if (users.existsByNormalizedEmail(email)) {
            throw new AuthException(
                HttpStatus.CONFLICT,
                "EMAIL_ALREADY_EXISTS",
                "Email đã đực sử dụng."
            );
        }
        
        UUID userId = users.createLocalPlayer(
            request.fullName().trim(),
            email,
            request.phone(),
        );

        credentials.save(PasswordCredential.create)
    }
}
