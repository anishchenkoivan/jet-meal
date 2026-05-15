# Build stage
FROM rust:latest AS builder

WORKDIR /build

COPY Cargo.toml Cargo.lock* ./
COPY src/ src/
COPY build.rs ./
COPY .cargo/ .cargo/
COPY config/ config/

RUN cargo build --release && \
    cp target/release/user_service /user_service

# Runtime stage
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    libssl3 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /user_service /usr/local/bin/
COPY --from=builder /build/config/config.toml /app/config/config.toml

WORKDIR /app

EXPOSE 8080

CMD ["user_service"]
