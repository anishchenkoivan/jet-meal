#include <cstdint>
#include <cstdlib>
#include <iostream>
#include <string>

#include <crow.h>
#include <variant>

#include "config.h"
#include "crow/json.h"
#include "db.h"
#include "interpreter.h"
#include "row.h"

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

int main() {
  size_t frame_count = GetFrameCountSetting();
  crow::SimpleApp app;

  CROW_ROUTE(app, "/sql-query")
      .methods(crow::HTTPMethod::POST)([frame_count](const crow::request &req) {
        auto db_path_it = req.headers.find("X-DB-Name");
        if (db_path_it == req.headers.end() || db_path_it->second.empty()) {
          return crow::response(400, "Missing or empty X-DB-Name header");
        }
        std::string db_path = db_path_it->second;

        const auto &query = req.body;

        try {
          auto db = shdb::Connect(db_path, frame_count);
          shdb::Interpreter interpreter(db);
          auto rowset = interpreter.Execute(query);

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
