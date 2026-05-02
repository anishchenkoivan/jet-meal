#include "config.h"

#include "config.h"
#include "handlers.h"

#include "fio_router.h"
#include "http.h"

int main(void) {
  init_handlers_global_state();

  fio_router_register_callback(healthcheck_handler, "/health", HTTP_GET);

  fio_router_register_callback(v1_create_business_handler, "/v1/business", HTTP_POST);
  fio_router_register_callback(v1_update_business_handler, "/v1/business", HTTP_PUT);
  fio_router_register_callback(v1_delete_business_handler, "/v1/business", HTTP_DELETE);
  fio_router_register_callback(v1_get_business_handler, "/v1/business/get", HTTP_POST);

  fio_router_register_callback(v1_list_meals_handler, "/v1/meals/list", HTTP_POST);

  fio_router_register_callback(v1_add_meal_handler, "/v1/menu/meal", HTTP_POST);
  fio_router_register_callback(v1_delete_meal_handler, "/v1/menu/meal", HTTP_DELETE);

  http_listen(get_service_port(), NULL, .on_request = fio_router_on_request_route, .log = LOG_LEVEL);
  fio_start(.threads = get_service_threads());
}

