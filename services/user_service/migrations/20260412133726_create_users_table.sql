CREATE TABLE users
(
    id            UUID PRIMARY KEY,
    username      TEXT NOT NULL UNIQUE,
    notification_context JSONB,
    password_hash TEXT NOT NULL
);
