# syntax=docker/dockerfile:1

# ---- Build Stage ----
FROM ubuntu:25.10 AS builder

RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    libpq-dev

WORKDIR /build

COPY libraries /build/libraries
COPY services/billing /build/services/billing

WORKDIR /build/services/billing

RUN --mount=type=cache,target=/root/.cache/fetchcontent \
    rm -rf build && \
    cmake -S . -B build -DCMAKE_BUILD_TYPE=Release \
          -DFETCHCONTENT_BASE_DIR=/root/.cache/fetchcontent && \
    cmake --build build --parallel $(nproc)

# ---- Runtime Stage ----
FROM ubuntu:25.10

RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && apt-get install -y libpq5

COPY --from=builder /build/services/billing/build/bin/billing /usr/local/bin/billing

EXPOSE 8080

CMD ["/usr/local/bin/billing"]
