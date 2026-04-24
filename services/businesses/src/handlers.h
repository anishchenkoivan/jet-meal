#ifndef HANDLERS_H
#define HANDLERS_H

#include "http.h"

#define HTTP_NO_CONTENT 204
#define HTTP_INVALID_REQUEST 400
#define HTTP_NOT_FOUND 404
#define HTTP_INTERNAL_SERVER_ERROR 500

void init_handlers_global_state();

void v1_create_business_callback(http_s *request);

void v1_update_business_callback(http_s *request);

void v1_delete_business_callback(http_s *request);

void v1_get_business_callback(http_s *request);

#endif // #ifndef HANDLERS_H
