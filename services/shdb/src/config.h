#pragma once

constexpr const char* kFrameCountEnv = "SHDB_FRAMES";
constexpr const char* kPortEnv = "SHDB_PORT";
constexpr const char* kDataPathEnv = "SHDB_DATA_PATH";
constexpr const char* kEnableGilEnv = "SHDB_ENABLE_GIL";

constexpr int kDefaultPort = 8080;
constexpr const char* kDefaultDataPath = "/var/lib/shdb/data";
constexpr bool kDefaultEnableGil = true;
