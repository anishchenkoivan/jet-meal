#ifndef CONFIG_H
#define CONFIG_H

#include "fio.h"

#include "jetenv.h"

JETENV_REGISTER_STRING(get_service_port, "BUSINESSES_PORT", "8080");
JETENV_REGISTER_INT(get_service_threads, "BUSINESSES_THREADS", 10);
JETENV_REGISTER_STRING(get_postgres_dsn, "BUSINESSES_POSTGRES_DSN", NULL);
JETENV_REGISTER_INT(get_postgres_con_retries, "BUSINESSES_POSTGRES_CON_RETRIES", 10);
JETENV_REGISTER_INT(get_postgres_con_retry_delay_sec, "BUSINESSES_POSTGRES_CON_RETRY_DELAY_SEC", 2);

#define LOG_LEVEL FIO_LOG_LEVEL_INFO

#define ID_LEN 21 // max size_t str len

#endif // #ifndef CONFIG_H
