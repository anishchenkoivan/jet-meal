CREATE TABLE users
(
    id            UUID PRIMARY KEY,
    username      TEXT NOT NULL UNIQUE,
    email         TEXT UNIQUE,
    telegram      TEXT UNIQUE,
    "max"         TEXT UNIQUE,
    password_hash TEXT NOT NULL
)
