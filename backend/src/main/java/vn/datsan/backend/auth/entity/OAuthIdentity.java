package vn.datsan.backend.auth.entity;

import jakarta.persistence.*;
import lombok.Getter;

import java.util.Objects;
import java.util.UUID;

@Getter
@Entity
@Table(
    name = "oauth_identities",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uq_oauth_identities_provider_issuer_subject",
            columnNames = {"provider", "issuer", "subject"}
        )
    }
)
public class OAuthIdentity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false, updatable = false)
    private UUID userId;

    @Column(
        name = "provider",
        nullable = false,
        updatable = false,
        columnDefinition = "TEXT"
    )
    private String provider;

    @Column(
        name = "issuer",
        nullable = false,
        updatable = false,
        columnDefinition = "TEXT"
    )
    private String issuer;

    @Column(
        name = "subject",
        nullable = false,
        updatable = false,
        columnDefinition = "TEXT"
    )
    private String subject;

    protected OAuthIdentity() {
        
    }

    public OAuthIdentity(
            UUID userId,
            String provider,
            String issuer,
            String subject
    ) {
        this.id = UUID.randomUUID();
        this.userId = Objects.requireNonNull(userId, "userId");
        this.provider = requireText(provider, "provider");
        this.issuer = requireText(issuer, "issuer");
        this.subject = requireText(subject, "subject");
    }

    private static String requireText(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(field + " must not be blank");
        }

        return value;
    }
}