package vn.datsan.backend.auth.entity;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;

@Getter 
@Entity 
@Table(name = "password_credentials")
public class PasswordCredential {
    @Id 
    @Column(name = "user_id", nullable = false, updatable = false)
    private UUID userId;

    @Column(name = "password_hash", nullable = false, columnDefinition = "TEXT")
    private String passwordHash;

    @Column(name = "password_changed_at", nullable = false)
    private Instant passwordChangedAt;

    protected PasswordCredential() {

    }

    public PasswordCredential(
        UUID userId,
        String passwordHash,
        Instant now
    ) {
        this.userId = Objects.requireNonNull(userId, "userId");
        changePassword(passwordHash, now);
    }

    public void changePassword(String passwordHash, Instant now) {
        Objects.requireNonNull(passwordHash, "passwordHash");
        Objects.requireNonNull(now, "now");

        if (passwordHash.isBlank()) {
            throw new IllegalArgumentException("passwordHash must not be blank");
        }

        this.passwordHash = passwordHash;
        this.passwordChangedAt = now;
    }
}