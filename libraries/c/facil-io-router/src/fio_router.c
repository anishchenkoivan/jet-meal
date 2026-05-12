#include "fio_router.h"

#include "config.h"

#include "fiobj_hash.h"
#include "fiobject.h"

#include <stdio.h>
#include <pthread.h>
#include <assert.h>

typedef void (*on_request_callback_t)(http_s* request);
typedef bool (*midleware_t)(http_s* request);

typedef struct handler_s {
    on_request_callback_t on_request[HTTP_METHODS_COUNT];
} handler_t;

typedef struct dispatcher_s {
    FIOBJ handlers;
} dispatcher_t;

static handler_t g_handlers_buffer[HANDLERS_BUFFER_SIZE];
static size_t g_handlers_count = 0;
static dispatcher_t g_di;
static pthread_mutex_t g_register_lock;
static pthread_once_t g_pthread_init_control = PTHREAD_ONCE_INIT;
static midleware_t g_middleware = NULL;

void check_ok(size_t code) {
    if (code != 0)
        abort();
}

static void fio_router_init_global_dispatcher() {
    pthread_mutex_init(&g_register_lock, NULL);
    g_di.handlers = fiobj_hash_new();
}

static size_t fio_router_new_or_existent_callback_index(const char* path) {
    FIOBJ fio_path = fiobj_str_new(path, strlen(path));
    FIOBJ fio_handler_idx = fiobj_hash_get(g_di.handlers, fio_path);
    if (fio_handler_idx != FIOBJ_INVALID) {
        fiobj_free(fio_path);
        size_t handler_idx = fiobj_obj2num(fio_handler_idx);
        assert(handler_idx < g_handlers_count);
        return handler_idx;
    }

    assert(g_handlers_count < HANDLERS_BUFFER_SIZE);

    FIOBJ fio_handler_index = fiobj_num_new(g_handlers_count);
    fiobj_hash_set(g_di.handlers, fio_path, fio_handler_index);
    fiobj_free(fio_path);

    for (size_t i = 0; i < HTTP_METHODS_COUNT; ++i) {
        g_handlers_buffer[g_handlers_count].on_request[i] = NULL;
    }

    ++g_handlers_count;
    return g_handlers_count - 1;
}

static void fio_router_on_route_not_found(http_s* request) {
    http_send_error(request, 404);
}

static void fio_router_on_method_not_allowed(http_s* request) {
    http_send_error(request, 405);
}

void fio_router_register_midleware(bool (*callback)(http_s *)) {
    pthread_mutex_lock(&g_register_lock);
    g_middleware = callback;
    pthread_mutex_unlock(&g_register_lock);
}

void fio_router_register_callback(void (*callback)(http_s*), const char* path,
                                  http_method_t method) {
    pthread_once(&g_pthread_init_control, fio_router_init_global_dispatcher);

    pthread_mutex_lock(&g_register_lock);
    size_t callback_idx = fio_router_new_or_existent_callback_index(path);
    g_handlers_buffer[callback_idx].on_request[method] = callback;
    pthread_mutex_unlock(&g_register_lock);
}

void fio_router_on_request_route(http_s* request) {
    if (FIOBJ_IS_NULL(g_di.handlers)) {
        // Internal service error, not initialized yet
        http_send_error(request, 500);
        return;
    }

    FIOBJ fiobj_handler_idx = fiobj_hash_get(g_di.handlers, request->path);

    if (fiobj_handler_idx == FIOBJ_INVALID) {
        // Route not found
        http_send_error(request, 404);
        return;
    }

    size_t handler_idx = fiobj_obj2num(fiobj_handler_idx);
    assert(handler_idx < g_handlers_count);

    handler_t* handler = g_handlers_buffer + handler_idx;

    for (size_t i = 0; i < HTTP_METHODS_COUNT; ++i) {
        FIOBJ fiobj_method_name =
            fiobj_str_new(http_method_strings[i], strlen(http_method_strings[i]));

        if (fiobj_iseq(fiobj_method_name, request->method)) {
            fiobj_free(fiobj_method_name);
            if (handler->on_request[i] == NULL) {
                // Method not allowed
                http_send_error(request, 405);
                return;
            }
            if (g_middleware) {
                bool abort = g_middleware(request);
                if (abort)
                    return;
            }
            handler->on_request[i](request);
            return;
        }

        fiobj_free(fiobj_method_name);
    }
}
