#pragma once

#include <jetenv.h>

JETENV_REGISTER_STRING(get_postgres_dsn, "BILLING_POSTGRES_DSN", "host=localhost port=5432 dbname=billing user=postgres password=")
JETENV_REGISTER_INT(get_port, "BILLING_PORT", 8080)
