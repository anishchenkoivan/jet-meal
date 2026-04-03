#include <cstdlib>
#include <iostream>
#include <mutex>
#include <string>
#include <map>

#include <crow.h>

#include "config.h"
#include "crow/json.h"
#include "db.h"
#include "interpreter.h"
#include "row.h"
#include "rowset.h"

namespace {

crow::json::wvalue row_to_json(const shdb::Row &row) {
  std::vector<crow::json::wvalue> arr;

  for (size_t i = 0; i < row.size(); ++i) {
    std::visit(
        [&arr](const auto &value) {
          using Type = std::remove_cvref_t<decltype(value)>;

          if constexpr (std::is_same_v<Type, shdb::Null>) {
            arr.push_back(nullptr);
          } else {
            arr.push_back(value);
          }
        },
        row[i]);
  }

  return arr;
}

size_t GetFrameCountSetting() {
  const char *frames_env = std::getenv(kFrameCountEnv);
  if (!frames_env) {
    std::cerr << "Error: SHDB_FRAMES environment variable not set.\n";
    std::exit(1);
  }
  return std::stoi(frames_env);
}

size_t GetListenPort() {
  const char *port_env = std::getenv(kPortEnv);
  if (!port_env) {
    return kDefaultPort;
  }
  return std::stoi(port_env);
}

std::string GetDataPath() {
  const char *data_path = std::getenv(kDataPathEnv);
  if (!data_path) {
    return kDefaultDataPath;
  }
  return data_path;
}

bool IsValidDbName(const std::string &name) {
  for (char c : name) {
    bool isAllowed = (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') ||
                     (c >= '0' && c <= '9') || c == '_';
    if (!isAllowed) {
      return false;
    }
  }

  return true;
}

std::string GetDbPath(const std::string &name) {
  return GetDataPath() + "/" + name;
}

class DbLocks {
public:
  std::lock_guard<std::mutex> LockDb(const std::string &name) {
    std::lock_guard<std::mutex> operation_lock(hashmap_lock_);
    std::mutex &mtx = db_name_to_lock[name];
    return std::lock_guard<std::mutex>(mtx);
  }

private:
  std::mutex hashmap_lock_;
  std::map<std::string, std::mutex> db_name_to_lock;
};

} // namespace

int main() {
  size_t frame_count = GetFrameCountSetting();
  crow::SimpleApp app;
  DbLocks locks;

  CROW_ROUTE(app, "/sql-query")
      .methods(crow::HTTPMethod::POST)([&](const crow::request &req) {
        auto db_path_it = req.headers.find("X-DB-Name");
        if (db_path_it == req.headers.end() || db_path_it->second.empty()) {
          return crow::response(400, "Missing or empty X-DB-Name header");
        }

        std::string db_name = db_path_it->second;

        if (!IsValidDbName(db_name)) {
          return crow::response(400, "Invalid db name in X-DB-Name header");
        }

        std::string db_path = GetDbPath(db_name);

        const auto &query = req.body;

        try {
          auto db = shdb::Connect(db_path, frame_count);
          shdb::Interpreter interpreter(db);

          shdb::RowSet rowset;
          {
            auto db_lock = locks.LockDb(db_name);
            rowset = interpreter.Execute(query);
          }

          crow::json::wvalue result;

          std::vector<crow::json::wvalue> rows_list;
          for (const auto &row : rowset.GetRows()) {
            rows_list.push_back(row_to_json(row));
          }
          result["data"] = std::move(rows_list);

          return crow::response(200, result.dump());
        } catch (const std::exception &e) {
          return crow::response(500,
                                std::string("Database error: ") + e.what());
        }
      });

  app.port(GetListenPort()).multithreaded().run();
}
