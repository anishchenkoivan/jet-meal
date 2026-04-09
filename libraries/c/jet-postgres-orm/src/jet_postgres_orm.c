#include <libpq-fe.h>

#include "jet_postgres_orm.h"
#include "jet_orm.h"

static jet_orm_status_t db_connect(jet_orm_conn_ptr_t conn, jet_orm_dsn_ptr_t dsn) {
  *(jet_postgres_orm_conn_ptr_t)conn = PQconnectdb(((jet_postgres_orm_dsn_ptr_t)dsn)->conn_info);

  if (*(jet_postgres_orm_conn_ptr_t)conn == NULL) {
    return JET_ORM_STATUS_DB_ERROR;
  }
  return JET_ORM_STATUS_OK;
}

static jet_orm_status_t query(jet_orm_conn_ptr_t conn, jet_orm_rowset_ptr_t out, const char *query, ...) {
  PGresult *res = PQexecParams(
      *(jet_postgres_orm_conn_ptr_t)conn,
      query,
      0, // nParams
      NULL,
      NULL,
      NULL,
      NULL,
      1 // Binary result format
  );

  if (PQresultStatus(res) == PGRES_FATAL_ERROR)
    return JET_ORM_STATUS_DB_ERROR;

  *(jet_postgres_orm_rowset_ptr_t)out = res;
  return JET_ORM_STATUS_OK;
}

static jet_orm_status_t get_row(jet_orm_rowset_ptr_t rowset, size_t idx) {
  return JET_ORM_STATUS_NOT_IMPLEMENTED;
}

static jet_orm_status_t get_field_bool(jet_orm_row_ptr_t row, size_t idx, bool* out) {
  return JET_ORM_STATUS_NOT_IMPLEMENTED;
}

static jet_orm_status_t get_field_uint64(jet_orm_row_ptr_t row, size_t idx, uint64_t* out) {
  return JET_ORM_STATUS_NOT_IMPLEMENTED;
}

static jet_orm_status_t get_field_int64(jet_orm_row_ptr_t row, size_t idx, int64_t* out) {
  return JET_ORM_STATUS_NOT_IMPLEMENTED;
}

static jet_orm_status_t get_field_string(jet_orm_row_ptr_t row, size_t idx, char* out, size_t buffer_size) {
  return JET_ORM_STATUS_NOT_IMPLEMENTED;
}

void jet_postgres_orm_init_driver(jet_orm_db_driver_vtable_t* vtable) {
  vtable->db_connect = db_connect;
  vtable->query = query;
  vtable->get_row = get_row;
  vtable->get_field_bool = get_field_bool;
  vtable->get_field_uint64 = get_field_uint64;
  vtable->get_field_int64 = get_field_int64;
  vtable->get_field_string = get_field_string;
}

