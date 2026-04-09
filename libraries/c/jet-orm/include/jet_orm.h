#ifndef JET_ORM_H
#define JET_ORM_H

#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>

typedef void* jet_orm_dsn_ptr_t;
typedef void* jet_orm_conn_ptr_t;
typedef void* jet_orm_rowset_ptr_t;
typedef void* jet_orm_row_ptr_t;

typedef enum {
  JET_ORM_STATUS_OK = 0,
  JET_ORM_STATUS_DB_ERROR,
  JET_ORM_STATUS_NOT_IMPLEMENTED
} jet_orm_status_t;

typedef struct {
  jet_orm_status_t (*db_connect)(jet_orm_conn_ptr_t, jet_orm_dsn_ptr_t);
  jet_orm_status_t (*query)(jet_orm_conn_ptr_t, jet_orm_rowset_ptr_t out, const char *query, ...);
  jet_orm_status_t (*get_row)(jet_orm_rowset_ptr_t, size_t idx);

  jet_orm_status_t (*get_field_bool)(jet_orm_row_ptr_t, size_t idx, bool* out);
  jet_orm_status_t (*get_field_uint64)(jet_orm_row_ptr_t, size_t idx, uint64_t* out);
  jet_orm_status_t (*get_field_int64)(jet_orm_row_ptr_t, size_t idx, int64_t* out);
  jet_orm_status_t (*get_field_string)(jet_orm_row_ptr_t, size_t idx, char* out, size_t buffer_size);
} jet_orm_db_driver_vtable_t;

#endif // #ifndef JET_ORM_H
