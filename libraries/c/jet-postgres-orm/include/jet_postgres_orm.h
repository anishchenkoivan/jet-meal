#ifndef JET_POSTGRES_ORM_H
#define JET_POSTGRES_ORM_H

#include "jet_orm.h"

#include <libpq-fe.h>

typedef struct {
  const char* conn_info;
} jet_postgres_orm_dsn_t;

typedef PGconn*   jet_postgres_orm_conn_t;
typedef PGresult* jet_postgres_orm_rowset_t;

typedef jet_postgres_orm_dsn_t*    jet_postgres_orm_dsn_ptr_t;
typedef jet_postgres_orm_conn_t*   jet_postgres_orm_conn_ptr_t;
typedef jet_postgres_orm_rowset_t* jet_postgres_orm_rowset_ptr_t;
typedef void* jet_postgres_orm_row_ptr_t;

void jet_postgres_orm_init_driver(jet_orm_db_driver_vtable_t*);

#endif // #ifndef JET_POSTGRES_ORM_H
