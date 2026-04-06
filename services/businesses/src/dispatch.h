#ifndef DISPATCH_H
#define DISPATCH_H

#include "fiobj_hash.h"
#include "http.h"

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

void DispatchRegister(void (*callback)(http_s *), const char *path, http_method_t method);

void DispatchOnRequest(http_s *request);

#endif // #ifndef DISPATCH_H
