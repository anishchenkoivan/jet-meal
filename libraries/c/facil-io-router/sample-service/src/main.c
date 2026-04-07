#include "fio_router.h"
#include "http.h"

#include <stdio.h>

static void on_request_hello_post(http_s *request) {
  http_send_body(request, "hello-POST!\r\n", 10);
}

static void on_request_hello_get(http_s *request) {
  http_send_body(request, "hello-GET!\r\n", 9);
}

static void on_request_v1_hello_post(http_s *request) {
  http_send_body(request, "v1-hello-POST!\r\n", 13);
}

FIOBJ HTTP_HEADER_X_DATA;

int main(void) {
  printf("Registrating callbacks...\n");

  fio_router_register_callback(on_request_hello_post, "/hello", HTTP_POST);
  fio_router_register_callback(on_request_hello_get, "/hello", HTTP_GET);
  fio_router_register_callback(on_request_v1_hello_post, "/v1/hello", HTTP_POST);

  printf("Starting service...\n");
  http_listen("8080", NULL, .on_request = fio_router_on_request_route, .log = 1);
  fio_start(.threads = 3);

  printf("Exiting service...\n");
  fiobj_free(HTTP_HEADER_X_DATA);
}

