#include "config.h"

#include "fio_router.h"
#include "http.h"

int main(void) {
  http_listen(DEFAULT_PORT, NULL, .on_request = fio_router_on_request_route, .log = DEFAULT_LOG_LEVEL);
  fio_start(.threads = DEFAULT_THREADS);
}

