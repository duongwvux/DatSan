package vn.datsan.backend.auth.entity;

import jakarta.persistence.*;
import lombok.Getter;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Getter
@Entity
@Table(
    name = "refresh_tokens",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uq_refresh_tokens_token_hash",
            columnNames = "token_hash"
        )
    }
)
public class RefreshToken {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "session_id", nullable = false, updatable = false)
    private UUID sessionId;

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

    protected RefreshToken() {
        // JPA
    }

    public RefreshToken(
            UUID sessionId,
            String tokenHash,
            Instant expiresAt
    ) {
        this.sessionId = Objects.requireNonNull(sessionId, "sessionId");
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
                "Refresh token already consumed"
            );
        }

        if (isExpiredAt(now)) {
            throw new IllegalStateException("Refresh token expired");
        }

        this.consumedAt = now;
    }
}