#include "config.h"

#include "dispatch.h"
#include "http.h"

FIOBJ g_handlers;

static void on_request_hello_post(http_s *request) {
  http_send_body(request, "Hello World, POST!\r\n", 18);
}

static void on_request_hello_get(http_s *request) {
  http_send_body(request, "Hello World, GET!\r\n", 17);
}

static void on_request_v1_hello_post(http_s *request) {
  http_send_body(request, "Hello World, v1 POST!\r\n", 20);
}

FIOBJ HTTP_HEADER_X_DATA;

int main(void) {
  DispatchRegister(on_request_hello_post, "/hello", HTTP_POST);
  DispatchRegister(on_request_hello_get, "/hello", HTTP_GET);
  DispatchRegister(on_request_v1_hello_post, "/v1/hello", HTTP_POST);

  http_listen(DEFAULT_PORT, NULL, .on_request = DispatchOnRequest, .log = 1);
  fio_start(.threads = DEFAULT_THREADS);
  fiobj_free(HTTP_HEADER_X_DATA);
}

