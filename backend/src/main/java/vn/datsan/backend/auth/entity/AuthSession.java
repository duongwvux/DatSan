package vn.datsan.backend.auth.entity;

import jakarta.persistence.*;
import lombok.Getter;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Getter
@Entity
@Table(name = "auth_sessions")
public class AuthSession {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false, updatable = false)
    private UUID userId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "expires_at", nullable = false, updatable = false)
    private Instant expiresAt;

    @Column(name = "revoked_at")
    private Instant revokedAt;

    @Column(name = "revoke_reason", columnDefinition = "TEXT")
    private String revokeReason;

    protected AuthSession() {
        // JPA
    }

    public AuthSession(
            UUID userId,
            Instant createdAt,
            Instant expiresAt
    ) {
        Objects.requireNonNull(userId, "userId");
        Objects.requireNonNull(createdAt, "createdAt");
        Objects.requireNonNull(expiresAt, "expiresAt");

        if (!expiresAt.isAfter(createdAt)) {
            throw new IllegalArgumentException(
                "expiresAt must be after createdAt"
            );
        }

        this.id = UUID.randomUUID();
        this.userId = userId;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
    }

    public boolean isActiveAt(Instant now) {
        Objects.requireNonNull(now, "now");

        return revokedAt == null
            && !now.isBefore(createdAt)
            && now.isBefore(expiresAt);
    }

    public void revoke(Instant now, String reason) {
        Objects.requireNonNull(now, "now");

        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("reason must not be blank");
        }

        if (revokedAt == null) {
            this.revokedAt = now;
            this.revokeReason = reason;
        }
    }
}