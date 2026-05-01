#!/usr/bin/env bats

source tests/service_client.sh

SAMPLE_CREATE_BODY='{"businessName":"Test Cafe","ownerUserId":"user-1","description":"A test cafe","businessLogoId":"http://example.com/logo.png"}'
SAMPLE_MEAL='{"mealName":"Burger","mealDescription":"A delicious burger","mealPictureId":"pic-1","price":999}'

@test "add meal to existing business returns 200" {
  id=$(post_v1_business "$SAMPLE_CREATE_BODY" | grep -o '"business_id":"[0-9]*"' | grep -o '[0-9]*')
  status=$(post_v1_menu_meal_status "{\"businessId\":\"$id\",\"meal\":$SAMPLE_MEAL}")
  [ "$status" = "200" ]
}

@test "add meal returns meal_id" {
  id=$(post_v1_business "$SAMPLE_CREATE_BODY" | grep -o '"business_id":"[0-9]*"' | grep -o '[0-9]*')
  response=$(post_v1_menu_meal "{\"businessId\":\"$id\",\"meal\":$SAMPLE_MEAL}")
  echo "$response" | grep -q '"meal_id"'
}

@test "add meal returns numeric meal_id" {
  id=$(post_v1_business "$SAMPLE_CREATE_BODY" | grep -o '"business_id":"[0-9]*"' | grep -o '[0-9]*')
  response=$(post_v1_menu_meal "{\"businessId\":\"$id\",\"meal\":$SAMPLE_MEAL}")
  meal_id=$(echo "$response" | grep -o '"meal_id":"[0-9]*"' | grep -o '[0-9]*')
  [ -n "$meal_id" ]
}

@test "add meal returns menu with meal name" {
  id=$(post_v1_business "$SAMPLE_CREATE_BODY" | grep -o '"business_id":"[0-9]*"' | grep -o '[0-9]*')
  response=$(post_v1_menu_meal "{\"businessId\":\"$id\",\"meal\":$SAMPLE_MEAL}")
  echo "$response" | grep -q '"mealName":"Burger"'
}

@test "add meal to nonexistent business returns 404" {
  status=$(post_v1_menu_meal_status "{\"businessId\":\"999999999\",\"meal\":$SAMPLE_MEAL}")
  [ "$status" = "404" ]
}

@test "search meals returns 200" {
  id=$(post_v1_business "$SAMPLE_CREATE_BODY" | grep -o '"business_id":"[0-9]*"' | grep -o '[0-9]*')
  status=$(post_v1_meals_search_status "{\"businessId\":\"$id\"}")
  [ "$status" = "200" ]
}

@test "search meals returns empty list for business with no meals" {
  id=$(post_v1_business "$SAMPLE_CREATE_BODY" | grep -o '"business_id":"[0-9]*"' | grep -o '[0-9]*')
  response=$(post_v1_meals_search "{\"businessId\":\"$id\"}")
  echo "$response" | grep -q '"meals":\[\]'
}

@test "search meals returns added meal" {
  id=$(post_v1_business "$SAMPLE_CREATE_BODY" | grep -o '"business_id":"[0-9]*"' | grep -o '[0-9]*')
  post_v1_menu_meal "{\"businessId\":\"$id\",\"meal\":$SAMPLE_MEAL}" > /dev/null
  response=$(post_v1_meals_search "{\"businessId\":\"$id\"}")
  echo "$response" | grep -q '"mealName":"Burger"'
}

@test "search meals does not return meals from other businesses" {
  id1=$(post_v1_business "$SAMPLE_CREATE_BODY" | grep -o '"business_id":"[0-9]*"' | grep -o '[0-9]*')
  id2=$(post_v1_business "$SAMPLE_CREATE_BODY" | grep -o '"business_id":"[0-9]*"' | grep -o '[0-9]*')
  post_v1_menu_meal "{\"businessId\":\"$id1\",\"meal\":$SAMPLE_MEAL}" > /dev/null
  response=$(post_v1_meals_search "{\"businessId\":\"$id2\"}")
  echo "$response" | grep -q '"meals":\[\]'
}

@test "delete meal returns 204" {
  id=$(post_v1_business "$SAMPLE_CREATE_BODY" | grep -o '"business_id":"[0-9]*"' | grep -o '[0-9]*')
  meal_id=$(post_v1_menu_meal "{\"businessId\":\"$id\",\"meal\":$SAMPLE_MEAL}" | grep -o '"meal_id":"[0-9]*"' | grep -o '[0-9]*')
  status=$(delete_v1_menu_meal_status "{\"businessId\":\"$id\",\"mealId\":\"$meal_id\"}")
  [ "$status" = "204" ]
}
