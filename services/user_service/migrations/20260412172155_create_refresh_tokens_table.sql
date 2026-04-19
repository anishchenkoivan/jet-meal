CREATE TABLE refresh_tokens
(
    id         UUID PRIMARY KEY,
    user_id    UUID      NOT NULL,
    token_hash TEXT      NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at  TIMESTAMP NOT NULL,
    REVOKED    BOOLEAN   NOT NULL DEFAULT FALSE
)
