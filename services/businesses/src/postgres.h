#ifndef POSTGRES_H
#define POSTGRES_H

#include "irepository.h"

#include <libpq-fe.h>

typedef struct postgres_businesses_repository_s {
  ibusinesses_repository_vtable_t vtable;
  PGconn *conn;
} postgres_businesses_repository_t;

typedef struct postgres_meals_repository_s {
  imeals_repository_vtable_t vtable;
  PGconn *conn;
} postgres_meals_repository_t;

postgres_businesses_repository_t
init_postgres_businesses_repository(const char *dsn);

void cleanup_postgres_business_repository(postgres_businesses_repository_t *);

postgres_meals_repository_t init_postgres_meals_repository(const char *dsn);

void cleanup_postgres_meals_repository(postgres_meals_repository_t *);

#endif // #ifndef POSTGRES_H
