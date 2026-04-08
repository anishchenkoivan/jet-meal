#include "jetenv.h"

#include <stdlib.h>

const char* GetEnvString(const char* name, const char* default_value) {
  const char* value = getenv(name);

  if (!value)
    return default_value;

  return value;
}

int GetEnvInt(const char* name, int default_value) {
  const char* value = getenv(name);

  if (!value)
    return default_value;

  return atoi(value);
}

