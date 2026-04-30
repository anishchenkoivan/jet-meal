#!/usr/bin/env bash

TEST_PORT=18080
BASE_URL="http://localhost:${TEST_PORT}"

healthcheck_status() {
  curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/health"
}

post_v1_business() {
  curl -s -X POST "${BASE_URL}/v1/business" -H "Content-Type: application/json" -d "$1"
}

post_v1_business_status() {
  curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE_URL}/v1/business" -H "Content-Type: application/json" -d "$1"
}

put_v1_business_status() {
  curl -s -o /dev/null -w "%{http_code}" -X PUT "${BASE_URL}/v1/business" -H "Content-Type: application/json" -d "$1"
}

delete_v1_business_status() {
  curl -s -o /dev/null -w "%{http_code}" -X DELETE "${BASE_URL}/v1/business" -H "Content-Type: application/json" -d "$1"
}

get_v1_business() {
  curl -s "${BASE_URL}/v1/business/get" -X POST -H "Content-Type: application/json" -d "$1"
}

get_v1_business_status() {
  curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE_URL}/v1/business/get" -H "Content-Type: application/json" -d "$1"
}

setup_file() {
  docker compose -f tests/docker-compose.yml up --build -d > /dev/null

  retries=120
  while [ "$(healthcheck_status)" != "200" ] && [ $retries -gt 0 ]; do
    sleep 0.5
    retries=$((retries - 1))
  done
  
  if [ "$(healthcheck_status)" != "200" ]; then
    echo "Error: service did not started" >&2 
    exit 1
  else
    echo "Info: service up" >&2 
  fi
}

teardown_file() {
  docker compose -f tests/docker-compose.yml down
}

