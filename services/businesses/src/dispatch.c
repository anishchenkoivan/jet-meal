#include "dispatch.h"

#include "fiobj_hash.h"
#include "fiobject.h"

#include "config.h"

#include <assert.h>

typedef void (*on_request_callback_t)(http_s *request);

typedef struct handler_s {
  on_request_callback_t on_request[HTTP_METHODS_COUNT];
} handler_t;

typedef struct dispatcher_s {
  FIOBJ handlers;
} dispatcher_t;

static handler_t g_handlers_buffer[MAX_HANDLERS];
static size_t g_handlers_count = 0;

static dispatcher_t g_di;

static void InitGlobalDispatcherIfNeeded() {
  if (FIOBJ_IS_NULL(g_di.handlers)) {
    g_di.handlers = fiobj_hash_new();
  }
}

static size_t GetOrInsertHandler(const char *path) {
  FIOBJ fio_path = fiobj_str_new(path, strlen(path));
  FIOBJ fio_handler_idx = fiobj_hash_get(g_di.handlers, fio_path);
  if (fio_handler_idx != FIOBJ_INVALID) {
    fiobj_free(fio_path);
    size_t handler_idx = fiobj_obj2num(fio_handler_idx);
    assert(handler_idx < g_handlers_count);
    return handler_idx;
  }

  assert(g_handlers_count < MAX_HANDLERS);

  FIOBJ fio_handler_index = fiobj_num_new(g_handlers_count);
  fiobj_hash_set(g_di.handlers, fio_path, fio_handler_index);
  fiobj_free(fio_path);

  for (size_t i = 0; i < HTTP_METHODS_COUNT; ++i) {
    g_handlers_buffer[g_handlers_count].on_request[i] = NULL;
  }

  g_handlers_count += 1;
  return g_handlers_count - 1;
}

static void OnMethodNotFound(http_s *request) {
  static const char *kNotFound = "Method not found";
  http_send_error(request, 404);
  http_send_body(request, kNotFound, strlen(kNotFound));
}

void DispatchRegister(void (*callback)(http_s *), const char *path,
              http_method_t method) {
  InitGlobalDispatcherIfNeeded();

  size_t callback_idx = GetOrInsertHandler(path);
  g_handlers_buffer[callback_idx].on_request[method] = callback;
}

void DispatchOnRequest(http_s *request) {
  if (FIOBJ_IS_NULL(g_di.handlers)) {
    OnMethodNotFound(request);
    return;
  }

  FIOBJ fiobj_handler_idx = fiobj_hash_get(g_di.handlers, request->path);

  if (fiobj_handler_idx == FIOBJ_INVALID) {
    OnMethodNotFound(request);
    return;
  }

  size_t handler_idx = fiobj_obj2num(fiobj_handler_idx);
  assert(handler_idx < g_handlers_count);

  handler_t *handler = g_handlers_buffer + handler_idx;

  for (size_t i = 0; i < HTTP_METHODS_COUNT; ++i) {
    FIOBJ fiobj_method_name =
        fiobj_str_new(http_method_strings[i], strlen(http_method_strings[i]));

    if (fiobj_iseq(fiobj_method_name, request->method)) {
      fiobj_free(fiobj_method_name);
      if (handler->on_request[i] == NULL) {
        OnMethodNotFound(request);
        return;
      }
      handler->on_request[i](request);
      return;
    }

    fiobj_free(fiobj_method_name);
  }
}
