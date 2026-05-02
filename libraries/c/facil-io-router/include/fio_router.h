#ifndef FIO_ROUTER_H
#define FIO_ROUTER_H

#include "http.h"

#include <stdbool.h>

typedef enum http_method_e {
  HTTP_GET,
  HTTP_POST,
  HTTP_PUT,
  HTTP_DELETE,
  HTTP_PATCH,
  HTTP_HEAD,
  HTTP_METHODS_COUNT
} http_method_t;

static const char *http_method_strings[] = {
  "GET",
  "POST",
  "PUT",
  "DELETE",
  "PATCH",
  "HEAD"
};

void fio_router_register_midleware(bool (*callback)(http_s *));

void fio_router_register_callback(void (*callback)(http_s *), const char *path, http_method_t method);

void fio_router_on_request_route(http_s *request);

#endif // #ifndef FIO_ROUTER_H
