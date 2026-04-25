#include "postgres.h"
#include "codegen_api.h"
#include "config.h"
#include "irepository.h"

#include <assert.h>

#include <libpq-fe.h>

#define FORMAT_TEXT 0
#define FORMAT_BIN 1

static PGconn *init_postgres_conn(const char *dsn) {
  if (dsn == NULL) {
    fprintf(stderr, "Can't connect to postgres with no dsn\n");
    abort();
  }

  PGconn *conn = PQconnectdb(dsn);
  int retries = 0;

  while (PQstatus(conn) != CONNECTION_OK &&
         retries < get_postgres_con_retries()) {
    fprintf(stderr, "Connection attempt %d failed: %s\n", retries + 1,
            PQerrorMessage(conn));
    PQfinish(conn);
    sleep(get_postgres_con_retry_delay_sec());
    conn = PQconnectdb(dsn);
    retries++;
  }

  if (PQstatus(conn) != CONNECTION_OK) {
    fprintf(stderr, "Connection to database failed after %d retries: %s\n",
            get_postgres_con_retry_delay_sec(), PQerrorMessage(conn));
    PQfinish(conn);
    abort();
  }

  return conn;
}

static PGconn *business_repo_get_connection(void *self) {
  assert(self);
  PGconn *conn = ((postgres_businesses_repository_t *)self)->conn;
  assert(conn != NULL);
  return conn;
}

static PGconn *meals_repo_get_connection(void *self) {
  assert(self);
  PGconn *conn = ((postgres_meals_repository_t *)self)->conn;
  assert(conn);
  return conn;
}

size_t insert_business(void *self, api_gen_business_t *business) {
  const char *query = "INSERT INTO businesses (business_name, owner_user_id, "
                      "description, business_logo_url) "
                      "VALUES ($1, $2, $3, $4) RETURNING id";

  const char *params[] = {business->businessName, business->ownerUserId,
                          business->description, business->businessLogoUrl};
  PGconn *conn = business_repo_get_connection(self);

  PGresult *res =
      PQexecParams(conn, query, sizeof(params) / sizeof(const char *), NULL,
                   params, NULL, NULL, FORMAT_TEXT);

  if (PQresultStatus(res) != PGRES_TUPLES_OK) {
    fprintf(stderr, "INSERT business failed: %s\n", PQerrorMessage(conn));
    PQclear(res);
    return DB_ERROR;
  }

  size_t id = (size_t)atol(PQgetvalue(res, 0, 0));
  PQclear(res);
  return id;
}

size_t update_business(void *self, size_t business_id,
                       api_gen_business_t *business) {
  const char *query =
      "UPDATE businesses SET business_name = $1, owner_user_id = $2, "
      "description = $3, business_logo_url = $4 WHERE id = $5";

  char id_str[ID_LEN];
  snprintf(id_str, sizeof(id_str), "%zu", business_id);

  const char *params[] = {business->businessName, business->ownerUserId,
                          business->description, business->businessLogoUrl,
                          id_str};

  PGconn *conn = business_repo_get_connection(self);
  PGresult *res =
      PQexecParams(conn, query, sizeof(params) / sizeof(const char *), NULL,
                   params, NULL, NULL, FORMAT_TEXT);

  if (PQresultStatus(res) != PGRES_COMMAND_OK) {
    fprintf(stderr, "UPDATE business failed: %s\n", PQerrorMessage(conn));
    PQclear(res);
    return DB_ERROR;
  }

  char *tuples_affected = PQcmdTuples(res);
  int rows_updated =
      (tuples_affected && *tuples_affected) ? atoi(tuples_affected) : 0;

  PQclear(res);
  return rows_updated;
}

size_t delete_business(void *self, size_t business_id) {
  const char *query = "DELETE FROM businesses WHERE id = $1";

  char id_str[ID_LEN];
  snprintf(id_str, sizeof(id_str), "%zu", business_id);

  const char *params[] = {id_str};

  PGconn *conn = business_repo_get_connection(self);
  PGresult *res = PQexecParams(conn, query, 1, NULL, params, NULL, NULL, 0);

  if (PQresultStatus(res) != PGRES_COMMAND_OK) {
    fprintf(stderr, "DELETE business failed: %s\n", PQerrorMessage(conn));
    PQclear(res);
    return DB_ERROR;
  }

  char *tuples_affected = PQcmdTuples(res);
  int rows_deleted =
      (tuples_affected && *tuples_affected) ? atoi(tuples_affected) : 0;

  PQclear(res);
  return rows_deleted;
}

api_gen_business_t get_business(void *self, size_t business_id) {
  const char *query =
      "SELECT id, business_name, owner_user_id, description, business_logo_url "
      "FROM businesses WHERE id = $1";

  char id_str[ID_LEN];
  snprintf(id_str, sizeof(id_str), "%zu", business_id);

  const char *params[] = {id_str};

  PGconn *conn = business_repo_get_connection(self);
  PGresult *res =
      PQexecParams(conn, query, 1, NULL, params, NULL, NULL, FORMAT_TEXT);

  if (PQresultStatus(res) != PGRES_TUPLES_OK) {
    fprintf(stderr, "SELECT business failed: %s\n", PQerrorMessage(conn));
    PQclear(res);
    api_gen_business_t res = {NULL};
    return res;
  }

  int nrows = PQntuples(res);
  if (nrows == 0) {
    PQclear(res);
    api_gen_business_t res = {NULL};
    return res;
  }

  api_gen_business_t business;

  business.businessId = strdup(PQgetvalue(res, 0, 0));
  business.businessName = strdup(PQgetvalue(res, 0, 1));
  business.ownerUserId = strdup(PQgetvalue(res, 0, 2));
  business.description = strdup(PQgetvalue(res, 0, 3));
  business.businessLogoUrl = strdup(PQgetvalue(res, 0, 4));

  PQclear(res);
  return business;
}

size_t insert_meal(void *self, size_t business_id, api_gen_meal_t *meal) {
  const char *query = "INSERT INTO meals (business_id, meal_name, "
                      "meal_description, meal_picture_url) "
                      "VALUES ($1, $2, $3, $4) RETURNING id";

  char business_id_str[ID_LEN];
  snprintf(business_id_str, sizeof(business_id_str), "%zu", business_id);

  const char *params[] = {business_id_str, meal->mealName,
                          meal->mealDescription, meal->mealPictureUrl};

  PGconn *conn = meals_repo_get_connection(self);
  PGresult *res =
      PQexecParams(conn, query, sizeof(params) / sizeof(const char *), NULL,
                   params, NULL, NULL, FORMAT_TEXT);

  if (PQresultStatus(res) != PGRES_TUPLES_OK) {
    fprintf(stderr, "INSERT meal failed: %s\n", PQerrorMessage(conn));
    PQclear(res);
    return -1;
  }

  size_t id = (size_t)atol(PQgetvalue(res, 0, 0));
  PQclear(res);
  return id;
}

size_t delete_meal(void *self, size_t business_id, size_t meal_id) {
  const char *query = "DELETE FROM meals WHERE id = $1 AND business_id = $2";

  char meal_id_str[ID_LEN];
  char business_id_str[ID_LEN];
  snprintf(meal_id_str, sizeof(meal_id_str), "%zu", meal_id);
  snprintf(business_id_str, sizeof(business_id_str), "%zu", business_id);

  const char *params[2] = {meal_id_str, business_id_str};

  PGconn *conn = meals_repo_get_connection(self);
  PGresult *res =
      PQexecParams(conn, query, 2, NULL, params, NULL, NULL, FORMAT_TEXT);

  if (PQresultStatus(res) != PGRES_COMMAND_OK) {
    fprintf(stderr, "DELETE meal failed: %s\n", PQerrorMessage(conn));
    PQclear(res);
    return false;
  }
  PQclear(res);
  return true;
}

void postgres_aply_migration(const char *dsn) {
  PGconn *conn = init_postgres_conn(dsn);

  const char *migrations[] = {"CREATE TABLE IF NOT EXISTS businesses ("
                              "    id                SERIAL PRIMARY KEY,"
                              "    business_name     TEXT NOT NULL,"
                              "    owner_user_id     TEXT NOT NULL,"
                              "    description       TEXT,"
                              "    business_logo_url TEXT"
                              ");",

                              "CREATE TABLE IF NOT EXISTS meals ("
                              "    id                 SERIAL PRIMARY KEY,"
                              "    business_id        INTEGER NOT NULL "
                              "REFERENCES businesses(id) ON DELETE CASCADE,"
                              "    meal_name          TEXT NOT NULL,"
                              "    meal_description   TEXT,"
                              "    meal_picture_url   TEXT"
                              ");"};

  for (int version = 0; version < sizeof(migrations) / sizeof(const char *);
       ++version) {
    PGresult *res = PQexecParams(conn, migrations[version], 0, NULL, NULL, NULL,
                                 NULL, FORMAT_BIN);
    if (PQresultStatus(res) != PGRES_COMMAND_OK) {
      fprintf(stderr, "Failed to apply migration v%d\n", version + 1);
      PQclear(res);
      abort();
    }
    PQclear(res);
  }

  PQfinish(conn);
}

postgres_businesses_repository_t
init_postgres_businesses_repository(const char *dsn) {
  ibusinesses_repository_vtable_t vtable = {.insert_business = insert_business,
                                            .update_business = update_business,
                                            .delete_business = delete_business,
                                            .get_business = get_business};
  postgres_businesses_repository_t res = {.vtable = vtable,
                                          .conn = init_postgres_conn(dsn)};
  return res;
}

void cleanup_postgres_business_repository(
    postgres_businesses_repository_t *repo) {
  PQfinish(repo->conn);
}

postgres_meals_repository_t init_postgres_meals_repository(const char *dsn) {
  imeals_repository_vtable_t vtable = {.insert_meal = insert_meal,
                                       .delete_meal = delete_meal};
  postgres_meals_repository_t res = {.vtable = vtable,
                                     .conn = init_postgres_conn(dsn)};
  return res;
}

void cleanup_postgres_meals_repository(postgres_meals_repository_t *repo) {
  PQfinish(repo->conn);
}
