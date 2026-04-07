#!/usr/bin/env bats

setup_file() {
  mkdir -p build
  cmake -S . -B build
  make -C build
  ./build/bin/facil-io-router-sample-service &
  sleep 1
}

teardown_file() {
  pkill -f ./build/bin/facil-io-router-sample-service
}

@test "hello get" {
  result="$(curl localhost:8080/hello)"
  [ "$result" == "hello-GET" ]
}

@test "hello post" {
  result="$(curl localhost:8080/hello -X POST)"
  [ "$result" == "hello-POST" ]
}

@test "v1/hello post" {
  result="$(curl localhost:8080/v1/hello -X POST)"
  [ "$result" == "v1-hello-POST" ]
}

@test "non existent path return code" {
  result="$(curl -o /dev/null -s -w '%{http_code}' http://localhost:8080/non-existent-handle)"
  [ "$result" == "404" ]
}

@test "non existent path error message" {
  result="$(curl localhost:8080/non-existent-handle)"
  [ "$result" == "Not Found" ]
}

@test "non existent method return code" {
  result="$(curl -o /dev/null -s -w '%{http_code}' http://localhost:8080/hello -X PATCH)"
  [ "$result" == "404" ]
}

@test "non existent method error message" {
  result="$(curl localhost:8080/hello -X PATCH)"
  [ "$result" == "Not Found" ]
}
