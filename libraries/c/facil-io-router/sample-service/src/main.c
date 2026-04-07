#include "fio_router.h"
#include "http.h"
#include "fio.h"

#include <string.h>

#define STR_WITH_LEN(message) message "\r\n", strlen(message)

static void on_request_hello_post(http_s *request) {
  http_send_body(request, STR_WITH_LEN("hello-POST"));
}

static void on_request_hello_get(http_s *request) {
  http_send_body(request, STR_WITH_LEN("hello-GET"));
}

static void on_request_v1_hello_post(http_s *request) {
  http_send_body(request, STR_WITH_LEN("v1-hello-POST"));
}

int main(void) {
  fio_router_register_callback(on_request_hello_post, "/hello", HTTP_POST);
  fio_router_register_callback(on_request_hello_get, "/hello", HTTP_GET);
  fio_router_register_callback(on_request_v1_hello_post, "/v1/hello", HTTP_POST);

  http_listen("8080", NULL, .on_request = fio_router_on_request_route, .log = FIO_LOG_LEVEL_DEBUG);
  fio_start(.threads = 1);
}

