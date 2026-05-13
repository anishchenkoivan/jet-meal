#!/usr/bin/env bats

source tests/service_client.sh

SAMPLE_CREATE_BODY='{"businessName":"Test Cafe","ownerUserId":"user-1","description":"A test cafe","businessLogoId":"http://example.com/logo.png"}'
SAMPLE_MEAL='"mealName":"Burger","mealDescription":"A delicious burger","mealPictureId":"pic-1","price":999'

@test "add meal to existing business returns 200" {
  id=$(post_v1_business "$SAMPLE_CREATE_BODY" | grep -o '"businessId":"[0-9]*"' | grep -o '[0-9]*')
  status=$(post_v1_menu_meal_status "{\"businessId\":\"$id\",$SAMPLE_MEAL}")
  [ "$status" = "200" ]
}

@test "add meal returns mealId" {
  id=$(post_v1_business "$SAMPLE_CREATE_BODY" | grep -o '"businessId":"[0-9]*"' | grep -o '[0-9]*')
  response=$(post_v1_menu_meal "{\"businessId\":\"$id\",$SAMPLE_MEAL}")
  echo "$response" | grep -q '"mealId"'
}

@test "add meal returns numeric mealId" {
  id=$(post_v1_business "$SAMPLE_CREATE_BODY" | grep -o '"businessId":"[0-9]*"' | grep -o '[0-9]*')
  response=$(post_v1_menu_meal "{\"businessId\":\"$id\",$SAMPLE_MEAL}")
  mealId=$(echo "$response" | grep -o '"mealId":"[0-9]*"' | grep -o '[0-9]*')
  [ -n "$mealId" ]
}

@test "add meal to nonexistent business returns 404" {
  status=$(post_v1_menu_meal_status "{\"businessId\":\"999999999\",$SAMPLE_MEAL}")
  [ "$status" = "404" ]
}

@test "list meals returns 200" {
  id=$(post_v1_business "$SAMPLE_CREATE_BODY" | grep -o '"businessId":"[0-9]*"' | grep -o '[0-9]*')
  status=$(post_v1_meals_list_status "{\"businessId\":\"$id\"}")
  [ "$status" = "200" ]
}

@test "list meals returns empty list for business with no meals" {
  id=$(post_v1_business "$SAMPLE_CREATE_BODY" | grep -o '"businessId":"[0-9]*"' | grep -o '[0-9]*')
  response=$(post_v1_meals_list "{\"businessId\":\"$id\"}")
  echo "$response" | grep -q '"meals":\[\]'
}

@test "list meals returns added meal" {
  id=$(post_v1_business "$SAMPLE_CREATE_BODY" | grep -o '"businessId":"[0-9]*"' | grep -o '[0-9]*')
  post_v1_menu_meal "{\"businessId\":\"$id\",$SAMPLE_MEAL}" > /dev/null
  response=$(post_v1_meals_list "{\"businessId\":\"$id\"}")
  echo "$response" > ~/jopa
  echo "$response" | grep -q '"mealName":"Burger"'
}

@test "list meals does not return meals from other businesses" {
  id1=$(post_v1_business "$SAMPLE_CREATE_BODY" | grep -o '"businessId":"[0-9]*"' | grep -o '[0-9]*')
  id2=$(post_v1_business "$SAMPLE_CREATE_BODY" | grep -o '"businessId":"[0-9]*"' | grep -o '[0-9]*')
  post_v1_menu_meal "{\"businessId\":\"$id1\",$SAMPLE_MEAL}" > /dev/null
  response=$(post_v1_meals_list "{\"businessId\":\"$id2\"}")
  echo "$response" | grep -q '"meals":\[\]'
}

@test "delete meal returns 204" {
  id=$(post_v1_business "$SAMPLE_CREATE_BODY" | grep -o '"businessId":"[0-9]*"' | grep -o '[0-9]*')
  mealId=$(post_v1_menu_meal "{\"businessId\":\"$id\",$SAMPLE_MEAL}" | grep -o '"mealId":"[0-9]*"' | grep -o '[0-9]*')
  status=$(delete_v1_menu_meal_status "{\"businessId\":\"$id\",\"mealId\":\"$mealId\"}")
  [ "$status" = "204" ]
}
