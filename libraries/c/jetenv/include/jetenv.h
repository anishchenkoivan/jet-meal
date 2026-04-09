#ifndef JETENV_H
#define JETENV_H

#ifdef __cplusplus
extern "C" {
#endif

const char* GetEnvString(const char* name, const char* default_value);

int GetEnvInt(const char* name, int default_value);

#define JETENV_REGISTER_STRING(getter_name, env_name, default_value) \
  static const char* getter_name() { \
    return GetEnvString(env_name, default_value); \
  }

#define JETENV_REGISTER_INT(getter_name, env_name, default_value) \
  static int getter_name() { \
    return GetEnvInt(env_name, default_value); \
  }

#ifdef __cplusplus
} // extern "C"
#endif

#endif // #ifndef JETENV_H
