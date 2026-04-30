#!/usr/bin/env bats

source tests/service_client.sh

SAMPLE_CREATE_BODY='{"businessName":"Test Cafe","ownerUserId":"user-1","description":"A test cafe","businessLogoId":"http://example.com/logo.png"}'

@test "create business returns 200" {
  status=$(post_v1_business_status "$SAMPLE_CREATE_BODY")
  [ "$status" = "200" ]
}

@test "create business returns business_id" {
  response=$(post_v1_business "$SAMPLE_CREATE_BODY")
  echo "$response" | grep -q '"business_id"'
}

@test "create business returns numeric id" {
  response=$(post_v1_business "$SAMPLE_CREATE_BODY")
  id=$(echo "$response" | grep -o '"business_id":"[0-9]*"' | grep -o '[0-9]*')
  [ -n "$id" ]
}

@test "get existing business returns 200" {
  id=$(post_v1_business "$SAMPLE_CREATE_BODY" | grep -o '"business_id":"[0-9]*"' | grep -o '[0-9]*')
  status=$(get_v1_business_status "{\"businessId\":\"$id\"}")
  [ "$status" = "200" ]
}

@test "get existing business returns correct fields" {
  id=$(post_v1_business "$SAMPLE_CREATE_BODY" | grep -o '"business_id":"[0-9]*"' | grep -o '[0-9]*')
  response=$(get_v1_business "{\"businessId\":\"$id\"}")
  echo "$response" | grep -q '"businessName":"Test Cafe"'
  echo "$response" | grep -q '"ownerUserId":"user-1"'
  echo "$response" | grep -q '"description":"A test cafe"'
}

@test "get nonexistent business returns 404" {
  status=$(get_v1_business_status '{"businessId":"999999999"}')
  [ "$status" = "404" ]
}

@test "update existing business returns 204" {
  id=$(post_v1_business "$SAMPLE_CREATE_BODY" | grep -o '"business_id":"[0-9]*"' | grep -o '[0-9]*')
  status=$(put_v1_business_status "{\"businessId\":\"$id\",\"businessName\":\"Updated Cafe\",\"ownerUserId\":\"user-1\",\"description\":\"Updated\",\"businessLogoId\":\"someid\"}")
  [ "$status" = "204" ]
}

@test "update nonexistent business returns 404" {
  status=$(put_v1_business_status '{"businessId":"999999999","businessName":"X","ownerUserId":"u","description":"d","businessLogoId":"i"}')
  [ "$status" = "404" ]
}

@test "delete existing business returns 204" {
  id=$(post_v1_business "$SAMPLE_CREATE_BODY" | grep -o '"business_id":"[0-9]*"' | grep -o '[0-9]*')
  status=$(delete_v1_business_status "{\"businessId\":\"$id\"}")
  [ "$status" = "204" ]
}

@test "delete nonexistent business returns 404" {
  status=$(delete_v1_business_status '{"businessId":"999999999"}')
  [ "$status" = "404" ]
}

@test "get after update reflects new values" {
  id=$(post_v1_business "$SAMPLE_CREATE_BODY" | grep -o '"business_id":"[0-9]*"' | grep -o '[0-9]*')
  put_v1_business_status "{\"businessId\":\"$id\",\"businessName\":\"New Name\",\"ownerUserId\":\"user-2\",\"description\":\"New desc\",\"businessLogoId\":\"someId\"}" > /dev/null
  response=$(get_v1_business "{\"businessId\":\"$id\"}")
  echo "$response" | grep -q '"businessName":"New Name"'
  echo "$response" | grep -q '"ownerUserId":"user-2"'
}

@test "get after delete returns 404" {
  id=$(post_v1_business "$SAMPLE_CREATE_BODY" | grep -o '"business_id":"[0-9]*"' | grep -o '[0-9]*')
  delete_v1_business_status "{\"businessId\":\"$id\"}" > /dev/null
  status=$(get_v1_business_status "{\"businessId\":\"$id\"}")
  [ "$status" = "404" ]
}

