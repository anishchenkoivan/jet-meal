#include "config.h"

#include "config.h"
#include "handlers.h"
#include "postgres.h"

#include "fio_router.h"
#include "http.h"

int main(void) {
  postgres_aply_migration(get_postgres_dsn());
  init_handlers_global_state();

  fio_router_register_callback(v1_create_business_callback, "/v1/business", HTTP_POST);
  fio_router_register_callback(v1_update_business_callback, "/v1/business", HTTP_PUT);
  fio_router_register_callback(v1_delete_business_callback, "/v1/business", HTTP_DELETE);
  fio_router_register_callback(v1_get_business_callback, "/v1/business", HTTP_GET);

  http_listen(get_service_port(), NULL, .on_request = fio_router_on_request_route, .log = LOG_LEVEL);
  fio_start(.threads = get_service_threads());
}

