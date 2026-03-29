# Multi-stage Dockerfile for the shdb

# ---- Build Stage ----
FROM ubuntu:25.10 AS builder

RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git

WORKDIR /app

COPY src /app/src
COPY blob /app/blob
COPY CMakeLists.txt /app/

RUN cmake -S . -B build -DCMAKE_BUILD_TYPE=Release && cmake --build build --parallel $(nproc)

# ---- Runtime Stage ----
FROM ubuntu:25.10

COPY --from=builder /app/build/bin/shdb /usr/local/bin/shdb

CMD ["/usr/local/bin/shdb"]
