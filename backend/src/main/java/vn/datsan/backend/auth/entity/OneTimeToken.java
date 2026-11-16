package vn.datsan.backend.auth.entity;

import jakarta.persistence.*;
import lombok.Getter;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Getter
@Entity
@Table(
    name = "one_time_tokens",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uq_one_time_tokens_token_hash",
            columnNames = "token_hash"
        )
    }
)
public class OneTimeToken {

    public enum Purpose {
        EMAIL_VERIFICATION,
        PASSWORD_RESET
    }

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false, updatable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(
        name = "purpose",
        nullable = false,
        updatable = false,
        columnDefinition = "TEXT"
    )
    private Purpose purpose;

    @Column(
        name = "token_hash",
        nullable = false,
        updatable = false,
        columnDefinition = "TEXT"
    )
    private String tokenHash;

    @Column(name = "expires_at", nullable = false, updatable = false)
    private Instant expiresAt;

    @Column(name = "consumed_at")
    private Instant consumedAt;

    protected OneTimeToken() {
        // JPA
    }

    public OneTimeToken(
            UUID userId,
            Purpose purpose,
            String tokenHash,
            Instant expiresAt
    ) {
        this.userId = Objects.requireNonNull(userId, "userId");
        this.purpose = Objects.requireNonNull(purpose, "purpose");
        this.expiresAt = Objects.requireNonNull(expiresAt, "expiresAt");

        if (tokenHash == null || tokenHash.isBlank()) {
            throw new IllegalArgumentException("tokenHash must not be blank");
        }

        this.id = UUID.randomUUID();
        this.tokenHash = tokenHash;
    }

    public boolean isConsumed() {
        return consumedAt != null;
    }

    public boolean isExpiredAt(Instant now) {
        Objects.requireNonNull(now, "now");
        return !now.isBefore(expiresAt);
    }

    public void consume(Instant now) {
        Objects.requireNonNull(now, "now");

        if (isConsumed()) {
            throw new IllegalStateException(
                "One-time token already consumed"
            );
        }

        if (isExpiredAt(now)) {
            throw new IllegalStateException("One-time token expired");
        }

        this.consumedAt = now;
    }
}