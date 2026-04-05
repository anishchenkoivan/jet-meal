# Multi-stage Dockerfile for the shdb

# ---- Build Stage ----
FROM ubuntu:latest AS builder

RUN apt-get update && apt-get install -y cmake gcc

WORKDIR /build

COPY src /build/src
COPY contrib /build/contrib
COPY CMakeLists.txt /build

RUN mkdir -p build && cmake -B build && make -C build

# ---- Runtime Stage ----
FROM ubuntu:latest

COPY --from=builder /build/build/bin/businesses-service /usr/local/bin/

EXPOSE 3000

CMD ["businesses-service"]
