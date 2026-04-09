#!/usr/bin/env bats

setup_file() {
  mkdir -p build
  cmake -S . -B build -DBUILD_SAMPLE_SERVICE=1
  make -C build
}

@test "sample string" {
  result="$(SAMPLE_STRING=non_default_string ./build/bin/jetenv-sample-service | grep SAMPLE_STRING)"
  [ "$result" == "SAMPLE_STRING=non_default_string" ]
}

@test "sample string default" {
  result="$(./build/bin/jetenv-sample-service | grep SAMPLE_STRING)"
  [ "$result" == "SAMPLE_STRING=default_sample_string" ]
}

@test "sample int" {
  result="$(SAMPLE_INT=666 ./build/bin/jetenv-sample-service | grep SAMPLE_INT)"
  [ "$result" == "SAMPLE_INT=666" ]
}

@test "sample int default" {
  result="$(./build/bin/jetenv-sample-service | grep SAMPLE_INT)"
  [ "$result" == "SAMPLE_INT=228" ]
}

