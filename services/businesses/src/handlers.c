#include "handlers.h"

#include "assert.h"
#include "codegen_api.h"
#include "config.h"
#include "fiobj.h"
#include "fiobject.h"
#include "http.h"
#include "irepository.h"
#include "postgres.h"

#include <stdio.h>
#include <stdlib.h>

postgres_businesses_repository_t g_business_repository;
postgres_meals_repository_t g_meals_repository;

static FIOBJ request_body_to_hashmap(FIOBJ io) {
  assert(FIOBJ_TYPE_IS(io, FIOBJ_T_DATA));

  size_t len = fiobj_data_len(io);
  fio_str_info_s body_str = fiobj_data_read(io, len);

  FIOBJ res = FIOBJ_INVALID;
  fiobj_json2obj(&res, body_str.data, body_str.len);

  assert(FIOBJ_TYPE_IS(res, FIOBJ_T_HASH));

  return res;
}

static void write_fiobj_response(http_s *request, FIOBJ response) {
  FIOBJ json = fiobj_obj2json(response, 1);
  fio_str_info_s str = fiobj_obj2cstr(json);

  http_send_body(request, str.data, str.len);

  fiobj_free(json);
  fiobj_free(response);
}

void init_handlers_global_state() {
  g_business_repository =
      init_postgres_businesses_repository(get_postgres_dsn());
  g_meals_repository = init_postgres_meals_repository(get_postgres_dsn());
}

void healthcheck_handler(http_s *request) {
  static const char *response = "OK";
  http_send_body(request, (void *)response, strlen(response));
}

void v1_create_business_handler(http_s *request) {
  if (!FIOBJ_TYPE_IS(request->body, FIOBJ_T_DATA)) {
    http_send_error(request, HTTP_INVALID_REQUEST);
    return;
  }

  FIOBJ body = request_body_to_hashmap(request->body);

  api_gen_v1_create_business_request_t request_body =
      api_gen_v1_create_business_request_parse_from_fiobj(body);
  fiobj_free(body);

  api_gen_business_t new_business = {
      .businessName = request_body.businessName,
      .ownerUserId = request_body.ownerUserId,
      .description = request_body.description,
      .businessLogoId = request_body.businessLogoId,
  };

  assert(g_business_repository.vtable.insert_business != NULL);
  size_t id = g_business_repository.vtable.insert_business(
      (void *)&g_business_repository, &new_business);

  api_gen_v1_create_business_request_cleanup(request_body);

  if (id == -1) {
    http_send_error(request, HTTP_INTERNAL_SERVER_ERROR);
    return;
  }

  char str_id[ID_LEN];
  snprintf(str_id, sizeof(str_id), "%zu", id);

  api_gen_v1_create_business_response_t response = {strdup(str_id)};
  FIOBJ response_fiobj =
      api_gen_v1_create_business_response_serialize_to_fiobj(response);

  write_fiobj_response(request, response_fiobj);

  api_gen_v1_create_business_response_cleanup(response);
}

void v1_update_business_handler(http_s *request) {
  if (!FIOBJ_TYPE_IS(request->body, FIOBJ_T_DATA)) {
    http_send_error(request, HTTP_INVALID_REQUEST);
    return;
  }

  FIOBJ body = request_body_to_hashmap(request->body);

  api_gen_v1_update_business_request_t request_body =
      api_gen_v1_update_business_request_parse_from_fiobj(body);
  fiobj_free(body);

  api_gen_business_t new_business = {
      .businessName = request_body.businessName,
      .ownerUserId = request_body.ownerUserId,
      .description = request_body.description,
      .businessLogoId = request_body.businessLogoId,
  };

  if (g_business_repository.vtable.insert_business == NULL) {
    http_send_error(request, HTTP_INTERNAL_SERVER_ERROR);
  }

  size_t rows_updated = g_business_repository.vtable.update_business(
      (void *)&g_business_repository, atoi(request_body.businessId),
      &new_business);

  api_gen_v1_update_business_request_cleanup(request_body);

  if (rows_updated == 1) {
    http_send_error(request, HTTP_NO_CONTENT);
  } else if (rows_updated == 0) {
    http_send_error(request, HTTP_NOT_FOUND);
  } else if (rows_updated == DB_ERROR) {
    http_send_error(request, HTTP_INTERNAL_SERVER_ERROR);
  } else {
    // Unreachable
    assert(false);
  }
}

void v1_delete_business_handler(http_s *request) {
  if (!FIOBJ_TYPE_IS(request->body, FIOBJ_T_DATA)) {
    http_send_error(request, HTTP_INVALID_REQUEST);
    return;
  }

  FIOBJ body = request_body_to_hashmap(request->body);

  api_gen_v1_delete_business_request_t request_body =
      api_gen_v1_delete_business_request_parse_from_fiobj(body);
  fiobj_free(body);

  if (g_business_repository.vtable.delete_business == NULL) {
    http_send_error(request, HTTP_INTERNAL_SERVER_ERROR);
  }

  size_t rows_deleted = g_business_repository.vtable.delete_business(
      (void *)&g_business_repository, atoi(request_body.businessId));

  api_gen_v1_delete_business_request_cleanup(request_body);

  if (rows_deleted == 1) {
    http_send_error(request, HTTP_NO_CONTENT);
  } else if (rows_deleted == 0) {
    http_send_error(request, HTTP_NOT_FOUND);
  } else if (rows_deleted == DB_ERROR) {
    http_send_error(request, HTTP_INTERNAL_SERVER_ERROR);
  } else {
    // Unreachable
    assert(false);
  }
}

void v1_search_meals_handler(http_s *request) {
  if (!FIOBJ_TYPE_IS(request->body, FIOBJ_T_DATA)) {
    http_send_error(request, HTTP_INVALID_REQUEST);
    return;
  }

  FIOBJ body = request_body_to_hashmap(request->body);

  api_gen_v1_search_meals_request_t request_body =
      api_gen_v1_search_meals_request_parse_from_fiobj(body);
  fiobj_free(body);

  assert(g_meals_repository.vtable.get_meals_by_business != NULL);
  api_gen_meals_list_t meals = g_meals_repository.vtable.get_meals_by_business(
      (void *)&g_meals_repository, atoi(request_body.businessId));

  api_gen_v1_search_meals_request_cleanup(request_body);

  if (meals.size == DB_ERROR) {
    http_send_error(request, HTTP_INTERNAL_SERVER_ERROR);
    return;
  }

  api_gen_v1_search_meals_response_t response = {.meals = meals};
  FIOBJ response_fiobj =
      api_gen_v1_search_meals_response_serialize_to_fiobj(response);

  write_fiobj_response(request, response_fiobj);

  api_gen_v1_search_meals_response_cleanup(response);
}

void v1_add_meal_handler(http_s *request) {
  if (!FIOBJ_TYPE_IS(request->body, FIOBJ_T_DATA)) {
    http_send_error(request, HTTP_INVALID_REQUEST);
    return;
  }

  FIOBJ body = request_body_to_hashmap(request->body);

  api_gen_v1_add_meal_to_menu_request_t request_body =
      api_gen_v1_add_meal_to_menu_request_parse_from_fiobj(body);
  fiobj_free(body);

  assert(g_meals_repository.vtable.insert_meal != NULL);
  size_t id = g_meals_repository.vtable.insert_meal(
      (void *)&g_meals_repository, atoi(request_body.businessId),
      &request_body.meal);

  if (id == DB_ERROR) {
    api_gen_v1_add_meal_to_menu_request_cleanup(request_body);
    http_send_error(request, HTTP_NOT_FOUND);
    return;
  }

  char str_id[ID_LEN];
  snprintf(str_id, sizeof(str_id), "%zu", id);

  api_gen_meal_t response_meal = {
      .mealName = request_body.meal.mealName,
      .mealDescription = request_body.meal.mealDescription,
      .mealPictureId = request_body.meal.mealPictureId,
  };
  api_gen_meals_list_t meals = {.buffer = &response_meal, .size = 1};
  api_gen_menu_t menu = {.meals = meals};
  api_gen_v1_add_meal_to_menu_response_t response = {
      .meal_id = str_id,
      .menu = menu,
  };

  FIOBJ response_fiobj =
      api_gen_v1_add_meal_to_menu_response_serialize_to_fiobj(response);

  write_fiobj_response(request, response_fiobj);

  api_gen_v1_add_meal_to_menu_request_cleanup(request_body);
}

void v1_delete_meal_handler(http_s *request) {
  if (!FIOBJ_TYPE_IS(request->body, FIOBJ_T_DATA)) {
    http_send_error(request, HTTP_INVALID_REQUEST);
    return;
  }

  FIOBJ body = request_body_to_hashmap(request->body);

  api_gen_v1_remove_meal_from_menu_request_t request_body =
      api_gen_v1_remove_meal_from_menu_request_parse_from_fiobj(body);
  fiobj_free(body);

  assert(g_meals_repository.vtable.delete_meal != NULL);
  size_t rows = g_meals_repository.vtable.delete_meal(
      (void *)&g_meals_repository, atoi(request_body.businessId),
      atoi(request_body.mealId));

  api_gen_v1_remove_meal_from_menu_request_cleanup(request_body);

  if (rows == 1) {
    http_send_error(request, HTTP_NO_CONTENT);
  } else if (rows == 0) {
    http_send_error(request, HTTP_NOT_FOUND);
  } else if (rows == DB_ERROR) {
    http_send_error(request, HTTP_INTERNAL_SERVER_ERROR);
  } else {
    // Unreachable
    assert(false);
  }
}

void v1_get_business_handler(http_s *request) {
  if (!FIOBJ_TYPE_IS(request->body, FIOBJ_T_DATA)) {
    http_send_error(request, HTTP_INVALID_REQUEST);
    return;
  }

  FIOBJ body = request_body_to_hashmap(request->body);

  api_gen_v1_get_business_request_t request_body =
      api_gen_v1_get_business_request_parse_from_fiobj(body);
  fiobj_free(body);

  assert(g_business_repository.vtable.get_business != NULL);

  api_gen_business_t business = g_business_repository.vtable.get_business(
      (void *)&g_business_repository, atoi(request_body.businessId));

  api_gen_v1_get_business_request_cleanup(request_body);

  if (business.businessId == NULL) {
    http_send_error(request, HTTP_NOT_FOUND);
    return;
  }

  api_gen_v1_get_business_response_t response;
  response.business = business;

  FIOBJ response_fiobj =
      api_gen_v1_get_business_response_serialize_to_fiobj(response);

  write_fiobj_response(request, response_fiobj);

  api_gen_v1_get_business_response_cleanup(response);
}
