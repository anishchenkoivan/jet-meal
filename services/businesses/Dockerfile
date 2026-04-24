# Multi-stage Dockerfile for the shdb

# ---- Build Stage ----
FROM ubuntu:latest AS builder

RUN apt-get update && apt-get install -y cmake gcc libpq-dev

WORKDIR /build

COPY libraries /build/libraries
COPY services/businesses /build/services/businesses

WORKDIR /build/services/businesses

RUN rm -rf build && mkdir -p build && cmake -B build && make -C build

# ---- Runtime Stage ----
FROM ubuntu:latest

RUN apt-get update && apt-get install -y libpq-dev

COPY --from=builder /build/services/businesses/build/bin/businesses-service /usr/local/bin/

EXPOSE 3000

CMD ["businesses-service"]
